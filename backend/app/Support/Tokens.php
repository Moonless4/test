<?php

namespace App\Support;

use App\Models\User;
use DateTimeInterface;

/**
 * Token issuing, kept in one place so every endpoint that hands out a token does it the same way:
 * the same abilities, the same expiry, and the same "label only" device name.
 */
final class Tokens
{
    /**
     * @return array{token: string, expires_at: ?string}
     */
    public static function issue(User $user, string $deviceName = 'api', ?DateTimeInterface $expiresAt = null): array
    {
        $abilities = $user->isStaff()
            ? (array) config('security.tokens.abilities.staff', ['*'])
            : (array) config('security.tokens.abilities.customer', []);

        $expiresAt ??= self::defaultExpiry();

        $token = $user->createToken(
            // Trimmed and truncated: a device label comes from the client and is only ever a label.
            mb_substr(trim($deviceName) !== '' ? trim($deviceName) : 'api', 0, 100),
            $abilities,
            $expiresAt,
        );

        return [
            'token' => $token->plainTextToken,
            'expires_at' => $expiresAt?->format(DATE_ATOM),
        ];
    }

    public static function defaultExpiry(): ?DateTimeInterface
    {
        $minutes = config('security.tokens.expiration_minutes');

        return is_numeric($minutes) && (int) $minutes > 0
            ? now()->addMinutes((int) $minutes)
            : null;
    }
}
