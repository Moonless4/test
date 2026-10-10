<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Services\AuditLogger;
use App\Services\Security\LoginShield;
use App\Services\Security\RecentAuth;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Changing a password from inside the account.
 *
 * The current password is required (UpdatePasswordRequest), and every *other* session is revoked
 * while the caller's own token keeps working — so the shopper is not signed out of the device in
 * their hand, but a session on a machine they no longer trust is closed.
 *
 * Account-takeover rules that also apply here:
 *
 *  - any re-authentication given before the change is dropped: proof given with the *old* password
 *    is no longer proof of anything;
 *  - the owner is mailed (never with a credential in the message), because a password change they
 *    did not make is the moment they can still act;
 *  - the event is audited with the number of sessions ended, not with the password.
 */
class UpdatePasswordController extends Controller
{
    public function __construct(
        private readonly AuditLogger $audit,
        private readonly RecentAuth $recent,
        private readonly LoginShield $shield,
    ) {}

    public function update(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->password = (string) $request->string('password');
        $user->save();

        $currentTokenId = $user->currentAccessToken()?->getKey();

        $revoked = $user->tokens()
            ->when($currentTokenId !== null, fn ($query) => $query->whereKeyNot($currentTokenId))
            ->delete();

        $this->recent->forgetAll($user);

        $this->audit->log('auth.password_changed', $user, ['revoked_tokens' => $revoked], $user);

        $this->shield->notify($user, 'رمز عبور حساب شما تغییر کرد و سایر نشست‌ها بسته شدند.', [
            'ip' => (string) $request->ip(),
            'at' => now()->toIso8601String(),
        ]);

        return response()->json([
            'message' => 'رمز عبور تغییر کرد.',
            'data' => ['revoked_tokens' => $revoked],
        ]);
    }
}
