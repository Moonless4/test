<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Auth\TwoFactorCodeRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\Security\LoginShield;
use App\Services\Security\RecentAuth;
use App\Services\Security\SessionRegistry;
use App\Services\Security\TwoFactorAuth;
use App\Support\Tokens;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * The second half of a login: exchanging a one-time code for a real token.
 *
 * The token that reaches this endpoint is the *challenge* token issued by LoginController — it
 * carries only `twofa:challenge`, so it cannot read an order or an admin list while it waits. On
 * success it is deleted and a full token is issued, which is the rotation that makes a captured
 * challenge token worthless the moment the real login finishes.
 *
 * What this controller never does: log a code, store a code, return a secret, or say whether the
 * account exists.
 */
class TwoFactorChallengeController extends Controller
{
    public function __construct(
        private readonly TwoFactorAuth $twoFactor,
        private readonly LoginShield $shield,
        private readonly AuditLogger $audit,
    ) {}

    public function store(TwoFactorCodeRequest $request): JsonResponse
    {
        $user = $request->user();
        $token = $user?->currentAccessToken();

        // A full token, or a token from somewhere else, has no business here: the challenge is
        // answered with the token the login handed out and nothing else.
        if (! $user instanceof User
            || ! $token instanceof PersonalAccessToken
            || ! $token->can(Tokens::twoFactorChallengeAbility())) {
            return response()->json([
                'message' => 'این درخواست معتبر نیست.',
                'code' => 'invalid_challenge',
            ], 403);
        }

        if (! $user->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => 'ورود دو مرحله‌ای برای این حساب فعال نیست.',
                'code' => 'two_factor_not_enabled',
            ], 403);
        }

        // Too many wrong codes: the challenge is abandoned rather than kept available for a script.
        if ($this->twoFactor->tooManyAttempts($user)) {
            $token->delete();
            $this->audit->log('auth.two_factor_abandoned', $user, [], $user);

            return response()->json([
                'message' => 'تلاش‌های ناموفق زیاد بود. دوباره وارد شوید.',
                'code' => 'two_factor_locked',
            ], 429);
        }

        $recoveryCode = (string) $request->string('recovery_code');
        $code = (string) $request->string('code');

        $passed = $recoveryCode !== ''
            ? $this->twoFactor->consumeRecoveryCode($user, $recoveryCode)
            : $this->twoFactor->verify($user, $code);

        if (! $passed) {
            $attempts = $this->twoFactor->registerFailedAttempt($user);
            $this->shield->registerFailedCheck($user, 'two_factor_failed');
            $this->audit->log('auth.two_factor_failed', $user, ['attempts' => $attempts], $user);

            return response()->json([
                'message' => 'کد وارد شده معتبر نیست.',
                'code' => 'invalid_two_factor_code',
            ], 422);
        }

        $this->twoFactor->clearAttempts($user);

        $device = $this->shield->deviceFrom($request);

        // Rotation: the challenge token dies here, so the token that was in flight during the
        // challenge can never be used again.
        $token->delete();

        $abilities = Tokens::abilitiesFor($user);
        $abilities[] = Tokens::twoFactorVerifiedAbility();

        $issued = Tokens::issueWithAbilities($user, $abilities, $device);

        $user->recordLogin(
            (string) $request->ip(),
            $this->shield->countryFrom($request),
            $device,
        );

        $this->audit->log('auth.login', $user, [
            'device' => $device,
            'two_factor' => true,
            'recovery_code' => $recoveryCode !== '',
        ], $user);

        return response()->json([
            'data' => [
                'user' => new UserResource($user->load('roles', 'permissions')),
                'token' => $issued['token'],
                'token_type' => 'Bearer',
                'expires_at' => $issued['expires_at'],
            ],
        ]);
    }
}
