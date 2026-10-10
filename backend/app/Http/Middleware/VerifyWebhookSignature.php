<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Symfony\Component\HttpFoundation\Response;

/**
 * Inbound webhook verification, in the order that matters:
 *
 *  1. **A configured secret.** Without one the route answers 503 — an unconfigured webhook endpoint
 *     must never fall through to "trust anything".
 *  2. **A signature** over `timestamp.body`, compared with `hash_equals` so the check does not leak
 *     how much of the digest matched.
 *  3. **A timestamp inside the tolerance window**, so a captured request is not replayable next
 *     week.
 *  4. **An idempotency key that has not been seen**, so the same delivery twice is a no-op instead
 *     of a second settlement.
 *
 * Coming from the right URL is not evidence of anything — this route is public, and the address is
 * guessable by definition. The signature is the only part an attacker cannot forge without the
 * secret, and the secret never appears in a log line, a response or a database row.
 */
class VerifyWebhookSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        $config = (array) config('security.webhooks.payment', []);

        $secret = $config['secret'] ?? null;

        if (! is_string($secret) || $secret === '') {
            return response()->json([
                'message' => 'این نقطه پایانی پیکربندی نشده است.',
            ], 503);
        }

        $signature = (string) $request->header((string) ($config['signature_header'] ?? 'X-Medora-Signature'), '');
        $timestamp = (string) $request->header((string) ($config['timestamp_header'] ?? 'X-Medora-Timestamp'), '');
        $idempotency = (string) $request->header((string) ($config['idempotency_header'] ?? 'X-Medora-Idempotency-Key'), '');

        if ($signature === '' || $timestamp === '' || $idempotency === '') {
            return $this->refuse('امضای درخواست ناقص است.');
        }

        $tolerance = (int) ($config['tolerance_seconds'] ?? 300);

        if ($tolerance > 0 && abs(now()->getTimestamp() - (int) $timestamp) > $tolerance) {
            return $this->refuse('زمان درخواست معتبر نیست.');
        }

        // `sha256=<hex>` is what most gateways send; a bare hex digest is accepted as well.
        $provided = str_contains($signature, '=') ? explode('=', $signature, 2)[1] : $signature;

        $expected = hash_hmac('sha256', $timestamp.'.'.$request->getContent(), $secret);

        if (! hash_equals($expected, mb_strtolower(trim($provided)))) {
            return $this->refuse('امضای درخواست معتبر نیست.');
        }

        $replayKey = 'webhook:payment:'.hash('sha256', $idempotency);

        if (Cache::has($replayKey)) {
            // Same delivery twice: answer 200 and do nothing, so the sender stops retrying without
            // the settlement being applied a second time.
            return response()->json(['data' => ['duplicate' => true]], 200);
        }

        Cache::put($replayKey, true, now()->addDay());

        return $next($request);
    }

    private function refuse(string $message): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'code' => 'invalid_signature',
        ], 403);
    }
}
