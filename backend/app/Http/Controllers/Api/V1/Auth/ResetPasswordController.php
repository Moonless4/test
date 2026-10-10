<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Auth\ResetPasswordRequest;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;
use Illuminate\Validation\ValidationException;

/**
 * "Set a new password."
 *
 * Two things happen together: the password is replaced, and **every existing token is revoked**.
 * If somebody else had a session — which is exactly the situation a password reset is usually
 * about — that session dies now.
 *
 * The token itself is verified by Laravel's password broker against a hashed, expiring value, and
 * is rate limited by the `password-reset` limiter.
 */
class ResetPasswordController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function store(ResetPasswordRequest $request): JsonResponse
    {
        $status = Password::reset(
            $request->only('email', 'password', 'password_confirmation', 'token'),
            function (User $user, string $password): void {
                $user->password = $password;
                $user->save();

                $revoked = $user->tokens()->count();
                $user->tokens()->delete();

                $this->audit->log('auth.password_reset', $user, ['revoked_tokens' => $revoked], $user);
            },
        );

        if ($status !== Password::PASSWORD_RESET) {
            // The broker's message is deliberately generic (invalid or expired token).
            throw ValidationException::withMessages([
                'email' => [trans($status)],
            ]);
        }

        return response()->json(['message' => 'رمز عبور تغییر کرد. لطفاً دوباره وارد شوید.']);
    }
}
