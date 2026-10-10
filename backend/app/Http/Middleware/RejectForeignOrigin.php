<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * Refuses a state-changing request whose Origin is present but not allowed.
 *
 * The API authenticates with bearer tokens, so CSRF is not the classic cookie-based problem —
 * but a token kept in browser storage can still be replayed by any page that manages to obtain
 * it, and a browser always attaches Origin to a cross-site write. Rejecting a foreign origin is
 * cheap defence in depth (and the second half of the CORS story: CORS decides whether the browser
 * may read the response, this decides whether the write happens at all).
 *
 * Requests without an Origin — curl, the payment gateway's callback, server-to-server jobs — pass
 * through untouched: they still need a valid token to reach a protected route.
 */
class RejectForeignOrigin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! config('security.origin_check.enabled') || $request->isMethodSafe()) {
            return $next($request);
        }

        $origin = $request->headers->get('Origin');

        if ($origin === null || $origin === '') {
            return $next($request);
        }

        $origin = strtolower(rtrim(trim($origin), '/'));

        /** @var array<int, string> $allowed */
        $allowed = array_map(
            static fn ($value) => strtolower(rtrim(trim((string) $value), '/')),
            (array) config('security.allowed_origins'),
        );

        if (in_array($origin, $allowed, true)) {
            return $next($request);
        }

        abort(403, 'Origin not allowed.');
    }
}
