<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Account\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\AuditLogger;
use App\Services\Security\LoginShield;
use App\Services\Security\RecentAuth;
use App\Services\Security\SessionRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use Laravel\Sanctum\PersonalAccessToken;

class ProfileController extends Controller
{
    public function __construct(
        private readonly AuditLogger $audit,
        private readonly SessionRegistry $sessions,
        private readonly RecentAuth $recent,
        private readonly LoginShield $shield,
    ) {}

    /**
     * The caller's own profile. Wrapped as `data.user` exactly like `update()` below (and like
     * every other account endpoint), so a client that reads the profile it just wrote does not
     * have to switch shapes between the two calls.
     */
    public function show(Request $request): JsonResponse
    {
        return response()->json([
            'data' => ['user' => new UserResource($request->user()->load('roles', 'permissions'))],
        ]);
    }

    /**
     * Updates the caller's *own* profile. The request cannot carry a role or a status, so this can
     * never escalate privileges — and the model's fillable list would refuse such a field anyway.
     *
     * A changed email address loses its verification: the new address has to be proved like any
     * other, otherwise changing the address would be a way to inherit a verified state.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $emailChanged = $request->emailIsChanging();

        if ($emailChanged) {
            $password = (string) $request->string('current_password');

            // The rule made the password required; this is the check that it is *right*. A wrong
            // one is recorded like any other failed credential check, so guessing here is as
            // expensive as guessing at the login form.
            if (! Hash::check($password, $user->password)) {
                $this->shield->registerFailedCheck($user, 'email_change');
                $this->audit->log('security.email_change_failed', $user, [], $user);

                throw ValidationException::withMessages([
                    'current_password' => ['رمز عبور فعلی معتبر نیست.'],
                ]);
            }
        }

        $user->name = $data['name'] ?? $user->name;
        $user->phone = array_key_exists('phone', $data) ? $data['phone'] : $user->phone;

        if ($emailChanged) {
            $user->email = $data['email'];
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();

            // The address is how a password reset finds the account, so a change closes every
            // session but the one that made it: a session opened with the old address must not
            // outlive it.
            $revoked = $this->sessions->revokeOthersThan($user, $this->currentToken($request));
            $this->recent->forgetAll($user);

            $this->audit->log('security.email_changed', $user, ['revoked_tokens' => $revoked], $user);

            $this->shield->notify($user, 'ایمیل حساب شما تغییر کرد.', [
                'ip' => (string) $request->ip(),
                'at' => now()->toIso8601String(),
            ]);
        }

        $this->audit->log('account.profile_updated', $user, [
            'email_changed' => $emailChanged,
            'phone_changed' => array_key_exists('phone', $data),
        ], $user);

        return response()->json([
            'data' => ['user' => new UserResource($user->load('roles', 'permissions'))],
            'message' => $emailChanged
                ? 'مشخصات ذخیره شد. برای تأیید ایمیل جدید، پیوند ارسال‌شده را باز کنید.'
                : 'مشخصات ذخیره شد.',
        ]);
    }

    private function currentToken(Request $request): ?PersonalAccessToken
    {
        $token = $request->user()?->currentAccessToken();

        return $token instanceof PersonalAccessToken ? $token : null;
    }
}
