<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Services\Security\TwoFactorAuth;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Notification;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

/**
 * The mandatory second factor, end to end: the ways *into* the shop that must not exist.
 *
 * `TwoFactorTest` covers the flow and `TwoFactorBypassTest` covers the doors a half-finished login
 * must not open. This file covers the three questions an auditor asks last:
 *
 *  1. Does **account recovery** quietly undo the second factor? (A password reset takes the
 *     password back; it must not take the second factor with it.)
 *  2. Does any **other** token-issuing endpoint hand a staff account a finished session — the
 *     registration endpoint included, since it is the one place a caller supplies their own data?
 *  3. Does anything the API answers, or anything it writes down, carry a secret — the TOTP secret,
 *     a recovery code, a raw token, a password, or an internal exception?
 *
 * A note on the harness: `actingAs()` caches the resolved Sanctum guard for the rest of the test
 * method, so a request made with `withToken()` after it is answered as the session user instead of
 * as the token. Tests that rotate tokens call `forgetResolvedGuards()`; in production every request
 * is its own process, so the guard is never carried over.
 */
class AuthenticationRegressionTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(RoleAndPermissionSeeder::class);

        config(['security.login_shield.progressive_delay_ms' => 0]);
        config(['security.two_factor.enforce_admins' => true]);
    }

    private function staff(string $role = 'super-admin', string $password = 'password'): User
    {
        $user = User::factory()->create(['password' => $password]);
        $user->assignRole($role);

        return $user;
    }

    /**
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

    /**
     * The reset the user asked for — the new password is known, the second factor is not.
     */
    public function test_a_password_reset_cannot_bypass_an_enrolled_second_factor(): void
    {
        Notification::fake();

        $user = $this->staff('super-admin', 'OldPass!2345');
        $this->armTwoFactor($user);

        $this->postJson('/api/v1/auth/password/forgot', ['email' => $user->email])->assertOk();

        $token = null;

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use (&$token): bool {
            $token = $notification->token;

            return true;
        });

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => $user->email,
            'token' => $token,
            'password' => 'BrandNew!2345',
            'password_confirmation' => 'BrandNew!2345',
        ])->assertOk();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'BrandNew!2345',
        ])->assertOk();

        // The password is new; the login still stops at the challenge, and no session is issued.
        $this->assertTrue($login->json('data.two_factor_required'));
        $this->assertNull($login->json('data.token'));
        $this->assertIsString($login->json('data.challenge_token'));

        $this->withToken($login->json('data.challenge_token'))
            ->getJson('/api/v1/admin/products')
            ->assertStatus(403)
            ->assertJsonPath('code', 'two_factor_required');

        // Recovery did not touch the second factor itself.
        $this->assertTrue($user->fresh()->hasTwoFactorEnabled());
    }

    /**
     * Registration is the one endpoint where a caller supplies their own account data, so it is the
     * obvious place to try to arrive with a role already attached.
     */
    public function test_registration_cannot_create_a_staff_account_or_borrow_privileges(): void
    {
        Notification::fake();

        $response = $this->postJson('/api/v1/auth/register', [
            'name' => 'مهاجم',
            'email' => 'attacker@example.com',
            'phone' => '09120000000',
            'password' => 'Str0ngPass!234',
            'password_confirmation' => 'Str0ngPass!234',
            // Ignored: the controller names the columns it writes and assigns `customer` itself.
            'role' => 'super-admin',
            'roles' => ['super-admin'],
            'status' => 'active',
        ])->assertCreated();

        $created = User::query()->where('email', 'attacker@example.com')->firstOrFail();

        $this->assertTrue($created->hasRole('customer'));
        $this->assertFalse($created->isStaff());
        $this->assertFalse($created->requiresTwoFactor());

        // And the token it hands out is a customer's token: no admin surface, second factor or not.
        $this->withToken($response->json('data.token'))
            ->getJson('/api/v1/admin/products')
            ->assertStatus(403);
    }

    /**
     * The whole protected surface, from a token that is still holding the "you must enroll" step.
     */
    public function test_an_unenrolled_administrator_holds_no_privileges_until_a_code_is_confirmed(): void
    {
        $user = $this->staff();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk();

        $this->assertTrue($login->json('data.two_factor_setup_required'));

        $setup = $login->json('data.token');

        foreach ([
            '/api/v1/auth/me',
            '/api/v1/auth/sessions',
            '/api/v1/profile',
            '/api/v1/orders',
            '/api/v1/admin/products',
            '/api/v1/admin/orders',
            '/api/v1/admin/users',
            '/api/v1/admin/settings',
            '/api/v1/admin/audit-logs',
            '/api/v1/admin/coupons',
            '/api/v1/admin/media',
        ] as $path) {
            $this->withToken($setup)->getJson($path)
                ->assertStatus(403)
                ->assertJsonPath('code', 'two_factor_setup_required');
        }

        // The password may not be re-entered (which would be a way back to a full session), and the
        // security settings may not be read.
        $this->withToken($setup)->postJson('/api/v1/auth/confirm-password', ['password' => 'password'])
            ->assertStatus(403);

        $this->withToken($setup)->postJson('/api/v1/auth/two-factor/recovery-codes')
            ->assertStatus(403);

        $this->withToken($setup)->deleteJson('/api/v1/auth/two-factor')
            ->assertStatus(403);

        // Confirming before the enrollment was even started is refused too.
        $this->withToken($setup)->postJson('/api/v1/auth/two-factor/confirm', ['code' => '000000'])
            ->assertStatus(409)
            ->assertJsonPath('code', 'two_factor_not_started');

        // Enrollment hands out a secret — and that is all it hands out. A wrong code arms nothing:
        // no session, no privileges, and the account still has no confirmed factor.
        $secret = $this->withToken($setup)->postJson('/api/v1/auth/two-factor/enroll')
            ->assertOk()
            ->json('data.secret');

        $this->withToken($setup)->postJson('/api/v1/auth/two-factor/confirm', ['code' => '000000'])
            ->assertStatus(422);

        $this->assertFalse($user->fresh()->hasTwoFactorEnabled());

        $this->withToken($setup)->getJson('/api/v1/admin/products')
            ->assertStatus(403)
            ->assertJsonPath('code', 'two_factor_setup_required');

        // Only a code that matches the secret the enrollment handed out finishes the login.
        $confirmed = $this->withToken($setup)
            ->postJson('/api/v1/auth/two-factor/confirm', ['code' => $this->currentCode($secret)])
            ->assertOk();

        $this->forgetResolvedGuards();

        $this->withToken($confirmed->json('data.token'))
            ->getJson('/api/v1/admin/products')
            ->assertOk();
    }

    /**
     * A token that is still holding the challenge may reach the second step and nothing else — the
     * administrative routes included, however it is spelled.
     */
    public function test_a_challenge_token_reaches_only_the_challenge(): void
    {
        $user = $this->staff();
        $armed = $this->armTwoFactor($user);

        $challenge = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
        ])->assertOk()->json('data.challenge_token');

        foreach ([
            '/api/v1/admin/products',
            '/api/v1/admin/orders',
            '/api/v1/admin/users',
            '/api/v1/admin/settings',
            '/api/v1/admin/audit-logs',
            '/api/v1/auth/me',
            '/api/v1/auth/sessions',
            '/api/v1/profile',
            '/api/v1/orders',
        ] as $path) {
            $this->withToken($challenge)->getJson($path)
                ->assertStatus(403)
                ->assertJsonPath('code', 'two_factor_required');
        }

        // The one call that is accepted: the code from the app, which rotates the token away.
        $verified = $this->withToken($challenge)
            ->postJson('/api/v1/auth/two-factor/challenge', ['code' => $this->currentCode($armed['secret'])])
            ->assertOk();

        $this->forgetResolvedGuards();

        $this->withToken($verified->json('data.token'))
            ->getJson('/api/v1/admin/products')
            ->assertOk();
    }

    /**
     * The response bodies and the two tables that record authentication must carry nothing an
     * attacker (or a backup) could reuse.
     */
    public function test_no_credential_or_secret_leaks_through_a_response_or_a_record(): void
    {
        $user = $this->staff('super-admin', 'Str0ngPass!234');

        // Enrollment: the secret is answered exactly once, to the authenticated owner.
        $enroll = $this->actingAs($user, 'sanctum')->postJson('/api/v1/auth/two-factor/enroll')->assertOk();
        $secret = $enroll->json('data.secret');

        $confirm = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/auth/two-factor/confirm', ['code' => $this->currentCode($secret)])
            ->assertOk();

        $codes = $confirm->json('data.recovery_codes');
        $token = $confirm->json('data.token');

        // State, login and challenge answers carry no secret, no code and no otpauth URI.
        $state = $this->actingAs($user, 'sanctum')->getJson('/api/v1/auth/two-factor')->assertOk();
        $this->assertStringNotContainsString($secret, $state->getContent());
        $this->assertStringNotContainsString($codes[0], $state->getContent());
        $this->assertStringNotContainsString('otpauth', $state->getContent());
        $this->assertArrayNotHasKey('secret', (array) $state->json('data'));

        $this->forgetResolvedGuards();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'Str0ngPass!234',
            'device_name' => 'phpunit',
        ])->assertOk();

        $this->assertStringNotContainsString($secret, $login->getContent());
        $this->assertStringNotContainsString('otpauth', $login->getContent());
        $this->assertNull($login->json('data.user'));

        // A refusal is a code and a message — never a trace, a path or an exception class.
        $refusal = $this->withToken($login->json('data.challenge_token'))
            ->getJson('/api/v1/admin/products')
            ->assertStatus(403);

        foreach (['exception', 'file', 'line', 'trace', 'message'] as $key) {
            if ($key === 'message') {
                continue;
            }

            $this->assertArrayNotHasKey($key, (array) $refusal->json());
        }

        $this->assertStringNotContainsString(base_path(), $refusal->getContent());
        $this->assertStringNotContainsString('Illuminate\\', $refusal->getContent());

        // Nothing that was written down carries the password, the secret, a recovery code or the
        // raw bearer token.
        $forbidden = ['Str0ngPass!234', $secret, $codes[0], $token, $login->json('data.challenge_token')];

        foreach (DB::table('audit_logs')->get() as $row) {
            foreach ((array) $row as $value) {
                $this->assertNoSecret((string) $value, $forbidden);
            }
        }

        foreach (DB::table('login_attempts')->get() as $row) {
            foreach ((array) $row as $value) {
                $this->assertNoSecret((string) $value, $forbidden);
            }
        }

        // The recovery codes are stored hashed, so the table itself yields nothing typeable.
        $stored = (string) $user->fresh()->two_factor_recovery_codes;
        $this->assertStringNotContainsString($codes[0], $stored);
        $this->assertDoesNotMatchRegularExpression('/^\["[A-Z0-9-]+"/', $stored);

        // The TOTP secret is encrypted at rest.
        $this->assertStringNotContainsString($secret, (string) DB::table('users')->where('id', $user->id)->value('two_factor_secret'));
    }

    /**
     * @param  array<int, string>  $forbidden
     */
    private function assertNoSecret(string $value, array $forbidden): void
    {
        foreach ($forbidden as $secret) {
            if ($secret === '' || $secret === null) {
                continue;
            }

            $this->assertStringNotContainsString($secret, $value);
        }

        // A bcrypt hash of a password is still a credential to an offline attacker.
        $this->assertDoesNotMatchRegularExpression('/\$2[aby]\$/', $value);
    }
}
