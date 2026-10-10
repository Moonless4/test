<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Notifications\SecurityAlertNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * The login shield: brute force, credential stuffing and the suspicious-signin pass.
 *
 * Every assertion here is about *behaviour that can be observed from outside* — a status code, an
 * audit row, a notification — because that is all an attacker sees. The thresholds themselves are
 * configuration, and are read from config in the test so a host that tightens them does not break
 * the suite.
 */
class AdminLoginShieldTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // The progressive delay is a real control but a poor use of test time; the *policy* is
        // asserted separately below. Everything else runs at full strength.
        config(['security.login_shield.progressive_delay_ms' => 0]);
    }

    private function user(string $password = 'password'): User
    {
        return User::factory()->create(['password' => $password]);
    }

    private function failLogin(string $email, string $password = 'wrong-password', array $server = [])
    {
        if ($server !== []) {
            $this->withServerVariables($server);
        }

        return $this->postJson('/api/v1/auth/login', ['email' => $email, 'password' => $password]);
    }

    public function test_repeated_failures_lock_the_pair_temporarily(): void
    {
        $user = $this->user();
        $max = (int) config('security.login_shield.max_failures');

        for ($attempt = 0; $attempt < $max; $attempt++) {
            $this->failLogin($user->email)->assertStatus(422);
        }

        $this->failLogin($user->email)->assertStatus(429)->assertJsonPath('code', 'login_throttled');
        $this->assertDatabaseHas('audit_logs', ['event' => 'auth.login_throttled']);

        // Not even the *right* password opens the door while the pair is locked — that is the point
        // of a lockout — and the window is bounded, so it cannot be used to shut an operator out
        // permanently.
        $this->failLogin($user->email, 'password')->assertStatus(429);

        $this->travel((int) config('security.login_shield.lockout_minutes') + 1)->minutes();

        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password'])
            ->assertOk()
            ->assertJsonStructure(['data' => ['token']]);
    }

    public function test_the_lock_is_keyed_on_the_pair_not_the_account(): void
    {
        $user = $this->user();
        $max = (int) config('security.login_shield.max_failures');

        for ($attempt = 0; $attempt < $max; $attempt++) {
            $this->failLogin($user->email)->assertStatus(422);
        }

        $this->failLogin($user->email)->assertStatus(429);

        // Same address, another account: unaffected. Failing logins against a known administrator
        // must not be usable as a denial-of-service switch.
        $this->failLogin('someone-else@example.com')->assertStatus(422);

        // Same account, another address: unaffected too.
        $this->failLogin($user->email, 'wrong-password', ['REMOTE_ADDR' => '198.51.100.7'])->assertStatus(422);
    }

    public function test_a_successful_login_clears_the_failure_budget(): void
    {
        $user = $this->user();

        $this->failLogin($user->email)->assertStatus(422);
        $this->failLogin($user->email)->assertStatus(422);

        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password'])->assertOk();

        // The budget starts again, so somebody who mistyped twice during the day is not one
        // failure away from a lockout.
        $this->failLogin($user->email)->assertStatus(422);

        $this->assertDatabaseHas('login_attempts', [
            'email' => $user->email,
            'successful' => true,
        ]);
    }

    public function test_every_attempt_is_recorded_without_a_credential_ever_being_stored(): void
    {
        $user = $this->user();

        $this->failLogin($user->email, 'SuperSecret!234')->assertStatus(422);
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password'])->assertOk();

        $rows = \DB::table('login_attempts')->get();

        $this->assertCount(2, $rows);
        $this->assertSame(0, (int) $rows->first()->successful);
        $this->assertSame('password', $rows->first()->reason);

        // Not the submitted password, and not a hash of it: the table records that an attempt
        // happened, never what was typed.
        foreach ($rows as $row) {
            foreach ((array) $row as $value) {
                $this->assertStringNotContainsString('SuperSecret!234', (string) $value);
                $this->assertDoesNotMatchRegularExpression('/\$2[aby]\$/', (string) $value);
            }
        }
    }

    public function test_a_signin_from_a_new_address_and_device_is_recorded_and_reported(): void
    {
        Notification::fake();

        $user = $this->user();
        $user->forceFill([
            'last_login_ip' => '203.0.113.10',
            'last_login_device' => 'iPhone',
            'last_login_at' => now()->subDay(),
        ])->save();

        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'Chrome on Windows',
        ])->assertOk();

        $this->assertDatabaseHas('audit_logs', ['event' => 'auth.new_ip']);
        $this->assertDatabaseHas('audit_logs', ['event' => 'auth.new_device']);

        Notification::assertSentTo($user, SecurityAlertNotification::class);
    }

    public function test_a_client_supplied_country_header_is_not_trusted(): void
    {
        $user = $this->user();
        $user->forceFill([
            'last_login_ip' => '203.0.113.10',
            'last_login_country' => 'IR',
            'last_login_at' => now()->subMinutes(30),
        ])->save();

        // The test client is not behind a trusted proxy, so this header is attacker-controlled and
        // must be ignored — otherwise anyone could fabricate "impossible travel" or hide their own.
        $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ], ['CF-IPCountry' => 'US'])->assertOk();

        $this->assertDatabaseMissing('audit_logs', ['event' => 'auth.impossible_travel']);
        $this->assertSame('IR', $user->fresh()->last_login_country);
    }

    public function test_an_unusual_number_of_live_sessions_is_recorded(): void
    {
        $user = $this->user();
        $watch = (int) config('security.login_shield.session_watch');

        for ($i = 0; $i <= $watch; $i++) {
            $user->createToken('device-'.$i);
        }

        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password'])->assertOk();

        $this->assertDatabaseHas('audit_logs', ['event' => 'auth.many_sessions']);
    }

    public function test_the_progressive_delay_grows_and_is_capped(): void
    {
        $base = 120;
        $cap = 300;

        config([
            'security.login_shield.progressive_delay_ms' => $base,
            'security.login_shield.progressive_delay_cap_ms' => $cap,
        ]);

        $shield = app(\App\Services\Security\LoginShield::class);
        $user = $this->user();

        // One failure pays the base delay, several failures are capped rather than unbounded: a
        // long sleep would be a lever an attacker could pull to occupy every worker.
        $this->assertSame($base, $shield->registerFailure($user, $user->email));
        $this->assertSame($base * 2, $shield->registerFailure($user, $user->email));
        $this->assertSame($base * 3, $shield->registerFailure($user, $user->email));
        $this->assertSame($cap, $shield->registerFailure($user, $user->email));
        $this->assertSame($cap, $shield->registerFailure($user, $user->email));
    }
}
