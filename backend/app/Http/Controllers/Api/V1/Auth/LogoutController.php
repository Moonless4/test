<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LogoutController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    /**
     * Ends this session only: the token that made the request is deleted, the shopper's other
     * devices stay signed in.
     */
    public function destroy(Request $request): JsonResponse
    {
        $token = $request->user()?->currentAccessToken();

        if ($token !== null) {
            $token->delete();
        }

        $this->audit->log('auth.logout', $request->user(), [], $request->user());

        return response()->json(['message' => 'از حساب خارج شدید.']);
    }

    /**
     * The "sign out everywhere" switch — the right answer after a password change or a lost phone.
     */
    public function destroyAll(Request $request): JsonResponse
    {
        $user = $request->user();

        $revoked = $user?->tokens()->count() ?? 0;
        $user?->tokens()->delete();

        $this->audit->log('auth.logout_all', $user, ['revoked' => $revoked], $user);

        return response()->json([
            'message' => 'همه نشست‌ها بسته شد.',
            'data' => ['revoked_tokens' => $revoked],
        ]);
    }
}
