<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Answers 400 when the request's Host header is not in the allowlist, before routing or
 * authentication runs. This is what stops a request that arrives at the origin under somebody
 * else's domain (host-header injection) from being treated as a normal API call — a real risk on
 * shared hosting, where several domains share one IP.
 *
 * The allowlist lives in config/security.php (`TRUSTED_HOSTS`). An empty list disables the check,
 * which is Laravel's default.
 */
class EnforceTrustedHost
{
    public function handle(Request $request, Closure $next): Response
    {
        /** @var array<int, string> $allowed */
        $allowed = (array) config('security.trusted_hosts');

        if (! config('security.enforce_trusted_hosts') || $allowed === []) {
            return $next($request);
        }

        $host = strtolower($request->getHost());

        foreach ($allowed as $entry) {
            $entry = strtolower(trim((string) $entry));

            if ($entry === '') {
                continue;
            }

            if (str_starts_with($entry, '.')) {
                $suffix = substr($entry, 1);

                if ($host === $suffix || str_ends_with($host, '.'.$suffix)) {
                    return $next($request);
                }

                continue;
            }

            if ($host === $entry) {
                return $next($request);
            }
        }

        // Deliberately says nothing about the allowlist.
        abort(400, 'Invalid host.');
    }
}
