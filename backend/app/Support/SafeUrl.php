<?php

namespace App\Services\Security;

use App\Exceptions\UnsafeUrlException;
use Illuminate\Support\Str;

/**
 * The guard every server-side outbound request must pass.
 *
 * A backend that fetches a URL a client supplied is an SSRF primitive: `http://169.254.169.254/`
 * reaches cloud metadata, `http://127.0.0.1:8000/` reaches the application's own admin surface,
 * and `http://10.0.0.5/` reaches another tenant's box on the same host. Nothing in this codebase
 * fetches a client-supplied URL today — the only outbound calls are the payment gateway and
 * (optionally) Turnstile, both to fixed hosts — and this class exists so that stays true: a future
 * feature that does fetch one has to come through here.
 *
 * Rules, in order:
 *  1. scheme must be http or https (no file, ftp, gopher, data…);
 *  2. the host must resolve, and *every* address it resolves to must be public — a name that
 *     resolves to both a public and a private address is refused, because the second lookup
 *     (what the HTTP client actually does) could pick either;
 *  3. an allowlist may narrow hosts further (`OUTBOUND_ALLOWED_HOSTS`).
 */
final class SafeUrl
{
    /**
     * @throws UnsafeUrlException
     */
    public static function assertAllowed(string $url): void
    {
        $parts = parse_url(trim($url));

        if ($parts === false || ! isset($parts['scheme'], $parts['host'])) {
            throw new UnsafeUrlException('The address is not a complete URL.');
        }

        $scheme = mb_strtolower((string) $parts['scheme']);

        if (! in_array($scheme, ['http', 'https'], true)) {
            throw new UnsafeUrlException("The scheme \"{$scheme}\" is not allowed.");
        }

        $host = trim((string) $parts['host'], '[]');

        if ($host === '') {
            throw new UnsafeUrlException('The address has no host.');
        }

        self::assertHostAllowed($host);

        foreach (self::resolve($host) as $address) {
            if (self::isPrivateAddress($address)) {
                throw new UnsafeUrlException('The host resolves to a private or reserved address.');
            }
        }
    }

    /**
     * @throws UnsafeUrlException
     */
    private static function assertHostAllowed(string $host): void
    {
        /** @var array<int, string> $allowed */
        $allowed = (array) config('security.outbound.allowed_hosts', []);

        if ($allowed === []) {
            return;
        }

        $host = mb_strtolower($host);

        foreach ($allowed as $entry) {
            $entry = mb_strtolower(trim((string) $entry));

            if ($entry === '') {
                continue;
            }

            // A leading dot matches the domain and its subdomains, like security.trusted_hosts.
            if ($host === ltrim($entry, '.') || (str_starts_with($entry, '.') && str_ends_with($host, $entry))) {
                return;
            }
        }

        throw new UnsafeUrlException('The host is not in the outbound allowlist.');
    }

    /**
     * @return array<int, string>
     */
    private static function resolve(string $host): array
    {
        if (filter_var($host, FILTER_VALIDATE_IP) !== false) {
            return [$host];
        }

        $addresses = [];

        // Both families: an AAAA-only host must not slip past a check that only looked at A records.
        foreach ([DNS_A, DNS_AAAA] as $type) {
            $records = @dns_get_record($host, $type);

            if (! is_array($records)) {
                continue;
            }

            foreach ($records as $record) {
                $address = $record['ip'] ?? $record['ipv6'] ?? null;

                if (is_string($address) && $address !== '') {
                    $addresses[] = $address;
                }
            }
        }

        if ($addresses === []) {
            // Some hosts run without a working resolver entry for PHP; gethostbyname is the
            // fallback a lot of shared hosting still relies on.
            $fallback = @gethostbyname($host);

            if (is_string($fallback) && $fallback !== $host && filter_var($fallback, FILTER_VALIDATE_IP) !== false) {
                $addresses[] = $fallback;
            }
        }

        if ($addresses === [] && ! (bool) config('security.outbound.allow_private_networks')) {
            throw new UnsafeUrlException('The host does not resolve to a public address.');
        }

        return array_values(array_unique($addresses));
    }

    /**
     * Loopback, link-local, CGNAT, private ranges and the reserved blocks — everything that means
     * "this address is not the public internet".
     */
    public static function isPrivateAddress(string $address): bool
    {
        // An IPv4-mapped IPv6 address (::ffff:127.0.0.1) must be judged as the IPv4 it carries.
        if (Str::startsWith($address, '::ffff:')) {
            $address = mb_substr($address, 7);
        }

        if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_IPV4) !== false) {
            // FILTER_FLAG_NO_PRIV_RANGE also covers 10/8, 172.16/12, 192.168/16; the reserved
            // ranges are checked explicitly because PHP's flag does not include all of them.
            if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                return true;
            }

            return in_array($address, ['0.0.0.0', '100.64.0.1', '192.0.0.1', '198.18.0.1'], true)
                || self::inCidr($address, '100.64.0.0/10')
                || self::inCidr($address, '198.18.0.0/15');
        }

        if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_IPV6) !== false) {
            if (filter_var($address, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                return true;
            }

            return self::inCidr($address, 'fc00::/7') || self::inCidr($address, 'fe80::/10');
        }

        // Not an IP at all: treated as unsafe rather than guessed at.
        return true;
    }

    private static function inCidr(string $address, string $cidr): bool
    {
        [$subnet, $bits] = explode('/', $cidr);
        $bits = (int) $bits;

        $addressBytes = @inet_pton($address);
        $subnetBytes = @inet_pton($subnet);

        if ($addressBytes === false || $subnetBytes === false || strlen($addressBytes) !== strlen($subnetBytes)) {
            return false;
        }

        $wholeBytes = intdiv($bits, 8);
        $remainingBits = $bits % 8;

        if ($wholeBytes > 0 && substr($addressBytes, 0, $wholeBytes) !== substr($subnetBytes, 0, $wholeBytes)) {
            return false;
        }

        if ($remainingBits === 0) {
            return true;
        }

        $mask = 0xFF << (8 - $remainingBits) & 0xFF;

        return (ord($addressBytes[$wholeBytes]) & $mask) === (ord($subnetBytes[$wholeBytes]) & $mask);
    }
}
