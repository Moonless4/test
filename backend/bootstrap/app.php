<?php

use App\Http\Middleware\EnforceTrustedHost;
use App\Http\Middleware\RejectForeignOrigin;
use App\Http\Middleware\SecurityHeaders;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        // Every route file is versioned from the start: /api/v1/...
        apiPrefix: 'api/v1',
        commands: __DIR__.'/../routes/console.php',
        // Laravel's own health route. Nothing in the application serves it, so it can never
        // report state that a controller invented.
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        // DirectAdmin runs Apache or LiteSpeed in front of PHP: TLS is terminated there and the
        // real client address arrives in X-Forwarded-*. TRUST_PROXIES is `*` only because the
        // application is reachable solely through that web server; a host with a load balancer
        // sets the balancer's address instead.
        $proxies = env('TRUST_PROXIES');

        if (is_string($proxies) && $proxies !== '') {
            $middleware->trustProxies(
                at: $proxies === '*' ? '*' : explode(',', $proxies),
                // X-Forwarded-Host is deliberately not trusted: the Host header is checked
                // against the allowlist instead of being taken from a header a client can set.
                headers: Request::HEADER_X_FORWARDED_FOR
                    | Request::HEADER_X_FORWARDED_PROTO
                    | Request::HEADER_X_FORWARDED_PORT
                    | Request::HEADER_X_FORWARDED_PREFIX,
            );
        }

        // Both run before routing, so a request for the wrong domain, or a write coming from a
        // foreign page, never reaches a controller.
        $middleware->api(prepend: [
            EnforceTrustedHost::class,
            RejectForeignOrigin::class,
        ]);

        // Headers are applied to every response, health route included.
        $middleware->append(SecurityHeaders::class);

        // The named limiter defined in AppServiceProvider; every API route is capped.
        $middleware->throttleApi('api');
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->shouldRenderJsonWhen(
            fn (Request $request) => $request->is('api/*') || $request->expectsJson(),
        );

        // A wrong password, a rejected policy or a failed validation is a normal event, not a
        // bug: reporting them would bury real errors in the log (and they are logged as security
        // events by App\Services\AuditLogger where that matters).
        $exceptions->dontReport([
            AuthenticationException::class,
            AuthorizationException::class,
            ValidationException::class,
            ModelNotFoundException::class,
        ]);

        // Nothing here renders a stack trace: with APP_DEBUG=false Laravel answers a handled
        // exception with a short JSON body, and the detail goes to the log file only. Domain
        // exceptions add their own `render()` method (see App\Exceptions).
    })
    ->create();
