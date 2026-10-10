<?php

namespace App\Support;

use App\Models\User;
use DateTimeInterface;
use Illuminate\Support\Facades\Request;
use Laravel\Sanctum\PersonalAccessToken;

/**
 * Token issuing, kept in one place so every endpoint that hands out a token does it the same way:
 * the same abilities, the same expiry, and the same "label only" device name.
 *
 * The token value itself is never stored: Sanctum keeps a SHA-256 hash of it, which is what makes
 * a database leak useless to an attacker. What *is* stored next to the hash is the client's address
 * and user agent — metadata a session list needs and that no attacker can turn back into a token.
 */
final class Tokens
{
    /**
     * @return array{token: string, expires_at: ?string, token_id: ?int}
     */
    public static function issue(User $user, string $deviceName = 'api', ?DateTimeInterface $expiresAt = null): array
    {
        return self::issueWithAbilities($user, self::abilitiesFor($user), $deviceName, $expiresAt);
    }

    /**
     * The abilities an account's own kind of token carries. Kept here so the login controller and
     * the second-factor challenge cannot disagree about what a staff token may do.
     *
     * @return array<int, string>
     */
    public static function abilitiesFor(User $user): array
    {
        return $user->isStaff()
            ? (array) config('security.tokens.abilities.staff', ['*'])
            : (array) config('security.tokens.abilities.customer', []);
    }

    /**
     * A deliberately narrow token: the two-factor challenge and the "you must enroll" step both
     * hand out one of these, and it can only reach the endpoint that consumes it.
     *
     * @param  array<int, string>  $abilities
     * @return array{token: string, expires_at: ?string, token_id: ?int}
     */
    public static function issueWithAbilities(
        User $user,
        array $abilities,
        string $deviceName = 'api',
        ?DateTimeInterface $expiresAt = null,
    ): array {
        $expiresAt ??= self::defaultExpiry();

        $issued = $user->createToken(
            // Trimmed and truncated: a device label comes from the client and is only ever a label.
            mb_substr(trim($deviceName) !== '' ? trim($deviceName) : 'api', 0, 100),
            $abilities,
            $expiresAt,
        );

        // Where this session is from, for the session list and for "new device" detection.
        $token = $issued->accessToken;
        $token->forceFill([
            'ip_address' => mb_substr((string) Request::ip(), 0, 45),
            'user_agent' => mb_substr((string) Request::userAgent(), 0, 255),
        ])->save();

        return [
            'token' => $issued->plainTextToken,
            'expires_at' => $expiresAt?->format(DATE_ATOM),
            'token_id' => $token->getKey(),
        ];
    }

    public static function defaultExpiry(): ?DateTimeInterface
    {
        $minutes = config('security.tokens.expiration_minutes');

        return is_numeric($minutes) && (int) $minutes > 0
            ? now()->addMinutes((int) $minutes)
            : null;
    }

    /**
     * The ability that says "this token got past the second factor".
     */
    public static function twoFactorVerifiedAbility(): string
    {
        return (string) config('security.tokens.abilities.two_factor_verified', 'twofa:verified');
    }

    public static function twoFactorChallengeAbility(): string
    {
        return (string) config('security.tokens.abilities.two_factor_challenge', 'twofa:challenge');
    }

    public static function twoFactorSetupAbility(): string
    {
        return (string) config('security.tokens.abilities.two_factor_setup', 'twofa:setup');
    }

    /**
     * Which second-factor step, if any, this token is still holding.
     *
     * A token is *pending* only when **every** ability it carries belongs to a step: the login hands
     * out `twofa:challenge` or `twofa:setup` and nothing else, while a finished token carries the
     * account's own abilities (and `*` for staff). This is deliberately not `$token->can(…)` —
     * Sanctum answers `true` to every ability for a `*` token, so an ability *check* would report a
     * full staff token as a pending one and a pending one as whatever it was asked about.
     *
     * @return string|null The ability of the step it holds, or null when this is not a pending token.
     */
    public static function pendingStep(?PersonalAccessToken $token): ?string
    {
        if (! $token instanceof PersonalAccessToken) {
            // A session-authenticated request has no ability row to read.
            return null;
        }

        $abilities = array_values(array_unique((array) $token->abilities));
        $steps = [self::twoFactorChallengeAbility(), self::twoFactorSetupAbility()];

        if ($abilities === [] || array_diff($abilities, $steps) !== []) {
            return null;
        }

        return in_array(self::twoFactorSetupAbility(), $abilities, true)
            ? self::twoFactorSetupAbility()
            : self::twoFactorChallengeAbility();
    }

    public static function isPendingSecondFactor(?PersonalAccessToken $token): bool
    {
        return self::pendingStep($token) !== null;
    }
}
