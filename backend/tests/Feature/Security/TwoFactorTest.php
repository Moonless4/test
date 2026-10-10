<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Services\Security\TwoFactorAuth;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

/**
 * Administrator two-factor authentication, end to end.
 *
 * `phpunit.xml` turns the *requirement* off so the other feature tests can sign in as staff without
 * an authenticator; this file switches it on per test and proves both halves: that a confirmed
 * account cannot be used with a password alone, and that an account which has not enrolled cannot
 * reach the panel at all.
 */
class TwoFactorTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // No artificial delay in the suite; the delay policy itself is asserted in
        // AdminLoginShieldTest.
        config(['security.login_shield.progressive_delay_ms' => 0]);
    }

    private function staff(string $role = 'admin'): User
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    /**
     * Put an account into the "confirmed second factor" state the way the endpoints would, so a
     * test about *using* 2FA does not repeat the enrollment ceremony.
     *
     * @return array{secret: string, codes: array<int, string>}
     */
    private function armTwoFactor(User $user): array
    {
        $twoFactor = app(TwoFactorAuth::class);
        $secret = $twoFactor->enroll($user);
        $codes = $twoFactor->confirm($user, (new Google2FA)->getCurrentOtp($secret));

        $this->assertIsArray($codes);

        return ['secret' => $secret, 'codes' => $codes];
    }

    private function currentCode(string $secret): string
    {
        return (new Google2FA)->getCurrentOtp($secret);
    }

    public function test_enrollment_returns_the_secret_once_and_the_status_endpoint_never_does(): void
    {
        $user = $this->staff();

        $enrolled = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/auth/two-factor/enroll')
            ->assertOk();

        $secret = $enrolled->json('data.secret');

        $this->assertIsString($secret);
        $this->assertGreaterThanOrEqual(16, strlen($secret));
        $this->assertStringStartsWith('otpauth://totp/', (string) $enrolled->json('data.otpauth_url'));
        // A URI an authenticator can read, and nothing else: no recovery codes at this point.
        $this->assertArrayNotHasKey('recovery_codes', $enrolled->json('data'));

        // The status endpoint reports state, and the account resource reports a boolean.
        $status = $this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/two-factor')->assertOk();

        $this->assertArrayNotHasKey('secret', $status->json('data'));
        $this->assertFalse($status->json('data.enabled'));
        $this->assertTrue($status->json('data.required'));

        $me = $this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/me')->assertOk();

        $this->assertStringNotContainsString($secret, $me->getContent());
        $this->assertFalse($me->json('data.user.two_factor_enabled'));
    }

    public function test_confirming_stores_the_secret_encrypted_and_the_recovery_codes_hashed(): void
    {
        $user = $this->staff();

        $secret = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/auth/two-factor/enroll')->assertOk()->json('data.secret');

        $confirmed = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/auth/two-factor/confirm', ['code' => $this->currentCode($secret)])
            ->assertOk();

        $codes = $confirmed->json('data.recovery_codes');

        $this->assertCount((int) config('security.two_factor.recovery_codes'), $codes);

        // The plaintext secret is nowhere in the row: what is stored is ciphertext under APP_KEY.
        $stored = DB::table('users')->where('id', $user->getKey())->first();

        $this->assertNotSame($secret, $stored->two_factor_secret);
        $this->assertStringNotContainsString($secret, (string) $stored->two_factor_secret);
        $this->assertNotNull($stored->two_factor_confirmed_at);

        // Recovery codes are bcrypt hashes: the row contains neither the plaintext nor anything a
        // brute force can turn back into one.
        $this->assertStringNotContainsString($codes[0], (string) $stored->two_factor_recovery_codes);

        $hashes = json_decode((string) $stored->two_factor_recovery_codes, true);

        $this->assertIsArray($hashes);
        $this->assertTrue(Hash::check($codes[0], $hashes[0]));

        // And the audit trail records that it happened, without recording the secret or a code.
        $this->assertDatabaseHas('audit_logs', ['event' => 'security.two_factor.enabled']);

        $entry = DB::table('audit_logs')->where('event', 'security.two_factor.enabled')->first();

        $this->assertStringNotContainsString($secret, (string) $entry->metadata);
        $this->assertStringNotContainsString($codes[0], (string) $entry->metadata);
        $this->assertStringNotContainsString($codes[0], (string) $entry->description);
    }

    public function test_a_password_alone_can_no_longer_open_the_panel(): void
    {
        $user = $this->staff('super-admin');
        $armed = $this->armTwoFactor($user);

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'phpunit',
        ])->assertOk();

        // No session is handed out: only a token that can reach the challenge endpoint.
        $challengeToken = $login->json('data.challenge_token');

        $this->assertTrue($login->json('data.two_factor_required'));
        $this->assertNull($login->json('data.token'));
        $this->assertNotNull($challengeToken);

        // The half-finished login is worth nothing: not the admin API, not the session list.
        $this->withToken($challengeToken)->getJson('/api/v1/admin/products')
            ->assertStatus(403)
            ->assertJsonPath('code', 'two_factor_required');

        $this->withToken($challengeToken)->getJson('/api/v1/auth/sessions')->assertStatus(403);

        // Wrong code: refused, and recorded.
        $this->withToken($challengeToken)
            ->postJson('/api/v1/auth/two-factor/challenge', ['code' => '000001'])
            ->assertStatus(422)
            ->assertJsonPath('code', 'invalid_two_factor_code');

        $this->assertDatabaseHas('login_attempts', ['reason' => 'two_factor_failed', 'successful' => false]);

        // Right code: a full token, which rotates the challenge token out of existence.
        $verified = $this->withToken($challengeToken)
            ->postJson('/api/v1/auth/two-factor/challenge', ['code' => $this->currentCode($armed['secret'])])
            ->assertOk();

        $token = $verified->json('data.token');

        $this->assertNotEmpty($token);

        $this->withToken($token)->getJson('/api/v1/admin/products')->assertOk();

        // The challenge token is gone.
        $this->forgetResolvedGuards();
        $this->withToken($challengeToken)->getJson('/api/v1/admin/products')->assertStatus(401);
    }

    public function test_a_second_factor_code_cannot_be_replayed(): void
    {
        $user = $this->staff('super-admin');
        $armed = $this->armTwoFactor($user);

        $code = $this->currentCode($armed['secret']);

        $login = fn (): string => $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'phpunit',
        ])->json('data.challenge_token');

        $this->withToken($login())
            ->postJson('/api/v1/auth/two-factor/challenge', ['code' => $code])
            ->assertOk();

        // The very same code, inside its own 30-second window, is refused: a code captured from a
        // shoulder or a screenshot is single-use.
        $this->withToken($login())
            ->postJson('/api/v1/auth/two-factor/challenge', ['code' => $code])
            ->assertStatus(422);

        // A code from the next window works again.
        $this->travel(31)->seconds();

        $this->withToken($login())
            ->postJson('/api/v1/auth/two-factor/challenge', ['code' => $this->currentCode($armed['secret'])])
            ->assertOk();
    }

    public function test_a_recovery_code_works_exactly_once(): void
    {
        $user = $this->staff('super-admin');
        $armed = $this->armTwoFactor($user);
        $code = $armed['codes'][0];

        $challengeToken = fn (): string => $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'phpunit',
        ])->json('data.challenge_token');

        $this->withToken($challengeToken())
            ->postJson('/api/v1/auth/two-factor/challenge', ['recovery_code' => $code])
            ->assertOk();

        $this->assertDatabaseHas('audit_logs', ['event' => 'security.two_factor.recovery_code_used']);

        // Single use: the hash was removed as it was accepted.
        $this->withToken($challengeToken())
            ->postJson('/api/v1/auth/two-factor/challenge', ['recovery_code' => $code])
            ->assertStatus(422);

        $status = $this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/two-factor')->assertOk();

        $this->assertSame(
            (int) config('security.two_factor.recovery_codes') - 1,
            $status->json('data.recovery_codes_remaining'),
        );
    }

    public function test_an_admin_who_has_not_enrolled_can_only_enroll(): void
    {
        config(['security.two_factor.enforce_admins' => true]);

        $user = $this->staff('super-admin');

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'phpunit',
        ])->assertOk();

        $this->assertTrue($login->json('data.two_factor_setup_required'));

        $setupToken = $login->json('data.token');

        // The panel is closed until the second factor exists — and the refusal says exactly which
        // state the account is in, so the UI can send the operator to the right screen.
        $this->withToken($setupToken)->getJson('/api/v1/admin/products')
            ->assertStatus(403)
            ->assertJsonPath('code', 'two_factor_setup_required');

        $secret = $this->withToken($setupToken)
            ->postJson('/api/v1/auth/two-factor/enroll')->assertOk()->json('data.secret');

        $confirmed = $this->withToken($setupToken)
            ->postJson('/api/v1/auth/two-factor/confirm', ['code' => $this->currentCode($secret)])
            ->assertOk();

        $this->assertCount(8, $confirmed->json('data.recovery_codes'));

        // Confirmation hands out a *verified* token, so the operator is not sent through a
        // challenge they cannot satisfy without restarting the login.
        $this->withToken($confirmed->json('data.token'))->getJson('/api/v1/admin/products')->assertOk();

        // The setup token is gone.
        $this->forgetResolvedGuards();
        $this->withToken($setupToken)->getJson('/api/v1/admin/products')->assertStatus(401);
    }

    public function test_turning_the_second_factor_off_needs_the_password_and_is_refused_for_staff(): void
    {
        config(['security.two_factor.enforce_admins' => false]);

        $user = $this->staff('super-admin');
        $this->armTwoFactor($user);

        // Without re-authentication the downgrade is refused.
        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/auth/two-factor')
            ->assertStatus(423)
            ->assertJsonPath('code', 'recent_auth_required');

        // Still armed.
        $this->assertTrue($user->fresh()->hasTwoFactorEnabled());

        // With it, a shop that requires 2FA of staff still refuses to let the account remove it.
        config(['security.two_factor.enforce_admins' => true]);

        $this->confirmPassword($user);

        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/auth/two-factor')
            ->assertStatus(403)
            ->assertJsonPath('code', 'two_factor_required');

        $this->assertTrue($user->fresh()->hasTwoFactorEnabled());
    }

    public function test_too_many_wrong_codes_abandon_the_challenge(): void
    {
        $user = $this->staff('super-admin');
        $this->armTwoFactor($user);

        // A six-digit code from a *different* secret can never match this account.
        $otherSecret = (new Google2FA)->generateSecretKey();

        $challengeToken = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'phpunit',
        ])->json('data.challenge_token');

        $maxAttempts = (int) config('security.two_factor.max_attempts');

        for ($attempt = 0; $attempt < $maxAttempts; $attempt++) {
            $this->withToken($challengeToken)
                ->postJson('/api/v1/auth/two-factor/challenge', ['code' => $this->currentCode($otherSecret)])
                ->assertStatus(422);
        }

        // The challenge is abandoned rather than left open for the next six-digit guess.
        $this->withToken($challengeToken)
            ->postJson('/api/v1/auth/two-factor/challenge', ['code' => $this->currentCode($otherSecret)])
            ->assertStatus(429)
            ->assertJsonPath('code', 'two_factor_locked');

        $this->assertDatabaseHas('audit_logs', ['event' => 'auth.two_factor_abandoned']);

        // And the abandoned token is dead.
        $this->forgetResolvedGuards();
        $this->withToken($challengeToken)->postJson('/api/v1/auth/two-factor/challenge', ['code' => '123456'])
            ->assertStatus(401);
    }

    public function test_customers_are_unaffected_by_the_staff_requirement(): void
    {
        config(['security.two_factor.enforce_admins' => true]);

        $customer = User::factory()->create();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $customer->email,
            'password' => 'password',
        ])->assertOk();

        $this->assertNull($login->json('data.two_factor_setup_required'));
        $this->assertNotEmpty($login->json('data.token'));
    }
}
