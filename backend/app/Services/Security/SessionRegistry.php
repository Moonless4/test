<?php

namespace App\Services\Security;

use App\Models\User;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * The session list a signed-in person sees, and the revocations they can ask for.
 *
 * "Session" here means one Sanctum token: the API is token-based, so a session *is* a token plus
 * the client it was issued to. Both are stored — the hash of the token by Sanctum, the address and
 * user agent by App\Support\Tokens — and the plaintext is never anywhere.
 */
class SessionRegistry
{
    /**
     * @return array<int, array<string, mixed>>
     */
    public function active(User $user, ?int $currentTokenId = null): array
    {
        return $user->tokens()
            ->orderByDesc('last_used_at')
            ->orderByDesc('id')
            ->get()
            ->map(fn (PersonalAccessToken $token): array => [
                // The row id is a session handle, not a credential: the token itself cannot be
                // read back out of it, so exposing the id lets somebody revoke a session safely.
                'id' => (int) $token->getKey(),
                'device' => (string) $token->name,
                'ip_address' => $token->ip_address,
                'user_agent' => $token->user_agent,
                'abilities' => (array) $token->abilities,
                'current' => $currentTokenId !== null && (int) $token->getKey() === $currentTokenId,
                'created_at' => $token->created_at?->toIso8601String(),
                'last_used_at' => $token->last_used_at?->toIso8601String(),
                'expires_at' => $token->expires_at?->toIso8601String(),
            ])
            ->all();
    }

    public function count(User $user): int
    {
        return $user->tokens()->count();
    }

    /**
     * Revoke one session — only one of this account's own, addressed by id.
     */
    public function revoke(User $user, int $tokenId): bool
    {
        $deleted = $user->tokens()->whereKey($tokenId)->delete();

        return $deleted > 0;
    }

    /**
     * @return int How many sessions were ended.
     */
    public function revokeOthers(User $user, ?int $currentTokenId = null): int
    {
        $query = $user->tokens();

        if ($currentTokenId !== null) {
            $query->whereKeyNot($currentTokenId);
        }

        return $query->delete();
    }

    public function revokeAll(User $user): int
    {
        return $user->tokens()->delete();
    }

    /**
     * Revoke every session that is *not* the one making the request — used after a password change
     * or a security setting change, where keeping the caller signed in on the device in their hand
     * is the difference between a security control and a support ticket.
     */
    public function revokeOthersThan(User $user, ?PersonalAccessToken $current): int
    {
        return $this->revokeOthers($user, $current?->getKey() !== null ? (int) $current->getKey() : null);
    }
}
