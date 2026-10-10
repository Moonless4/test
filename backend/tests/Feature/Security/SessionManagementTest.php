<?php

namespace Tests\Feature\Security;

use App\Models\User;
use App\Notifications\SecurityAlertNotification;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Session and token lifecycle: what a signed-in person can see, what they can end, and what ends
 * automatically when the account's security changes.
 *
 * The interesting cases are the negative ones — a session id that belongs to somebody else must do
 * nothing at all, and a revoked token must be dead on the next request.
 */
class SessionManagementTest extends TestCase
{
    use RefreshDatabase;

    /**
     * Two real bearer tokens for one account, the way two devices would hold them.
     *
     * @return array{first: string, second: string}
     */
    private function twoSessions(User $user): array
    {
        $login = fn (string $device): string => $this->postJson('/api/v1/auth/login', [
            'email' => $user->email,
            'password' => 'password',
            'device_name' => $device,
        ])->assertOk()->json('data.token');

        return ['first' => $login('لپ‌تاپ'), 'second' => $login('گوشی')];
    }

    public function test_the_session_list_shows_each_device_and_marks_the_current_one(): void
    {
        $user = User::factory()->create();
        $sessions = $this->twoSessions($user);

        $listed = $this->withToken($sessions['second'])->getJson('/api/v1/auth/sessions')->assertOk();

        $this->assertCount(2, $listed->json('data.sessions'));

        $current = collect($listed->json('data.sessions'))->firstWhere('current', true);
        $other = collect($listed->json('data.sessions'))->firstWhere('current', false);

        $this->assertSame('گوشی', $current['device']);
        $this->assertSame('لپ‌تاپ', $other['device']);

        // A session is described by its address and device, and the token value is nowhere: the
        // list cannot be used to steal a session.
        $this->assertArrayNotHasKey('token', $current);
        $this->assertStringNotContainsString($sessions['second'], $listed->getContent());
        $this->assertStringNotContainsString($sessions['first'], $listed->getContent());
    }

    public function test_revoking_one_session_kills_that_token_and_leaves_the_other_alone(): void
    {
        $user = User::factory()->create();
        $sessions = $this->twoSessions($user);

        $other = $this->withToken($sessions['second'])->getJson('/api/v1/auth/sessions')->json('data.sessions');
        $otherId = collect($other)->firstWhere('current', false)['id'];

        $this->withToken($sessions['second'])->deleteJson("/api/v1/auth/sessions/{$otherId}")->assertOk();

        $this->assertDatabaseHas('audit_logs', ['event' => 'auth.session_revoked']);

        // The revoked token is dead on the very next request; the caller's own still works.
        $this->forgetResolvedGuards();
        $this->withToken($sessions['first'])->getJson('/api/v1/auth/me')->assertStatus(401);
        $this->withToken($sessions['second'])->getJson('/api/v1/auth/me')->assertOk();
    }

    public function test_a_session_id_belonging_to_somebody_else_does_nothing(): void
    {
        $victim = User::factory()->create();
        $attacker = User::factory()->create();

        $victimSessions = $this->twoSessions($victim);
        $attackerToken = $this->postJson('/api/v1/auth/login', [
            'email' => $attacker->email, 'password' => 'password',
        ])->json('data.token');

        $victimId = $this->withToken($victimSessions['first'])
            ->getJson('/api/v1/auth/sessions')->json('data.sessions.0.id');

        // 404, never 403: a 403 would confirm that the session exists. The guard is forgotten before
        // each identity change — one test process shares a container across several requests, so
        // without it the second request would still be answered as the identity the first resolved.
        $this->forgetResolvedGuards();
        $this->withToken($attackerToken)
            ->deleteJson("/api/v1/auth/sessions/{$victimId}")
            ->assertStatus(404);

        // The victim's session is untouched.
        $this->forgetResolvedGuards();
        $this->withToken($victimSessions['first'])->getJson('/api/v1/auth/me')->assertOk();

        // And a signed-out caller cannot list anybody's sessions at all. `withToken()` leaves the
        // header on the test client for the rest of the method, so it has to be dropped as well as
        // the resolved guard.
        $this->forgetResolvedGuards();
        $this->flushHeaders();
        $this->getJson('/api/v1/auth/sessions')->assertStatus(401);
    }

    public function test_revoke_others_and_logout_all(): void
    {
        $user = User::factory()->create();
        $sessions = $this->twoSessions($user);

        $this->withToken($sessions['second'])->postJson('/api/v1/auth/sessions/revoke-others')->assertOk();

        $this->forgetResolvedGuards();
        $this->withToken($sessions['first'])->getJson('/api/v1/auth/me')->assertStatus(401);

        $this->withToken($sessions['second'])->postJson('/api/v1/auth/logout-all')->assertOk();

        $this->forgetResolvedGuards();
        $this->withToken($sessions['second'])->getJson('/api/v1/auth/me')->assertStatus(401);
    }

    public function test_a_password_change_ends_every_other_session_and_reports_it(): void
    {
        Notification::fake();

        $user = User::factory()->create();
        $sessions = $this->twoSessions($user);

        $this->withToken($sessions['second'])->putJson('/api/v1/auth/password', [
            'current_password' => 'password',
            'password' => 'N3w-Str0ng-Pass!',
            'password_confirmation' => 'N3w-Str0ng-Pass!',
        ])->assertOk();

        $this->assertDatabaseHas('audit_logs', ['event' => 'auth.password_changed']);

        // The device in the shopper's hand keeps working; the other session is gone. The guard is
        // forgotten before each request so both tokens are really resolved from their own header,
        // rather than the second call reusing the identity the first one resolved.
        $this->forgetResolvedGuards();
        $this->withToken($sessions['second'])->getJson('/api/v1/auth/me')->assertOk();
        $this->forgetResolvedGuards();
        $this->withToken($sessions['first'])->getJson('/api/v1/auth/me')->assertStatus(401);

        // The old password no longer signs in, and the owner is told without being told a secret.
        $this->postJson('/api/v1/auth/login', ['email' => $user->email, 'password' => 'password'])
            ->assertStatus(422);

        Notification::assertSentTo($user, SecurityAlertNotification::class);
    }

    public function test_tokens_expire(): void
    {
        $user = User::factory()->create();
        $sessions = $this->twoSessions($user);

        $this->withToken($sessions['first'])->getJson('/api/v1/auth/me')->assertOk();

        // Past the configured lifetime the token is refused, so a leaked token is not a permanent
        // key even when nobody revokes it.
        $this->travel((int) config('security.tokens.expiration_minutes') + 1)->minutes();

        $this->forgetResolvedGuards();
        $this->withToken($sessions['first'])->getJson('/api/v1/auth/me')->assertStatus(401);
    }
}
