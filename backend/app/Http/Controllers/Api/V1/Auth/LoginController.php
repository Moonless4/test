<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Auth\LoginRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
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
 *  - **Brute force is answered with 429** by the `login` rate limiter (keyed on email + IP).
 */
class LoginController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function store(LoginRequest $request): JsonResponse
    {
        $email = (string) $request->string('email');
        $password = (string) $request->string('password');

        /** @var User|null $user */
        $user = User::query()->where('email', $email)->first();

        if ($user === null || ! Hash::check($password, $user->password)) {
            $this->audit->log('auth.login_failed', null, ['email' => $email], null);

            throw ValidationException::withMessages([
                'email' => [trans('auth.failed')],
            ]);
        }

        if (! $user->isActive()) {
            $this->audit->log('auth.login_blocked', $user, ['reason' => 'suspended'], $user);

            return response()->json([
                'message' => 'حساب کاربری شما غیرفعال است. با پشتیبانی تماس بگیرید.',
            ], 403);
        }

        if (Hash::needsRehash($user->password)) {
            $user->password = $password;
            $user->save();
        }

        $user->recordLogin((string) $request->ip());

        $issued = Tokens::issue($user, (string) ($request->string('device_name')->value() ?: 'api'));

        $this->audit->log('auth.login', $user, ['device' => (string) $request->string('device_name')], $user);

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
