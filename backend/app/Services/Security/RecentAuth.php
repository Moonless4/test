<?php

namespace App\Services\Security;

use App\Models\User;
use Illuminate\Support\Facades\Cache;

/**
 * "Did this person prove, recently, that they are the one holding the account?"
 *
 * A bearer token answers "this request was issued a valid token"; it does not answer "the person at
 * the keyboard knows the password right now". Handing out a role, changing a shop-wide setting or
 * turning the second factor off is sensitive enough to ask again — and a token stolen from an
 * unlocked laptop does not know the password.
 *
 * The confirmation is remembered per *token*, not per user, so confirming on one device does not
 * cover an attacker's session on another.
 */
class RecentAuth
{
    public function mark(User $user, ?int $tokenId): void
    {
        Cache::put($this->key($user, $tokenId), now()->getTimestamp(), $this->ttl());
    }

    public function confirmed(User $user, ?int $tokenId): bool
    {
        return Cache::has($this->key($user, $tokenId));
    }

    public function forget(User $user, ?int $tokenId): void
    {
        Cache::forget($this->key($user, $tokenId));
    }

    /**
     * Drop every confirmation this account holds. Called when the password changes or the second
     * factor is turned off: the proof that was given before that is no longer evidence of anything.
     */
    public function forgetAll(User $user): void
    {
        foreach ($user->tokens()->pluck('id') as $tokenId) {
            Cache::forget($this->key($user, (int) $tokenId));
        }

        Cache::forget($this->key($user, null));
    }

    private function key(User $user, ?int $tokenId): string
    {
        return 'recent-auth:'.$user->getKey().':'.($tokenId ?? 'session');
    }

    private function ttl(): \DateTimeInterface
    {
        return now()->addMinutes(max(1, (int) config('security.recent_auth.ttl_minutes', 15)));
    }
}
