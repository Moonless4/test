<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Security headers on every API response. Configured in config/security.php; nothing here is
 * hard-coded so a host can tune it without a code change.
 */
class SecurityHeaders
{
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        $response->headers->set('X-Content-Type-Options', 'nosniff');
        $response->headers->set('X-Frame-Options', (string) config('security.headers.frame_options'));
        $response->headers->set('Referrer-Policy', (string) config('security.headers.referrer_policy'));
        $response->headers->set('Permissions-Policy', (string) config('security.headers.permissions_policy'));
        $response->headers->set('Content-Security-Policy', (string) config('security.headers.csp'));
        $response->headers->set('X-Permitted-Cross-Domain-Policies', (string) config('security.headers.cross_domain_policies'));

        // The framework never needed to advertise itself.
        $response->headers->remove('X-Powered-By');

        // HSTS only over TLS: sending it over plain HTTP is ignored anyway, and it must never be
        // sent while the host is not HTTPS-only.
        if ($request->secure() && config('security.hsts.enabled')) {
            $value = 'max-age='.config('security.hsts.max_age');

            if (config('security.hsts.include_subdomains')) {
                $value .= '; includeSubDomains';
            }

            if (config('security.hsts.preload')) {
                $value .= '; preload';
            }

            $response->headers->set('Strict-Transport-Security', $value);
        }

        // An authenticated or state-changing response must not sit in a shared cache.
        if ($request->user() !== null || ! $request->isMethodSafe()) {
            $response->headers->set('Cache-Control', 'no-store, private');
        }

        return $response;
    }
}
