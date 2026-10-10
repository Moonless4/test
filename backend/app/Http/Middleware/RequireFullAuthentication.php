<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Support\Tokens;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

/**
 * "This request carries a *finished* login."
 *
 * The second factor turns authentication into two steps, and a step is only a step if the first one
 * cannot do the work of the second. A password-only login is handed a token that holds a single
 * ability — `twofa:challenge` or `twofa:setup` — and this middleware is what keeps that token inside
 * the step it belongs to: `GET /auth/me`, the session list, the password change, re-authentication
 * (`/auth/confirm-password`), the account surfaces and the admin API are all closed to it.
 *
 * Without this, "the password is right" would be enough to *re-authenticate* and then reissue the
 * account's recovery codes — which is a full 2FA bypass with nothing but the password.
 *
 * The decision is made entirely from the stored ability row of the token that authenticated the
 * request: no cookie, header, request parameter, local-storage value or client flag takes part, and
 * a forged one changes nothing. Session-authenticated requests (Sanctum's transient token) are left
 * alone: this API hands out no session that is mid-second-factor, and `two-factor` treats a session
 * as unverified on the admin routes anyway.
 */
class RequireFullAuthentication
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User) {
            // Not authenticated at all: `auth:sanctum` has already answered 401 by now.
            return $next($request);
        }

        $step = Tokens::pendingStep($user->currentAccessToken());

        if ($step === null) {
            return $next($request);
        }

        $setup = $step === Tokens::twoFactorSetupAbility();

        return response()->json([
            'message' => $setup
                ? 'برای دسترسی، ابتدا ورود دو مرحله‌ای را فعال کنید.'
                : 'برای ادامه، کد ورود دو مرحله‌ای را وارد کنید.',
            'code' => $setup ? 'two_factor_setup_required' : 'two_factor_required',
        ], 403);
    }
}
