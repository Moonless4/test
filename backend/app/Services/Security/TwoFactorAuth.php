<?php

namespace App\Services\Security;

use App\Models\User;
use App\Services\AuditLogger;
use App\Support\Tokens;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use PragmaRX\Google2FA\Google2FA;
use Throwable;

/**
 * Administrator second factor: TOTP (RFC 6238), verified by pragmarx/google2fa.
 *
 * The rules this class exists to hold:
 *
 *  - **No hand-rolled cryptography.** The HMAC/truncation maths lives in the library; this class
 *    only decides *when* a code is asked for and what happens to the secret.
 *  - **The secret never leaves the server.** It is cast to `encrypted` on the model and is in the
 *    model's `#[Hidden]` list, so it cannot appear in a resource, a JSON dump or an array cast.
 *  - **Recovery codes are single-use and hashed.** They are generated once, shown once, and stored
 *    as bcrypt hashes; consuming one deletes it. A database leak yields nothing typeable.
 *  - **Codes are never logged.** No branch of this class passes a code to the audit logger, and the
 *    logger's own redaction list matches `otp`/`token` anyway.
 */
class TwoFactorAuth
{
    /** Wrong codes allowed against one half-finished login before it has to be started over. */
    public function __construct(private readonly AuditLogger $audit) {}

    /**
     * Start enrollment: a fresh secret is generated and stored, unconfirmed.
     *
     * Calling this again replaces any unconfirmed secret, so an operator who lost the QR before
     * typing a code can simply start again — nothing is armed until a code is confirmed.
     */
    public function enroll(User $user): string
    {
        $secret = $this->engine()->generateSecretKey();

        $user->forceFill([
            'two_factor_secret' => $secret,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        $this->audit->log('security.two_factor.enrollment_started', $user, [], $user);

        return $secret;
    }

    /**
     * The `otpauth://` URI an authenticator app reads (the client is free to render it as a QR
     * code). Built here rather than in the browser so the secret never travels anywhere but this
     * one authenticated response.
     */
    public function provisioningUri(User $user, string $secret): string
    {
        $issuer = (string) config('security.two_factor.issuer', config('app.name', 'Medora'));

        $label = rawurlencode($issuer).':'.rawurlencode((string) $user->email);

        $query = http_build_query([
            'secret' => $secret,
            'issuer' => $issuer,
            'algorithm' => 'SHA1',
            'digits' => 6,
            'period' => 30,
        ], '', '&', PHP_QUERY_RFC3986);

        return "otpauth://totp/{$label}?{$query}";
    }

    /**
     * Confirm enrollment with a code from the app.
     *
     * @return array<int, string>|null The plaintext recovery codes, returned exactly once, or null
     *                                 when the code did not match.
     */
    public function confirm(User $user, string $code): ?array
    {
        $secret = $user->two_factor_secret;

        if (! is_string($secret) || $secret === '' || ! $this->codeMatches($secret, $code)) {
            $this->audit->log('security.two_factor.confirm_failed', $user, [], $user);

            return null;
        }

        $codes = $this->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_confirmed_at' => now(),
            'two_factor_recovery_codes' => json_encode(
                array_map(fn (string $plain): string => Hash::make($plain), $codes),
            ),
        ])->save();

        $this->audit->log('security.two_factor.enabled', $user, ['recovery_codes' => count($codes)], $user);

        return $codes;
    }

    /**
     * Verify a TOTP code for an already-confirmed account, and refuse to reuse the same step twice.
     */
    public function verify(User $user, string $code): bool
    {
        $secret = $user->two_factor_secret;

        if (! is_string($secret) || $secret === '' || ! $user->hasTwoFactorEnabled()) {
            return false;
        }

        if (! $this->codeMatches($secret, $code)) {
            return false;
        }

        // A code that has already been used for this account is refused, so a code captured from a
        // shoulder or a screenshot cannot be replayed inside its own 30-second window — and the
        // claim is made with `add()`, which only writes when the key is absent. A `has()` followed
        // by a `put()` would let two requests carrying the same code both be told yes.
        return Cache::add(
            $this->usedCodeKey($user, (string) preg_replace('/\D/', '', $code)),
            true,
            now()->addMinutes(5),
        );
    }

    /**
     * Consume a recovery code: it must match, and matching consumes it.
     *
     * Single use has to survive two requests arriving together, so the row is re-read under a lock
     * inside a transaction and the code is removed from *that* copy. Two callers holding the same
     * stale model would otherwise both find the code and both report success.
     */
    public function consumeRecoveryCode(User $user, string $code): bool
    {
        $candidate = mb_strtoupper(trim($code));

        return DB::transaction(function () use ($user, $candidate): bool {
            $locked = User::query()->whereKey($user->getKey())->lockForUpdate()->first();

            if (! $locked instanceof User) {
                return false;
            }

            $hashes = $locked->twoFactorRecoveryCodeHashes();

            foreach ($hashes as $index => $hash) {
                if (! Hash::check($candidate, $hash)) {
                    continue;
                }

                // Single use: the hash is removed as it is accepted, inside the same save.
                unset($hashes[$index]);

                $locked->forceFill([
                    'two_factor_recovery_codes' => $hashes === [] ? null : json_encode(array_values($hashes)),
                ])->save();

                // The caller's copy is brought up to date, so a status read in the same request does
                // not answer from the row that was just replaced.
                $user->setRawAttributes($locked->getAttributes(), true);

                $this->audit->log('security.two_factor.recovery_code_used', $locked, [
                    'remaining' => count($hashes),
                ], $locked);

                return true;
            }

            return false;
        });
    }

    /**
     * @return array<int, string> A fresh set, invalidating every previous code.
     */
    public function regenerateRecoveryCodes(User $user): array
    {
        $codes = $this->generateRecoveryCodes();

        $user->forceFill([
            'two_factor_recovery_codes' => json_encode(
                array_map(fn (string $plain): string => Hash::make($plain), $codes),
            ),
        ])->save();

        $this->audit->log('security.two_factor.recovery_codes_regenerated', $user, [
            'count' => count($codes),
        ], $user);

        return $codes;
    }

    /**
     * Turn the second factor off. The caller must already have re-authenticated: this method does
     * not ask for a password itself, on the principle that the check belongs in one place per
     * route (App\Http\Middleware\RequireRecentAuth).
     */
    public function disable(User $user): void
    {
        $user->forceFill([
            'two_factor_secret' => null,
            'two_factor_recovery_codes' => null,
            'two_factor_confirmed_at' => null,
        ])->save();

        $this->audit->log('security.two_factor.disabled', $user, [], $user);
    }

    public function remainingRecoveryCodes(User $user): int
    {
        return count($user->twoFactorRecoveryCodeHashes());
    }

    /**
     * Wrong codes counted against one half-finished login. Kept in the cache with a short life so
     * brute-forcing a six-digit code is bounded by time as well as by the route's rate limiter.
     *
     * @return int The number of failures now recorded for this user.
     */
    public function registerFailedAttempt(User $user): int
    {
        $key = $this->attemptKey($user);
        $attempts = (int) Cache::get($key, 0) + 1;

        Cache::put($key, $attempts, now()->addMinutes((int) config('security.two_factor.attempt_decay_minutes', 15)));

        return $attempts;
    }

    public function tooManyAttempts(User $user): bool
    {
        return (int) Cache::get($this->attemptKey($user), 0) >= (int) config('security.two_factor.max_attempts', 5);
    }

    public function clearAttempts(User $user): void
    {
        Cache::forget($this->attemptKey($user));
    }

    /**
     * A short-lived token that can only reach the challenge endpoint. It carries no staff
     * abilities, so a stolen one cannot read a single order.
     *
     * @return array{token: string, expires_at: ?string, token_id: ?int}
     */
    public function issueChallengeToken(User $user, string $deviceName = 'api'): array
    {
        return Tokens::issueWithAbilities(
            $user,
            [Tokens::twoFactorChallengeAbility()],
            $deviceName,
            now()->addMinutes((int) config('security.two_factor.challenge_ttl_minutes', 5)),
        );
    }

    private function codeMatches(string $secret, string $code): bool
    {
        $digits = preg_replace('/\D/', '', $code);

        if (! is_string($digits) || strlen($digits) !== 6) {
            return false;
        }

        try {
            return $this->engine()->verifyKey($secret, $digits, (int) config('security.two_factor.window', 1));
        } catch (Throwable) {
            // A malformed secret must answer "no", never blow up the login path.
            return false;
        }
    }

    /**
     * @return array<int, string>
     */
    private function generateRecoveryCodes(): array
    {
        $count = max(1, (int) config('security.two_factor.recovery_codes', 8));

        // Crockford-style alphabet: no I/O/0/1, so a code read off paper cannot be mistyped into
        // a different valid one.
        $alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

        $codes = [];

        for ($i = 0; $i < $count; $i++) {
            $codes[] = $this->randomBlock($alphabet, 5).'-'.$this->randomBlock($alphabet, 5);
        }

        return $codes;
    }

    private function randomBlock(string $alphabet, int $length): string
    {
        $max = strlen($alphabet) - 1;
        $block = '';

        for ($i = 0; $i < $length; $i++) {
            $block .= $alphabet[random_int(0, $max)];
        }

        return $block;
    }

    private function engine(): Google2FA
    {
        return new Google2FA;
    }

    private function attemptKey(User $user): string
    {
        return 'two-factor:attempts:'.Str::of((string) $user->getKey())->value;
    }

    /**
     * The claim that one already-accepted code cannot be spent twice. Keyed on the account and the
     * digits, and short-lived: the window it guards is 30 seconds long.
     */
    private function usedCodeKey(User $user, string $digits): string
    {
        return 'two-factor:used:'.$user->getKey().':'.$digits;
    }
}
