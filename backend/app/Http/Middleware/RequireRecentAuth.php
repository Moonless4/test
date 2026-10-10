<?php

namespace App\Http\Middleware;

use App\Models\User;
use App\Services\Security\RecentAuth;
use Closure;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;
use Symfony\Component\HttpFoundation\Response;

/**
 * Re-authentication for sensitive operations.
 *
 * Applied to the routes where a stolen token would otherwise be enough on its own: handing out a
 * role, suspending an account, changing a shop-wide setting, turning the second factor off or
 * regenerating recovery codes. The caller proves the password again through
 * `POST /auth/confirm-password`, and the proof is good for a few minutes and only for that one
 * token.
 *
 * 423 Locked, with a `code` the panel can act on — not 401, which the client would answer by
 * dropping the session the user is legitimately holding.
 */
class RequireRecentAuth
{
    public function __construct(private readonly RecentAuth $recent) {}

    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user instanceof User) {
            return response()->json(['message' => 'احراز هویت لازم است.'], 401);
        }

        if (! $this->recent->confirmed($user, $this->tokenId($request))) {
            return response()->json([
                'message' => 'برای این تغییر حساس، رمز عبور خود را دوباره وارد کنید.',
                'code' => 'recent_auth_required',
            ], 423);
        }

        return $next($request);
    }

    private function tokenId(Request $request): ?int
    {
        $token = $request->user()?->currentAccessToken();

        return $token instanceof PersonalAccessToken ? (int) $token->getKey() : null;
    }
}
