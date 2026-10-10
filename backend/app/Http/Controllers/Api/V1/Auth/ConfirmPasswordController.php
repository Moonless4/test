<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Auth\ConfirmPasswordRequest;
use App\Services\AuditLogger;
use App\Services\Security\LoginShield;
use App\Services\Security\RecentAuth;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Hash;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * The re-authentication endpoint the sensitive admin routes ask for.
 *
 * The answer is a short-lived flag attached to *this* token, not a new credential: nothing is
 * handed to the client that could be kept, replayed elsewhere or stolen from storage. A wrong
 * password is recorded as a failed authentication attempt, so guessing here is as expensive as
 * guessing at the login form.
 */
class ConfirmPasswordController extends Controller
{
    public function __construct(
        private readonly RecentAuth $recent,
        private readonly LoginShield $shield,
        private readonly AuditLogger $audit,
    ) {}

    public function store(ConfirmPasswordRequest $request): JsonResponse
    {
        $user = $request->user();
        $password = (string) $request->string('password');

        if (! Hash::check($password, $user->password)) {
            $this->shield->registerFailedCheck($user, 'recent_auth');
            $this->audit->log('auth.recent_auth_failed', $user, [], $user);

            return response()->json([
                'message' => 'رمز عبور معتبر نیست.',
                'code' => 'invalid_password',
            ], 422);
        }

        $token = $user->currentAccessToken();
        $tokenId = $token instanceof PersonalAccessToken ? (int) $token->getKey() : null;

        $this->recent->mark($user, $tokenId);
        $this->audit->log('auth.recent_auth', $user, [], $user);

        return response()->json([
            'data' => [
                'confirmed_for_minutes' => (int) config('security.recent_auth.ttl_minutes', 15),
            ],
            'message' => 'تأیید شد.',
        ]);
    }
}
