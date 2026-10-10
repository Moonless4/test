<?php

namespace Tests;

use App\Models\User;
use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

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
     * Re-authenticate for a sensitive operation, the way the panel does.
     *
     * Routes that change privileges or shop-wide settings sit behind `recent-auth`, so a test about
     * (say) suspending an account has to prove the password first — exactly as an operator does —
     * instead of the test suite having a way around the control. The factory password is
     * "password"; pass another value when a test sets its own.
     */
    protected function confirmPassword(User $user, string $password = 'password'): void
    {
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/auth/confirm-password', ['password' => $password])
            ->assertOk();
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
