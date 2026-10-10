<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\ResetPassword;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class PasswordFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_forgot_endpoint_never_reveals_whether_an_account_exists(): void
    {
        Notification::fake();
        User::factory()->create(['email' => 'known@example.com']);

        $known = $this->postJson('/api/v1/auth/password/forgot', ['email' => 'known@example.com']);
        $unknown = $this->postJson('/api/v1/auth/password/forgot', ['email' => 'unknown@example.com']);

        $known->assertOk();
        $unknown->assertOk();
        $this->assertSame($known->json('message'), $unknown->json('message'));

        Notification::assertSentTo(User::query()->where('email', 'known@example.com')->first(), ResetPassword::class);
        Notification::assertNotSentTo(User::query()->where('email', 'known@example.com')->first(), ResetPassword::class, function (ResetPassword $notification): bool {
            // The notification must carry a token, never the password itself.
            return $notification->token === '';
        });
    }

    public function test_the_reset_endpoint_sets_a_new_password_and_revokes_every_token(): void
    {
        Notification::fake();
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $user = User::factory()->create(['email' => 'reset@example.com', 'password' => 'OldPass!2345']);
        $this->postJson('/api/v1/auth/login', ['email' => 'reset@example.com', 'password' => 'OldPass!2345'])->assertOk();

        $this->assertSame(1, $user->tokens()->count());

        $token = null;

        $this->postJson('/api/v1/auth/password/forgot', ['email' => 'reset@example.com'])->assertOk();

        Notification::assertSentTo($user, ResetPassword::class, function (ResetPassword $notification) use (&$token): bool {
            $token = $notification->token;

            return true;
        });

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => 'reset@example.com',
            'token' => $token,
            'password' => 'BrandNew!2345',
            'password_confirmation' => 'BrandNew!2345',
        ])->assertOk();

        $user->refresh();
        $this->assertTrue(Hash::check('BrandNew!2345', $user->password));
        // Every session dies with the old password.
        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_a_reset_with_an_invalid_token_is_refused(): void
    {
        $user = User::factory()->create(['email' => 'reset@example.com', 'password' => 'OldPass!2345']);

        $this->postJson('/api/v1/auth/password/reset', [
            'email' => 'reset@example.com',
            'token' => 'not-a-real-token',
            'password' => 'BrandNew!2345',
            'password_confirmation' => 'BrandNew!2345',
        ])->assertStatus(422)->assertJsonValidationErrors('email');

        $this->assertTrue(Hash::check('OldPass!2345', $user->fresh()->password));
    }

    public function test_changing_a_password_requires_the_current_one(): void
    {
        $user = User::factory()->create(['password' => 'Str0ngPass!234']);

        $this->actingAs($user, 'sanctum')
            ->putJson('/api/v1/auth/password', [
                'current_password' => 'not-the-current-one',
                'password' => 'Another!2345',
                'password_confirmation' => 'Another!2345',
            ])
            ->assertStatus(422)
            ->assertJsonValidationErrors('current_password');

        $this->assertTrue(Hash::check('Str0ngPass!234', $user->fresh()->password));
    }

    public function test_changing_a_password_revokes_other_sessions_but_keeps_the_current_one(): void
    {
        $user = User::factory()->create(['password' => 'Str0ngPass!234']);

        // Two devices signed in.
        $tokens = $user->tokens()->createMany([
            ['name' => 'device-a', 'token' => hash('sha256', 'a'), 'abilities' => ['*']],
            ['name' => 'device-b', 'token' => hash('sha256', 'b'), 'abilities' => ['*']],
        ]);

        $this->withToken('a')->putJson('/api/v1/auth/password', [
            'current_password' => 'Str0ngPass!234',
            'password' => 'Another!2345',
            'password_confirmation' => 'Another!2345',
        ])->assertOk();

        $this->assertSame(1, $user->tokens()->count());

        $this->forgetResolvedGuards();
        $this->withToken('a')->getJson('/api/v1/auth/me')->assertOk();
        $this->withToken('b')->getJson('/api/v1/auth/me')->assertStatus(401);
    }
}
