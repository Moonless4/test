<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Services\AuditLogger;
use App\Services\Security\SessionRegistry;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * "Where am I signed in, and close that one."
 *
 * A session is identified by the id of its token row. That id is a handle, not a credential: it
 * cannot be turned back into a token, and every query here is scoped to the caller's own account,
 * so knowing somebody else's session id reads and revokes nothing (404, never 403 — a 403 would
 * confirm the session exists).
 */
class SessionController extends Controller
{
    public function __construct(
        private readonly SessionRegistry $sessions,
        private readonly AuditLogger $audit,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $user = $request->user();
        $token = $user->currentAccessToken();
        $currentId = $token instanceof PersonalAccessToken ? (int) $token->getKey() : null;

        return response()->json([
            'data' => ['sessions' => $this->sessions->active($user, $currentId)],
        ]);
    }

    public function destroy(Request $request, int $token): JsonResponse
    {
        $user = $request->user();
        $current = $user->currentAccessToken();
        $currentId = $current instanceof PersonalAccessToken ? (int) $current->getKey() : null;

        if (! $this->sessions->revoke($user, $token)) {
            // Not this account's session, or already gone. The same answer for both.
            return response()->json(['message' => 'نشست مورد نظر پیدا نشد.'], 404);
        }

        $this->audit->log('auth.session_revoked', $user, ['session_id' => $token], $user);

        return response()->json([
            'message' => $token === $currentId
                ? 'از این دستگاه خارج شدید.'
                : 'آن نشست بسته شد.',
        ]);
    }

    /**
     * Close everything except the device making the request. The counterpart of `logout-all`, which
     * closes this one too.
     */
    public function destroyOthers(Request $request): JsonResponse
    {
        $user = $request->user();
        $token = $user->currentAccessToken();
        $currentId = $token instanceof PersonalAccessToken ? (int) $token->getKey() : null;

        $revoked = $this->sessions->revokeOthers($user, $currentId);

        $this->audit->log('auth.sessions_revoked_others', $user, ['revoked' => $revoked], $user);

        return response()->json([
            'data' => ['revoked_tokens' => $revoked],
            'message' => 'سایر نشست‌ها بسته شدند.',
        ]);
    }
}
