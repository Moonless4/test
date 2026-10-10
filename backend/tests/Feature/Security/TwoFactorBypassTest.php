<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Services\Security\TwoFactorAuth;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use PragmaRX\Google2FA\Google2FA;
use Tests\TestCase;

/**
 * Anti-bypass: the ways *around* the second factor, rather than the second factor itself.
 *
 * A password-only login may not reach a protected surface by any route — not the account endpoints,
 * not the token/session endpoints, not "confirm my password again" and then reissue recovery codes.
 * Everything here is decided on the server from the token that was issued; no cookie, header,
 * parameter or client flag takes part.
 *
 * Two token kinds exist between the password and the session, and each is good for exactly one step:
 *
 *   - `twofa:challenge` — the account has a second factor and this login has not answered it.
 *   - `twofa:setup`     — the shop requires a second factor and this account has not enrolled.
 *
 * `tests/Feature/Security/TwoFactorTest.php` covers the flow itself; this file covers the doors it
 * must *not* open.
 *
 * A note on the harness: `actingAs()` resolves and *caches* the Sanctum guard for the rest of the
 * test method, so a request made with `withToken()` after it would be answered as the session user
 * rather than as the token. Tests that rotate tokens call `forgetResolvedGuards()` — in production
 * every request is its own process, so the guard is never carried over.
 */
class TwoFactorBypassTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        config(['security.login_shield.progressive_delay_ms' => 0]);
        // The requirement is switched on per test where it matters; phpunit.xml leaves it off so the
        // other feature suites can sign in as staff without an authenticator.
        config(['security.two_factor.enforce_admins' => true]);
    }

    private function staff(string $role = 'admin'): User
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    /**
     * Confirm a second factor the way the endpoints would, so a test about *bypassing* 2FA does not
     * repeat the enrollment ceremony.
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

    /**
     * A password-only login of an account with a confirmed second factor: the half-finished session
     * the whole class is about.
     */
    private function pendingChallengeToken(User $user): string
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'phpunit',
        ])->assertOk();

        $token = $login->json('data.challenge_token');

        $this->assertTrue($login->json('data.two_factor_required'));
        $this->assertNull($login->json('data.token'));
        $this->assertIsString($token);

        return $token;
    }

    /** A login of a staff account that the shop requires a second factor of and that has not enrolled. */
    private function pendingSetupToken(User $user): string
    {
        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => 'phpunit',
        ])->assertOk();

        $token = $login->json('data.token');

        $this->assertTrue($login->json('data.two_factor_setup_required'));
        $this->assertIsString($token);

        return $token;
    }

    /**
     * The chain this whole file exists for: password only → challenge token → "confirm my password"
     * → reissue recovery codes → spend one → full session.
     */
    public function test_a_half_finished_login_cannot_reissue_recovery_codes_with_the_password(): void
    {
        $user = $this->staff('super-admin');
        $armed = $this->armTwoFactor($user);

        $token = $this->pendingChallengeToken($user);

        // The password is known to the caller — that is the premise of the attack — so the
        // re-authentication endpoint would happily accept it. It must not be reachable at all.
        $this->withToken($token)
            ->postJson('/api/v1/auth/confirm-password', ['password' => 'password'])
            ->assertStatus(403)
            ->assertJsonPath('code', 'two_factor_required');

        // And the endpoint that would hand out fresh recovery codes is refused for the same reason.
        $this->withToken($token)
            ->postJson('/api/v1/auth/two-factor/recovery-codes')
            ->assertStatus(403);

        // The original codes are untouched: nothing was regenerated behind the operator's back.
        $this->assertDatabaseMissing('audit_logs', ['event' => 'security.two_factor.recovery_codes_regenerated']);

        // The pending token may read its own state (that is how the login screen knows what to ask
        // for) and nothing else — the count is still the full set.
        $status = $this->withToken($token)->getJson('/api/v1/auth/two-factor')->assertOk();

        $this->assertSame(
            (int) config('security.two_factor.recovery_codes'),
            $status->json('data.recovery_codes_remaining'),
        );

        // Nothing in the chain produced a usable session: only the code from the app does.
        $this->withToken($token)
            ->getJson('/api/v1/admin/products')
            ->assertStatus(403)
            ->assertJsonPath('code', 'two_factor_required');

        $verified = $this->withToken($token)
            ->postJson('/api/v1/auth/two-factor/challenge', ['code' => $this->currentCode($armed['secret'])])
            ->assertOk();

        $this->forgetResolvedGuards();

        $this->withToken($verified->json('data.token'))->getJson('/api/v1/admin/products')->assertOk();
    }

    public function test_a_pending_challenge_token_cannot_reach_any_protected_surface(): void
    {
        $user = $this->staff('super-admin');
        $this->armTwoFactor($user);

        $token = $this->pendingChallengeToken($user);

        $reads = ['/api/v1/auth/me', '/api/v1/auth/sessions', '/api/v1/profile', '/api/v1/orders', '/api/v1/addresses', '/api/v1/wishlist'];

        foreach ($reads as $path) {
            $this->withToken($token)->getJson($path)
                ->assertStatus(403)
                ->assertJsonPath('code', 'two_factor_required');
        }

        // The password may not be replaced from a half-finished login.
        $this->withToken($token)->putJson('/api/v1/auth/password', [
            'current_password' => 'password',
            'password' => 'Brand-New-Password9',
            'password_confirmation' => 'Brand-New-Password9',
        ])->assertStatus(403);

        // Nor may sessions be revoked, or a guest basket be adopted.
        $this->withToken($token)->postJson('/api/v1/auth/logout-all')->assertStatus(403);
        $this->withToken($token)->postJson('/api/v1/auth/sessions/revoke-others')->assertStatus(403);
        $this->withToken($token)->postJson('/api/v1/auth/cart/merge')->assertStatus(403);

        // The password is unchanged, so the half-finished login bought the attacker nothing.
        $this->assertTrue(Hash::check('password', $user->fresh()->password));

        // The steps of the flow itself stay reachable: state, and the challenge.
        $this->withToken($token)->getJson('/api/v1/auth/two-factor')->assertOk();

        // Abandoning the half-finished login is allowed (it deletes only its own token).
        $this->withToken($token)->postJson('/api/v1/auth/logout')->assertOk();
    }

    public function test_a_pending_challenge_token_cannot_enroll_or_confirm_a_second_factor(): void
    {
        $user = $this->staff('super-admin');
        $this->armTwoFactor($user);

        $token = $this->pendingChallengeToken($user);

        // Enrollment belongs to the "you must enroll" step, never to a challenge in progress: it
        // would otherwise be a way to *replace* the operator's authenticator.
        $this->withToken($token)->postJson('/api/v1/auth/two-factor/enroll')
            ->assertStatus(403)
            ->assertJsonPath('code', 'two_factor_required');

        $this->withToken($token)->postJson('/api/v1/auth/two-factor/confirm', ['code' => '123456'])
            ->assertStatus(403);

        // The armed secret is exactly the one the operator enrolled.
        $this->assertTrue($user->fresh()->hasTwoFactorEnabled());
    }

    public function test_a_setup_token_can_only_enroll(): void
    {
        $user = $this->staff('super-admin');

        $token = $this->pendingSetupToken($user);

        foreach (['/api/v1/auth/me', '/api/v1/profile', '/api/v1/orders', '/api/v1/auth/sessions'] as $path) {
            $this->withToken($token)->getJson($path)
                ->assertStatus(403)
                ->assertJsonPath('code', 'two_factor_setup_required');
        }

        $this->withToken($token)->postJson('/api/v1/auth/confirm-password', ['password' => 'password'])
            ->assertStatus(403);

        $this->withToken($token)->getJson('/api/v1/admin/products')
            ->assertStatus(403)
            ->assertJsonPath('code', 'two_factor_setup_required');

        // The one thing it is for.
        $secret = $this->withToken($token)->postJson('/api/v1/auth/two-factor/enroll')->assertOk()->json('data.secret');

        $this->withToken($token)
            ->postJson('/api/v1/auth/two-factor/confirm', ['code' => $this->currentCode($secret)])
            ->assertOk();
    }

    public function test_recovery_codes_cannot_be_regenerated_with_the_password_alone(): void
    {
        $user = $this->staff('super-admin');
        $armed = $this->armTwoFactor($user);

        // Re-authentication first, exactly as the panel does it.
        $this->confirmPassword($user);

        // The password is not enough: the current code from the app is required as well.
        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/auth/two-factor/recovery-codes')
            ->assertStatus(422);

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/auth/two-factor/recovery-codes', ['code' => '000001'])
            ->assertStatus(422)
            ->assertJsonPath('code', 'invalid_two_factor_code');

        // Nothing was reissued by the refused attempts.
        $this->assertDatabaseMissing('audit_logs', ['event' => 'security.two_factor.recovery_codes_regenerated']);

        // With a code from the app, the reissue proceeds.
        $response = $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/auth/two-factor/recovery-codes', ['code' => $this->currentCode($armed['secret'])])
            ->assertOk();

        $this->assertCount(
            (int) config('security.two_factor.recovery_codes'),
            $response->json('data.recovery_codes'),
        );

        $this->assertDatabaseHas('audit_logs', ['event' => 'security.two_factor.recovery_codes_regenerated']);

        // The previous set is dead: reissuing invalidates every code it replaces.
        $this->forgetResolvedGuards();

        $this->withToken($this->pendingChallengeToken($user))
            ->postJson('/api/v1/auth/two-factor/challenge', ['recovery_code' => $armed['codes'][0]])
            ->assertStatus(422);
    }

    public function test_disabling_the_second_factor_needs_the_password_and_a_current_code(): void
    {
        // A shop that does not require a second factor of staff, so the downgrade is permitted at all.
        config(['security.two_factor.enforce_admins' => false]);

        $user = $this->staff('admin');
        $armed = $this->armTwoFactor($user);

        // No proof at all.
        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/auth/two-factor')
            ->assertStatus(423)
            ->assertJsonPath('code', 'recent_auth_required');

        $this->confirmPassword($user);

        // Password but no code.
        $this->actingAs($user, 'sanctum')->deleteJson('/api/v1/auth/two-factor')->assertStatus(422);

        // A recovery code may not be the thing that turns the second factor off — and the refused
        // attempt must not burn one either.
        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/auth/two-factor', ['recovery_code' => $armed['codes'][0]])
            ->assertStatus(422);

        $this->assertTrue($user->fresh()->hasTwoFactorEnabled());
        $this->assertCount(
            (int) config('security.two_factor.recovery_codes'),
            $user->fresh()->twoFactorRecoveryCodeHashes(),
        );

        // Password and a code from the app: allowed.
        $this->actingAs($user, 'sanctum')
            ->deleteJson('/api/v1/auth/two-factor', ['code' => $this->currentCode($armed['secret'])])
            ->assertOk();

        $this->assertFalse($user->fresh()->hasTwoFactorEnabled());
    }

    public function test_a_recovery_code_is_single_use_even_from_a_stale_copy_of_the_account(): void
    {
        $user = $this->staff('super-admin');
        $armed = $this->armTwoFactor($user);

        $twoFactor = app(TwoFactorAuth::class);

        // Two copies of the same row: the second is what a concurrent request would hold. Consuming
        // the code must re-read the row inside the transaction, or both would succeed.
        $first = $user->fresh();
        $second = $user->fresh();

        $this->assertTrue($twoFactor->consumeRecoveryCode($first, $armed['codes'][0]));
        $this->assertFalse($twoFactor->consumeRecoveryCode($second, $armed['codes'][0]));

        // And the code is gone from the stored set.
        $this->assertSame(
            (int) config('security.two_factor.recovery_codes') - 1,
            count($user->fresh()->twoFactorRecoveryCodeHashes()),
        );
    }
}
