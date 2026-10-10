<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Auth\UpdatePasswordRequest;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Changing a password from inside the account.
 *
 * The current password is required (UpdatePasswordRequest), and every *other* session is revoked
 * while the caller's own token keeps working — so the shopper is not signed out of the device in
 * their hand, but a session on a machine they no longer trust is closed.
 */
class UpdatePasswordController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function update(UpdatePasswordRequest $request): JsonResponse
    {
        $user = $request->user();

        $user->password = (string) $request->string('password');
        $user->save();

        $currentTokenId = $user->currentAccessToken()?->getKey();

        $revoked = $user->tokens()
            ->when($currentTokenId !== null, fn ($query) => $query->whereKeyNot($currentTokenId))
            ->delete();

        $this->audit->log('auth.password_changed', $user, ['revoked_tokens' => $revoked], $user);

        return response()->json([
            'message' => 'رمز عبور تغییر کرد.',
            'data' => ['revoked_tokens' => $revoked],
        ]);
    }
}
