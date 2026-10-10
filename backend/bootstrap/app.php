<?php

use App\Http\Middleware\EnforceTrustedHost;
use App\Http\Middleware\RejectForeignOrigin;
use App\Http\Middleware\RequireFullAuthentication;
use App\Http\Middleware\RequireRecentAuth;
use App\Http\Middleware\RequireTwoFactor;
use App\Http\Middleware\SecurityHeaders;
use App\Http\Middleware\TrustConfiguredProxies;
use App\Http\Middleware\VerifyTurnstile;
use App\Http\Middleware\VerifyWebhookSignature;
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
        /*
         * This is an API-only application: there is no `login` route and no browser sign-in page
         * to send a guest to. Laravel 13 sets a default guest redirect of `fn () => route('login')`,
         * and the `Authenticate` middleware resolves it *before* the exception handler runs — so a
         * request without `Accept: application/json` threw `RouteNotFoundException: Route [login]
         * not defined` and was answered with a 500 instead of a 401. Overriding it with a null
         * redirect lets the handler answer 401 (JSON) for the API and 401 (no content) elsewhere.
         * This never weakens a check: `auth:sanctum`, `full-auth`, `two-factor` and the policies
         * still run — only the redirect target changes.
         */
        $middleware->redirectGuestsTo(null);

        /*
         * Reverse-proxy trust (`TRUST_PROXIES` → config/security.php).
         *
         * Replace the framework's TrustProxies rather than configure it from here: this callback
         * runs before the configuration is loaded, so neither `config()` nor `env()` can see the
         * host's value — and `env()` would return null anyway once `php artisan optimize` has
         * cached the configuration. App\Http\Middleware\TrustConfiguredProxies reads the value per
         * request, and trusts nobody unless a host named a real proxy.
         */
        $middleware->replace(
            \Illuminate\Http\Middleware\TrustProxies::class,
            TrustConfiguredProxies::class,
        );

        // Both run before routing, so a request for the wrong domain, or a write coming from a
        // foreign page, never reaches a controller.
        $middleware->api(prepend: [
            EnforceTrustedHost::class,
            RejectForeignOrigin::class,
        ]);

        /*
         * Named middleware for the security phase:
         *
         *  - `two-factor`: an administrator's token must have answered the TOTP challenge.
         *  - `full-auth`: the request carries a finished login, not a token that is still holding a
         *    second-factor step (`twofa:challenge` / `twofa:setup`).
         *  - `recent-auth`: the password was re-entered recently for this token.
         *  - `turnstile`: bot challenge, a pass-through unless TURNSTILE_ENABLED is on.
         *  - `webhook.signature`: HMAC + timestamp + idempotency for inbound gateway notifications.
         */
        $middleware->alias([
            'two-factor' => RequireTwoFactor::class,
            'full-auth' => RequireFullAuthentication::class,
            'recent-auth' => RequireRecentAuth::class,
            'turnstile' => VerifyTurnstile::class,
            'webhook.signature' => VerifyWebhookSignature::class,
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
