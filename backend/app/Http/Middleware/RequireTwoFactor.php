<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\Tokens;
use Closure;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * "This administrator got past the second factor."
 *
 * The gate is an *ability on the token*, not a flag on the account: it is decided once, at the
 * moment the challenge was answered, and it travels with the token. A token that never answered
 * the challenge cannot read an order, whatever it sends.
 *
 * Two refusals, and the panel's UI is expected to handle both:
 *
 *  - `two_factor_setup_required` — the shop requires a second factor and this administrator has
 *    not enrolled yet. Only the enrollment endpoints (under `/auth`) are reachable until they do.
 *  - `two_factor_required` — enrolled but this token has not answered the challenge.
 *
 * A session-authenticated request (no bearer token) never counts as verified: Sanctum's transient
 * token answers `true` to every ability, which would otherwise make cookie auth a way around MFA.
 */
class RequireTwoFactor
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User || ! (bool) config('security.two_factor.enabled')) {
            return $next($request);
        }

        // Customers, and staff on a host that turned the requirement off, are unaffected.
        if (! $user->requiresTwoFactor()) {
            return $next($request);
        }

        if (! $user->hasTwoFactorEnabled()) {
            return $this->refuse(
                'two_factor_setup_required',
                'برای دسترسی به پنل مدیریت، ورود دو مرحله‌ای را فعال کنید.',
            );
        }

        $token = $user->currentAccessToken();

        $verified = $token instanceof PersonalAccessToken
            && $token->can(Tokens::twoFactorVerifiedAbility());

        if (! $verified) {
            return $this->refuse(
                'two_factor_required',
                'برای ادامه، کد ورود دو مرحله‌ای را وارد کنید.',
            );
        }

        return $next($request);
    }

    private function refuse(string $code, string $message): JsonResponse
    {
        return response()->json([
            'message' => $message,
            'code' => $code,
        ], 403);
    }
}
