<?php

namespace App\Services\Security;

use App\Models\LoginAttempt;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Throwable;

/**
 * Brute-force, credential-stuffing and suspicious-login handling.
 *
 * Design decisions worth keeping:
 *
 *  - **Lockout is temporary and pair-keyed** (email + address). A permanent lock, or one keyed on
 *    the email alone, would hand anybody a denial-of-service lever against a known administrator.
 *    Here the attacker locks *their own* pair and nothing else.
 *  - **Every attempt is recorded** (`login_attempts`), successful or not — that is the data the
 *    detection below reads.
 *  - **The IP is never an identity.** It is one signal among several: a shared carrier NAT makes
 *    "same address" meaningless on its own, and a mobile network changes it between requests.
 *  - **Detection rules stay server-side.** The events carry a reason and the facts that triggered
 *    them; nothing in a response tells a caller what the thresholds are.
 */
class LoginShield
{
    public function __construct(private readonly AuditLogger $audit) {}

    /**
     * Seconds left on this pair's temporary lockout, 0 when it is not locked.
     */
    public function lockedSeconds(string $email, string $ip): int
    {
        $until = Cache::get($this->lockKey($email, $ip));

        if (! is_int($until) || $until <= now()->getTimestamp()) {
            return 0;
        }

        return $until - now()->getTimestamp();
    }

    /**
     * Record a failed attempt and (past the threshold) start the temporary lockout.
     *
     * @return int The delay in milliseconds the caller should apply before answering — the
     *             progressive delay that makes a scripted attack slower without blocking a person
     *             who simply mistyped.
     */
    public function registerFailure(?User $user, string $email, string $reason = 'password'): int
    {
        $email = mb_strtolower(trim($email));
        $ip = $this->request()->ip();

        $this->record($email, $ip, $user, false, $reason);

        $failuresKey = $this->failureKey($email, $ip);
        $failures = (int) Cache::get($failuresKey, 0) + 1;

        Cache::put($failuresKey, $failures, now()->addMinutes((int) config('security.login_shield.failure_decay_minutes', 30)));

        if ($failures >= (int) config('security.login_shield.max_failures', 5)) {
            Cache::put(
                $this->lockKey($email, $ip),
                now()->addMinutes((int) config('security.login_shield.lockout_minutes', 15))->getTimestamp(),
                now()->addMinutes((int) config('security.login_shield.lockout_minutes', 15)),
            );

            $this->audit->log('auth.login_throttled', $user, [
                'email' => $email,
                'failures' => $failures,
                'lockout_minutes' => (int) config('security.login_shield.lockout_minutes', 15),
            ], $user);
        }

        return $this->delayFor($failures);
    }

    /**
     * A sign-in that got past the password. Clears the pair's failure budget and returns what the
     * caller needs to finish the flow.
     */
    public function registerSuccess(User $user, string $reason = 'password'): void
    {
        $ip = $this->request()->ip();

        Cache::forget($this->failureKey((string) $user->email, $ip));

        $this->record((string) $user->email, $ip, $user, true, $reason);
    }

    /**
     * A failed credential check that is not a login: a wrong second-factor code, a wrong password
     * at the re-authentication endpoint. Recorded with its own reason so the detection queries can
     * tell the two apart, and deliberately not counted against the login budget — a mistyped
     * recovery code must not lock the login form.
     */
    public function registerFailedCheck(User $user, string $reason): void
    {
        $this->record((string) $user->email, $this->request()->ip(), $user, false, $reason);
    }

    /**
     * The suspicious-login pass. Called after the password (and second factor) are satisfied and
     * *before* the session is handed over, so the operator is told and the event is on the record
     * even if the sign-in turns out to be an attacker who got the password right.
     */
    public function inspect(User $user, string $device, ?string $country): void
    {
        $ip = (string) $this->request()->ip();

        $newIp = is_string($user->last_login_ip) && $user->last_login_ip !== '' && $user->last_login_ip !== $ip;
        $newDevice = is_string($user->last_login_device) && $user->last_login_device !== '' && $user->last_login_device !== $device;
        $newCountry = is_string($user->last_login_country) && $user->last_login_country !== '' && $country !== null && $user->last_login_country !== $country;

        if ($newIp) {
            $this->audit->log('auth.new_ip', $user, ['ip' => $ip], $user);
        }

        if ($newDevice) {
            $this->audit->log('auth.new_device', $user, ['device' => $device], $user);
        }

        /*
         * A sign-in from a device or address this account has not used before is the one event
         * where telling the owner is worth an email: if it was not them, they can still change the
         * password. The message carries the facts and never a code, a token or a link.
         */
        if ($newIp || $newDevice) {
            $this->notify($user, 'ورود جدیدی به حساب شما ثبت شد.', [
                'device' => $device,
                'ip' => $ip,
                'at' => now()->toIso8601String(),
            ]);
        }

        // "Impossible travel": a different country inside the window where a real trip could not
        // have happened. Only checked when a trusted proxy supplied the country — a guess from an
        // untrusted header would be worse than no signal at all.
        if ($newCountry && $this->withinTravelWindow($user)) {
            $this->audit->log('auth.impossible_travel', $user, [
                'from_country' => $user->last_login_country,
                'to_country' => $country,
                'ip' => $ip,
            ], $user);
        }

        // Several live sessions at once is a weak signal, but it is the one a shared password
        // leaves behind, so it is recorded rather than acted on.
        $count = $user->tokens()->count();

        if ($count > (int) config('security.login_shield.session_watch', 5)) {
            $this->audit->log('auth.many_sessions', $user, ['sessions' => $count], $user);
        }
    }

    /**
     * Tell the account owner something changed, without telling them anything an attacker could
     * use. Failures here are logged, never surfaced: a mail problem must not break a security
     * operation, and it must not reveal whether the address exists.
     */
    public function notify(User $user, string $message, array $context = []): void
    {
        try {
            $user->notify(new \App\Notifications\SecurityAlertNotification($message, $context));
        } catch (Throwable $exception) {
            Log::warning('Security notification could not be sent.', [
                'user' => $user->getKey(),
                'error' => $exception->getMessage(),
            ]);
        }
    }

    /**
     * The country a trusted proxy reported, or null. Cloudflare (and most WAFs) can be configured
     * to send it; when the request did not come through a trusted proxy the header is ignored,
     * because a client can set any header it likes.
     */
    public function countryFrom(Request $request): ?string
    {
        if (! $request->isFromTrustedProxy()) {
            return null;
        }

        $country = strtoupper(trim((string) $request->header('CF-IPCountry', '')));

        return preg_match('/^[A-Z]{2}$/', $country) === 1 ? $country : null;
    }

    /**
     * The device label the client sent, trimmed and capped — a label, never an identity.
     */
    public function deviceFrom(Request $request): string
    {
        $device = trim((string) $request->input('device_name', ''));

        return mb_substr($device !== '' ? $device : 'api', 0, 100);
    }

    private function delayFor(int $failures): int
    {
        $base = max(0, (int) config('security.login_shield.progressive_delay_ms', 250));
        $cap = max($base, (int) config('security.login_shield.progressive_delay_cap_ms', 1000));

        if ($base === 0) {
            return 0;
        }

        // Linear growth with a hard cap: predictable, and never a lever an attacker can pull to
        // keep a worker busy for long.
        return min($cap, $base * max(1, $failures));
    }

    private function withinTravelWindow(User $user): bool
    {
        $window = (int) config('security.login_shield.travel_window_hours', 12);

        if ($window <= 0 || $user->last_login_at === null) {
            return true;
        }

        return $user->last_login_at->greaterThan(now()->subHours($window));
    }

    private function record(string $email, ?string $ip, ?User $user, bool $successful, ?string $reason, ?string $country = null): void
    {
        $request = $this->request();

        LoginAttempt::query()->create([
            'email' => $email !== '' ? $email : null,
            'ip' => $ip,
            'user_agent' => mb_substr((string) $request->userAgent(), 0, 255) ?: null,
            'country' => $country ?? $this->countryFrom($request),
            'device' => $this->deviceFrom($request),
            'successful' => $successful,
            'reason' => $reason,
            'created_at' => now(),
        ]);
    }

    /**
     * The current request, from the container: `Request::createFromGlobals()` would build a second
     * object that does not know about the proxies this application trusts.
     */
    private function request(): Request
    {
        return app('request');
    }

    private function failureKey(string $email, string $ip): string
    {
        return 'login:fail:'.hash('sha256', mb_strtolower($email).'|'.$ip);
    }

    private function lockKey(string $email, string $ip): string
    {
        return 'login:lock:'.hash('sha256', mb_strtolower($email).'|'.$ip);
    }
}
