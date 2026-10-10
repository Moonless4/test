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
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Enrolling in, inspecting and turning off the administrator second factor.
 *
 * Boundaries this class holds:
 *
 *  - `show()` reports *state* (`enabled`, how many recovery codes are left) and never the secret.
 *    The secret leaves the server exactly once, in `enroll()` and `confirm()` answers, to the
 *    authenticated owner.
 *  - **Enrollment belongs to the "you must enroll" step.** A token that is still holding a
 *    *challenge* is refused here: enrolling under a half-finished login would otherwise be a way to
 *    replace the operator's authenticator with one the caller controls.
 *  - Turning the second factor **off** — and reissuing recovery codes — needs the password again
 *    (`recent-auth`) **and a code from the authenticator**: a token stolen from an unlocked laptop
 *    knows neither, and a token plus a keylogged password is still not enough. A recovery code may
 *    be used to reissue recovery codes (the operator who lost the phone is the one case that needs
 *    it), but never to turn the second factor off.
 *  - Confirming enrollment rotates the token: the token that was used to set the account up is
 *    deleted and replaced with a verified one, so nothing that was in flight during enrollment
 *    survives it.
 */
class TwoFactorController extends Controller
{
    public function __construct(
        private readonly TwoFactorAuth $twoFactor,
        private readonly SessionRegistry $sessions,
        private readonly RecentAuth $recent,
        private readonly LoginShield $shield,
        private readonly AuditLogger $audit,
    ) {}

    /**
     * State only: no secret, no recovery codes, not even a prefix of either.
     */
    public function show(Request $request): JsonResponse
    {
        $user = $request->user();

        return response()->json([
            'data' => [
                'enabled' => $user->hasTwoFactorEnabled(),
                'required' => $user->requiresTwoFactor(),
                'confirmed_at' => $user->two_factor_confirmed_at?->toIso8601String(),
                'recovery_codes_remaining' => $this->twoFactor->remainingRecoveryCodes($user),
            ],
        ]);
    }

    /**
     * Start (or restart) enrollment. The secret is returned once so the operator can type it into
     * their authenticator app; it is stored encrypted and is never returned again.
     */
    public function enroll(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($this->isHoldingAChallenge($request)) {
            return $this->challengeFirst();
        }

        if ($user->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => 'ورود دو مرحله‌ای از قبل فعال است. برای شروع دوباره، ابتدا آن را غیرفعال کنید.',
                'code' => 'two_factor_already_enabled',
            ], 409);
        }

        $secret = $this->twoFactor->enroll($user);

        // Enrollment replaces the second factor, so the owner is told it started — on the address
        // the account already owns, which is the one channel an attacker who only has the password
        // does not control.
        $this->shield->notify($user, 'فعال‌سازی ورود دو مرحله‌ای برای حساب شما آغاز شد.', [
            'ip' => (string) $request->ip(),
            'at' => now()->toIso8601String(),
        ]);

        return response()->json([
            'data' => [
                'secret' => $secret,
                'otpauth_url' => $this->twoFactor->provisioningUri($user, $secret),
            ],
            'message' => 'کد را در برنامهٔ احراز هویت اضافه کنید و سپس برای تأیید، کد شش رقمی را وارد کنید.',
        ]);
    }

    /**
     * Confirm enrollment with a code from the app. Answers with the recovery codes — the only time
     * they are ever readable — and with a full token replacing the one that made this request.
     */
    public function confirm(TwoFactorCodeRequest $request): JsonResponse
    {
        $user = $request->user();

        if ($this->isHoldingAChallenge($request)) {
            return $this->challengeFirst();
        }

        if ($user->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => 'ورود دو مرحله‌ای از قبل فعال است.',
                'code' => 'two_factor_already_enabled',
            ], 409);
        }

        if ($user->two_factor_secret === null) {
            return response()->json([
                'message' => 'ابتدا مرحلهٔ فعال‌سازی را شروع کنید.',
                'code' => 'two_factor_not_started',
            ], 409);
        }

        $codes = $this->twoFactor->confirm($user, (string) $request->string('code'));

        if ($codes === null) {
            $this->audit->log('auth.two_factor_confirm_failed', $user, [], $user);

            return response()->json([
                'message' => 'کد وارد شده معتبر نیست.',
                'code' => 'invalid_two_factor_code',
            ], 422);
        }

        $device = $this->shield->deviceFrom($request);

        $abilities = Tokens::abilitiesFor($user);
        $abilities[] = Tokens::twoFactorVerifiedAbility();

        // Rotation: whatever token reached this endpoint is replaced. A session-authenticated
        // request (Sanctum's transient token) has no row to delete, and must not be treated as if
        // it had one — `currentAccessToken()` is not always a personal access token.
        $token = $request->user()?->currentAccessToken();

        if ($token instanceof PersonalAccessToken) {
            $token->delete();
        }

        $issued = Tokens::issueWithAbilities($user, $abilities, $device);

        $this->audit->log('auth.two_factor_enabled', $user, ['device' => $device], $user);
        $this->shield->notify($user, 'ورود دو مرحله‌ای برای حساب شما فعال شد.', [
            'device' => $device,
            'ip' => (string) $request->ip(),
            'at' => now()->toIso8601String(),
        ]);

        return response()->json([
            'data' => [
                // Shown once, hashed at rest, single-use — see App\Services\Security\TwoFactorAuth.
                'recovery_codes' => $codes,
                'user' => new UserResource($user->refresh()->load('roles', 'permissions')),
                'token' => $issued['token'],
                'token_type' => 'Bearer',
                'expires_at' => $issued['expires_at'],
            ],
            'message' => 'ورود دو مرحله‌ای فعال شد. کدهای بازیابی را جای امنی نگه دارید.',
        ]);
    }

    /**
     * New recovery codes; every previous one stops working.
     *
     * Behind `full-auth` + `recent-auth` + a current second factor: a password alone may not reissue
     * them, which is what stops "I know the password" from becoming "I hold a working code".
     */
    public function regenerate(TwoFactorCodeRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => 'ابتدا ورود دو مرحله‌ای را فعال کنید.',
                'code' => 'two_factor_not_enabled',
            ], 409);
        }

        // A recovery code is accepted here on purpose: the operator who lost the phone has no other
        // way back, and reissuing is the step that gives them a fresh set.
        if (! $this->proveSecondFactor($user, $request, allowRecoveryCode: true)) {
            return $this->invalidProof($user, 'recovery_codes');
        }

        // The reissue itself is audited (and the old set invalidated) inside TwoFactorAuth.
        $codes = $this->twoFactor->regenerateRecoveryCodes($user);

        $this->shield->notify($user, 'کدهای بازیابی حساب شما بازتولید شد.', [
            'ip' => (string) $request->ip(),
            'at' => now()->toIso8601String(),
        ]);

        return response()->json([
            'data' => ['recovery_codes' => $codes],
            'message' => 'کدهای بازیابی جدید ساخته شد. کدهای قبلی دیگر کار نمی‌کنند.',
        ]);
    }

    /**
     * Turn the second factor off. Requires re-authentication (middleware), a current code from the
     * app, and ends every other session: an account that just became weaker must not keep sessions
     * an attacker opened.
     */
    public function destroy(TwoFactorCodeRequest $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->hasTwoFactorEnabled()) {
            return response()->json([
                'message' => 'ورود دو مرحله‌ای فعال نیست.',
                'code' => 'two_factor_not_enabled',
            ], 409);
        }

        // The shop requires it of administrators: turning it off would lock them out of the panel
        // anyway, so it is refused with an explanation rather than silently accepted. Checked before
        // the code so a required account is told *why* it is refused, not asked for a code it would
        // be refused anyway.
        if ($user->requiresTwoFactor()) {
            return response()->json([
                'message' => 'برای حساب‌های مدیریتی، ورود دو مرحله‌ای الزامی است و غیرفعال نمی‌شود.',
                'code' => 'two_factor_required',
            ], 403);
        }

        // A recovery code gets somebody back *into* an account; it may never be the thing that
        // removes the second factor.
        if (! $this->proveSecondFactor($user, $request, allowRecoveryCode: false)) {
            return $this->invalidProof($user, 'disable');
        }

        $token = $request->user()?->currentAccessToken();
        $currentId = $token instanceof PersonalAccessToken ? (int) $token->getKey() : null;

        $this->twoFactor->disable($user);
        $this->recent->forgetAll($user);

        // The account just got weaker: every session except the caller's is closed.
        $revoked = $this->sessions->revokeOthers($user, $currentId);

        $this->shield->notify($user, 'ورود دو مرحله‌ای برای حساب شما غیرفعال شد.', [
            'ip' => (string) $request->ip(),
            'at' => now()->toIso8601String(),
        ]);

        return response()->json([
            'data' => ['revoked_tokens' => $revoked],
            'message' => 'ورود دو مرحله‌ای غیرفعال شد و سایر نشست‌ها بسته شدند.',
        ]);
    }

    /**
     * Is this request carrying a half-finished *challenge* rather than a setup or a finished login?
     *
     * Deliberately not `$token->can(…challenge…)`: a staff token carries `*`, which Sanctum answers
     * `true` to for every ability. The token's whole ability set is what identifies it.
     */
    private function isHoldingAChallenge(Request $request): bool
    {
        $token = $request->user()?->currentAccessToken();

        return Tokens::pendingStep($token) === Tokens::twoFactorChallengeAbility();
    }

    private function challengeFirst(): JsonResponse
    {
        return response()->json([
            'message' => 'برای ادامه، ابتدا کد ورود دو مرحله‌ای را وارد کنید.',
            'code' => 'two_factor_required',
        ], 403);
    }

    /**
     * A current code from the app — the second proof a downgrade needs on top of the password.
     *
     * Bounded the same way the login challenge is, so guessing here is as expensive as guessing
     * there.
     */
    private function proveSecondFactor(User $user, TwoFactorCodeRequest $request, bool $allowRecoveryCode): bool
    {
        if ($this->twoFactor->tooManyAttempts($user)) {
            return false;
        }

        $recoveryCode = (string) $request->string('recovery_code');
        $code = (string) $request->string('code');

        $passed = false;

        if ($recoveryCode !== '') {
            // Short-circuited on purpose: a recovery code that may not stand in for this action must
            // not be *consumed* by the refused attempt either.
            $passed = $allowRecoveryCode && $this->twoFactor->consumeRecoveryCode($user, $recoveryCode);
        } elseif ($code !== '') {
            $passed = $this->twoFactor->verify($user, $code);
        }

        $passed
            ? $this->twoFactor->clearAttempts($user)
            : $this->twoFactor->registerFailedAttempt($user);

        return $passed;
    }

    /**
     * One answer for every way a second-factor proof can fail: the caller is never told whether the
     * code was wrong, replayed, missing or unrecognized.
     */
    private function invalidProof(User $user, string $context): JsonResponse
    {
        $this->shield->registerFailedCheck($user, 'two_factor_failed');
        $this->audit->log('auth.two_factor_failed', $user, ['context' => $context], $user);

        if ($this->twoFactor->tooManyAttempts($user)) {
            return response()->json([
                'message' => 'تلاش‌های ناموفق زیاد بود. دوباره وارد شوید.',
                'code' => 'two_factor_locked',
            ], 429);
        }

        return response()->json([
            'message' => 'کد وارد شده معتبر نیست.',
            'code' => 'invalid_two_factor_code',
        ], 422);
    }
}
