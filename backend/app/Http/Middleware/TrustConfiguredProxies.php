<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Middleware\TrustProxies;
use Illuminate\Http\Request;

/**
 * Whose `X-Forwarded-*` headers are believed (`TRUST_PROXIES` → config/security.php).
 *
 * Replaces Laravel's own `TrustProxies` instead of configuring it from `bootstrap/app.php`, because
 * that callback runs *before* the configuration is loaded — neither `config()` nor `env()` sees the
 * host's value there, and `env()` would additionally return null once `php artisan optimize` has
 * cached the configuration, silently turning a host's setting off. Reading it per request keeps the
 * setting honest whether or not the config is cached.
 *
 * Nothing is trusted unless a host named a real proxy. That is the correct default on the target
 * platform: DirectAdmin serves PHP itself, so `REMOTE_ADDR` already holds the client address and
 * `X-Forwarded-For` is only a header the caller chose. Believing it would let any client pick its
 * own address — and the login lockout, the per-IP rate limits and the sign-in monitoring are all
 * keyed on that address.
 *
 * `X-Forwarded-Host` is never trusted, in any configuration: the Host header is checked against the
 * allowlist (`EnforceTrustedHost`) rather than taken from a header a client can set.
 */
class TrustConfiguredProxies extends TrustProxies
{
    public function handle(Request $request, Closure $next)
    {
        $this->headers = Request::HEADER_X_FORWARDED_FOR
            | Request::HEADER_X_FORWARDED_PROTO
            | Request::HEADER_X_FORWARDED_PORT
            | Request::HEADER_X_FORWARDED_PREFIX;

        $this->proxies = $this->configuredProxies();

        return parent::handle($request, $next);
    }

    /**
     * The configured proxies: the explicit `*`, the host's list, or nobody at all (null), which
     * leaves the request with an empty trusted-proxy set — i.e. every forwarding header ignored.
     *
     * @return array<int, string>|string|null
     */
    private function configuredProxies(): array|string|null
    {
        if (config('security.trust_any_proxy')) {
            return '*';
        }

        $proxies = (array) config('security.trust_proxies');

        return $proxies === [] ? null : $proxies;
    }
}
