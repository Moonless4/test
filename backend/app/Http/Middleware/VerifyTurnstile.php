<?php

namespace App\Http\Middleware;

use App\Support\SafeUrl;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Symfony\Component\HttpFoundation\Response;
use Throwable;

/**
 * Cloudflare Turnstile in front of the endpoints worth automating.
 *
 * Off unless `TURNSTILE_ENABLED` is on *and* a secret is configured, and required on the routes
 * named in `security.turnstile.protect` — deliberately not on every endpoint: a challenge in front
 * of `GET /products` would cost real shoppers real seconds and buy nothing, while login, register
 * and password-reset are where credential stuffing and enumeration live.
 *
 * The verification call goes through App\Support\SafeUrl like every other outbound request, and the
 * failure answer never says *why* it failed (a bot and an expired token get the same 403).
 */
class VerifyTurnstile
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! (bool) config('security.turnstile.enabled')) {
            return $next($request);
        }

        $token = (string) ($request->input('cf_turnstile_token')
            ?: $request->header('CF-Turnstile-Response', ''));

        if (trim($token) === '') {
            return $this->refuse('برای ادامه تأیید امنیتی لازم است.');
        }

        if (! $this->verify($token, $request)) {
            return $this->refuse('تأیید امنیتی ناموفق بود. دوباره تلاش کنید.');
        }

        return $next($request);
    }

    private function verify(string $token, Request $request): bool
    {
        $secret = config('security.turnstile.secret');

        if (! is_string($secret) || $secret === '') {
            // Enabled without a secret means a misconfigured host. Fail closed and say so in the
            // log rather than silently letting everything through.
            Log::warning('Turnstile is enabled but TURNSTILE_SECRET_KEY is not set.');

            return false;
        }

        $url = (string) config('security.turnstile.verify_url');

        try {
            SafeUrl::assertAllowed($url);

            $response = Http::asForm()
                ->timeout((int) config('security.outbound.timeout', 5))
                ->connectTimeout((int) config('security.outbound.connect_timeout', 3))
                ->post($url, [
                    'secret' => $secret,
                    'response' => $token,
                    'remoteip' => $request->ip(),
                ]);

            return $response->successful() && $response->json('success') === true;
        } catch (Throwable $exception) {
            // No secret, no token value in the log line — only the reason.
            Log::warning('Turnstile verification could not be completed.', [
                'error' => $exception->getMessage(),
            ]);

            return false;
        }
    }

    private function refuse(string $message): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'code' => 'challenge_failed',
        ], 403);
    }
}
