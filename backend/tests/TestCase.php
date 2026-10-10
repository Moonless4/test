<?php

namespace Tests;

use App\Models\User;
use App\Support\Tokens;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use PragmaRX\Google2FA\Google2FA;

/**
 * Base test case.
 *
 * The environment is forced here, before the application boots, and that is not paranoia:
 *
 *  - PHPUnit's `<env>` entries only apply when the variable is not already set, and Laravel reads
 *    `$_SERVER` first — so on a machine where the real infrastructure values are exported (this
 *    sandbox sets `DB_CONNECTION=mysql`, the public host, the payment gateway … through Compose),
 *    the suite would silently inherit them. `RefreshDatabase` would then run against the real
 *    development database and wipe it, and requests would be checked against the real host
 *    allowlist.
 *  - Writing `$_SERVER`, `$_ENV` and `putenv()` covers all three places Laravel's environment
 *    repository looks, so the override always wins.
 *
 * The result: a test run touches SQLite in memory, an array cache, a sync queue and the fake
 * payment gateway — no database, no network, no external state.
 */
abstract class TestCase extends BaseTestCase
{
    /** @var array<string, string> */
    private const ENV_OVERRIDES = [
        'APP_ENV' => 'testing',
        'APP_DEBUG' => 'true',
        'APP_URL' => 'http://localhost',
        'DB_CONNECTION' => 'sqlite',
        'DB_DATABASE' => ':memory:',
        'DB_HOST' => '127.0.0.1',
        'CACHE_STORE' => 'array',
        'SESSION_DRIVER' => 'array',
        'QUEUE_CONNECTION' => 'sync',
        'MAIL_MAILER' => 'array',
        'BCRYPT_ROUNDS' => '4',
        'PAYMENT_GATEWAY' => 'fake',
        'PAYMENT_CALLBACK_URL' => 'https://api.test/api/v1/payments/callback',
        // Host and origin checking are exercised deliberately by RequestGuardTest, which sets the
        // configuration it needs per test; by default they must not block the test client.
        'TRUSTED_HOSTS' => '',
        'CORS_ALLOWED_ORIGINS' => '',
        // The test client is not a proxy: nothing it sends in X-Forwarded-*/CF-IPCountry may be
        // believed. The suite and compose both leave TRUST_PROXIES empty, and this override pins
        // that here so the country- and address-based detections can never run on values the caller
        // chose — the opposite of what their tests assert (see AdminLoginShieldTest).
        'TRUST_PROXIES' => '',
    ];

    protected function setUp(): void
    {
        $this->forceTestingEnvironment();

        parent::setUp();
    }

    private function forceTestingEnvironment(): void
    {
        foreach (self::ENV_OVERRIDES as $key => $value) {
            putenv("{$key}={$value}");
            $_ENV[$key] = $value;
            $_SERVER[$key] = $value;
        }
    }

    /**
     * Staff tokens handed out by `actingAsStaff()`, by account id — so `confirmPassword()` knows the
     * proof belongs to a bearer token rather than to a session.
     *
     * @var array<int, string>
     */
    private array $staffTokens = [];

    /**
     * Sign in as staff the way the panel does: with a personal access token that has answered the
     * second factor.
     *
     * A session (`actingAs`) is deliberately *not* enough on the admin routes — `RequireTwoFactor`
     * refuses a request carrying Sanctum's transient token, because "the browser sent a cookie" must
     * never stand in for the second factor — and the panel authenticates with a bearer token. So the
     * admin tests sign in like an operator instead of the suite having a way around the control.
     *
     * The account is enrolled here when it has not been yet (the shop requires a second factor of
     * staff), and the token carries exactly the abilities the challenge hands out once a code is
     * accepted (`TwoFactorChallengeController`).
     */
    protected function actingAsStaff(User $user): static
    {
        // One token per account per test, as in the panel: a second call must not silently replace
        // the token a `recent-auth` proof was just given for.
        if (isset($this->staffTokens[$user->getKey()])) {
            return $this->withToken($this->staffTokens[$user->getKey()]);
        }

        if (! $user->hasTwoFactorEnabled()) {
            // The state a *finished* enrollment leaves behind. Written here rather than through
            // `TwoFactorAuth` because that service audits what it does, and a fixture must not add
            // rows the audit tests count; the real enrollment flow is covered by TwoFactorTest.
            // Nothing on an admin route validates the secret — `RequireTwoFactor` reads the token's
            // verified ability, and `hasTwoFactorEnabled()` only asks that the factor was confirmed.
            $user->forceFill([
                'two_factor_secret' => (new Google2FA)->generateSecretKey(),
                'two_factor_confirmed_at' => now(),
            ])->save();
        }

        $abilities = Tokens::abilitiesFor($user);
        $abilities[] = Tokens::twoFactorVerifiedAbility();

        $issued = Tokens::issueWithAbilities($user, $abilities, 'phpunit');

        $this->staffTokens[$user->getKey()] = $issued['token'];

        return $this->withToken($issued['token']);
    }

    /**
     * Re-authenticate for a sensitive operation, the way the panel does.
     *
     * Routes that change privileges or shop-wide settings sit behind `recent-auth`, so a test about
     * (say) suspending an account has to prove the password first — exactly as an operator does —
     * instead of the test suite having a way around the control. The factory password is
     * "password"; pass another value when a test sets its own.
     *
     * A test that signed in through `actingAsStaff()` gives the proof with *that* token: the
     * confirmation is remembered per token, so a proof made in a session would leave the panel's own
     * token locked and the next request answered 423.
     */
    protected function confirmPassword(User $user, string $password = 'password'): void
    {
        if (! isset($this->staffTokens[$user->getKey()])) {
            $this->actingAs($user, 'sanctum');
        }

        $this->postJson('/api/v1/auth/confirm-password', ['password' => $password])->assertOk();
    }

    /**
     * Drops the resolved auth guards between two requests inside one test.
     *
     * In production every request is a fresh process, so a token deleted by a logout is gone on the
     * next call. A test method shares one container across several requests, and the guard caches
     * the user it resolved — without this, a test that revokes a token and then calls the API again
     * would still look authenticated and report a false failure.
     */
    protected function forgetResolvedGuards(): void
    {
        $this->app['auth']->forgetGuards();
    }
}
