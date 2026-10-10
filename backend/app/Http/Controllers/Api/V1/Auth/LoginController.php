<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use App\Services\Security\LoginShield;
use App\Services\Security\TwoFactorAuth;
use App\Support\Tokens;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

/**
 * Login.
 *
 * Deliberate choices:
 *
 *  - **One message for a wrong email and a wrong password** ("These credentials do not match our
 *    records"), so the endpoint cannot be used to find out which addresses have accounts.
 *  - **A suspended account is told so** — but only after the password checked out, so revealing it
 *    takes knowledge the caller must already have.
 *  - **The hash is upgraded on login** when the configured algorithm/rounds changed, which is what
 *    makes moving from bcrypt to Argon2id a configuration change rather than a migration.
 *  - **Failures are bounded in three ways**: the `login` rate limiter (email + address, per minute),
 *    a temporary pair-keyed lockout after N failures (LoginShield), and a small progressive delay
 *    that costs a script time without giving it a lever to hold a worker busy.
 *  - **A correct password is not the end of the story.** An account with a second factor gets a
 *    challenge token that can only reach the challenge endpoint; a staff account that has not
 *    enrolled gets a setup token that can only reach enrollment. Only a customer with no second
 *    factor — or a non-staff account — receives a usable token here.
 *  - **Suspicious sign-ins are recorded before the token is handed over** (new address, new device,
 *    a country change inside the travel window, an unusual number of live sessions), and the owner
 *    is told — never with anything in the message that an attacker could use.
 */
class LoginController extends Controller
{
    public function __construct(
        private readonly AuditLogger $audit,
        private readonly LoginShield $shield,
        private readonly TwoFactorAuth $twoFactor,
    ) {}

    public function store(LoginRequest $request): JsonResponse
    {
        $email = (string) $request->string('email');
        $password = (string) $request->string('password');
        $device = $this->shield->deviceFrom($request);
        $ip = (string) $request->ip();

        // Locked pair: answered before the password is even hashed, so a locked attacker learns
        // nothing and costs the server nothing.
        $lockedFor = $this->shield->lockedSeconds($email, $ip);

        if ($lockedFor > 0) {
            $this->audit->log('auth.login_locked', null, [
                'email' => $email,
                'retry_after' => $lockedFor,
            ], null);

            return response()->json([
                'message' => 'تلاش‌های ناموفق بیش از حد مجاز بود. کمی بعد دوباره تلاش کنید.',
                'code' => 'login_throttled',
                'retry_after' => $lockedFor,
            ], 429)->header('Retry-After', (string) $lockedFor);
        }

        /** @var User|null $user */
        $user = User::query()->where('email', $email)->first();

        if ($user === null || ! Hash::check($password, $user->password)) {
            $delay = $this->shield->registerFailure($user, $email, 'password');

            if ($delay > 0) {
                usleep($delay * 1000);
            }

            $this->audit->log('auth.login_failed', null, ['email' => $email], null);

            throw ValidationException::withMessages([
                'email' => [trans('auth.failed')],
            ]);
        }

        if (! $user->isActive()) {
            $this->shield->registerFailedCheck($user, 'suspended');
            $this->audit->log('auth.login_blocked', $user, ['reason' => 'suspended'], $user);

            return response()->json([
                'message' => 'حساب کاربری شما غیرفعال است. با پشتیبانی تماس بگیرید.',
            ], 403);
        }

        if (Hash::needsRehash($user->password)) {
            $user->password = $password;
            $user->save();
        }

        // The password is right: clear the failure budget and look at this sign-in before it
        // becomes a session.
        $this->shield->registerSuccess($user);
        $this->shield->inspect($user, $device, $this->shield->countryFrom($request));

        // A confirmed second factor is not optional: this answer carries a token that can only
        // reach the challenge endpoint.
        if ((bool) config('security.two_factor.enabled') && $user->hasTwoFactorEnabled()) {
            $issued = $this->twoFactor->issueChallengeToken($user, $device);

            $this->audit->log('auth.two_factor_challenge_issued', $user, ['device' => $device], $user);

            return response()->json([
                'data' => [
                    'two_factor_required' => true,
                    'challenge_token' => $issued['token'],
                    'token_type' => 'Bearer',
                    'expires_at' => $issued['expires_at'],
                ],
            ]);
        }

        // The shop requires a second factor of staff accounts: without one, the only thing this
        // session can do is enroll.
        if ($user->requiresTwoFactor()) {
            $issued = Tokens::issueWithAbilities(
                $user,
                [Tokens::twoFactorSetupAbility()],
                $device,
                now()->addMinutes((int) config('security.two_factor.challenge_ttl_minutes', 5)),
            );

            $this->audit->log('auth.two_factor_setup_required', $user, ['device' => $device], $user);

            return response()->json([
                'data' => [
                    'two_factor_setup_required' => true,
                    'user' => new UserResource($user->load('roles', 'permissions')),
                    'token' => $issued['token'],
                    'token_type' => 'Bearer',
                    'expires_at' => $issued['expires_at'],
                ],
            ]);
        }

        $issued = Tokens::issue($user, $device);

        $user->recordLogin($ip, $this->shield->countryFrom($request), $device);

        $this->audit->log('auth.login', $user, ['device' => $device], $user);

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
