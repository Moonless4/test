<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Registration, login, logout and token lifecycle.
 */
class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'name' => 'کاربر تست',
            'email' => 'user@example.com',
            'password' => 'Str0ngPass!234',
            'password_confirmation' => 'Str0ngPass!234',
        ], $overrides);
    }

    public function test_registration_creates_an_active_customer_and_returns_a_token(): void
    {
        Notification::fake();
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $response = $this->postJson('/api/v1/auth/register', $this->payload());

        $response->assertCreated()
            ->assertJsonPath('data.user.email', 'user@example.com')
            ->assertJsonPath('data.user.status', 'active')
            ->assertJsonStructure(['data' => ['token', 'token_type', 'expires_at']]);

        $user = User::query()->where('email', 'user@example.com')->firstOrFail();

        $this->assertTrue($user->hasRole('customer'));
        $this->assertTrue(Hash::check('Str0ngPass!234', $user->password));
        $this->assertStringNotContainsString('Str0ngPass!234', $user->password);
    }

    public function test_registration_rejects_a_weak_password(): void
    {
        $response = $this->postJson('/api/v1/auth/register', $this->payload([
            'password' => 'short',
            'password_confirmation' => 'short',
        ]));

        $response->assertStatus(422)->assertJsonValidationErrors('password');
        $this->assertDatabaseCount('users', 0);
    }

    public function test_registration_rejects_a_duplicate_email(): void
    {
        User::factory()->create(['email' => 'user@example.com']);

        $this->postJson('/api/v1/auth/register', $this->payload())
            ->assertStatus(422)
            ->assertJsonValidationErrors('email');
    }

    public function test_login_returns_a_token_and_updates_the_last_login(): void
    {
        Notification::fake();
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $user = User::factory()->create(['email' => 'shopper@example.com', 'password' => 'Str0ngPass!234']);

        $this->postJson('/api/v1/auth/login', [
            'email' => 'shopper@example.com',
            'password' => 'Str0ngPass!234',
            'device_name' => 'Chrome',
        ])->assertOk()->assertJsonStructure(['data' => ['token', 'expires_at']]);

        $user->refresh();
        $this->assertNotNull($user->last_login_at);
        $this->assertSame(1, $user->tokens()->count());
    }

    public function test_a_wrong_password_answers_the_same_way_as_an_unknown_account(): void
    {
        User::factory()->create(['email' => 'shopper@example.com', 'password' => 'Str0ngPass!234']);

        $wrongPassword = $this->postJson('/api/v1/auth/login', [
            'email' => 'shopper@example.com', 'password' => 'definitely-wrong',
        ]);

        $unknownAccount = $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@example.com', 'password' => 'definitely-wrong',
        ]);

        // Identical status and message: the endpoint cannot be used to discover accounts.
        $this->assertSame(422, $wrongPassword->status());
        $this->assertSame(422, $unknownAccount->status());
        $this->assertSame($wrongPassword->json('message'), $unknownAccount->json('message'));
    }

    public function test_a_suspended_account_cannot_log_in_even_with_the_right_password(): void
    {
        $user = User::factory()->create(['email' => 'blocked@example.com', 'password' => 'Str0ngPass!234']);
        $user->status = \App\Enums\UserStatus::Suspended;
        $user->save();

        $this->postJson('/api/v1/auth/login', [
            'email' => 'blocked@example.com', 'password' => 'Str0ngPass!234',
        ])->assertStatus(403);

        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_logout_revokes_only_the_current_token(): void
    {
        Notification::fake();
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $user = User::factory()->create(['email' => 'multi@example.com', 'password' => 'Str0ngPass!234']);

        $first = $this->postJson('/api/v1/auth/login', ['email' => 'multi@example.com', 'password' => 'Str0ngPass!234'])->json('data.token');
        $second = $this->postJson('/api/v1/auth/login', ['email' => 'multi@example.com', 'password' => 'Str0ngPass!234'])->json('data.token');

        $this->assertSame(2, $user->tokens()->count());

        $this->withToken($first)->postJson('/api/v1/auth/logout')->assertOk();

        $this->assertSame(1, $user->tokens()->count());

        $this->forgetResolvedGuards();
        $this->withToken($first)->getJson('/api/v1/auth/me')->assertStatus(401);
        $this->withToken($second)->getJson('/api/v1/auth/me')->assertOk();
    }

    public function test_logout_all_revokes_every_token(): void
    {
        Notification::fake();
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $user = User::factory()->create(['email' => 'everywhere@example.com', 'password' => 'Str0ngPass!234']);
        $token = $this->postJson('/api/v1/auth/login', ['email' => 'everywhere@example.com', 'password' => 'Str0ngPass!234'])->json('data.token');
        $this->postJson('/api/v1/auth/login', ['email' => 'everywhere@example.com', 'password' => 'Str0ngPass!234']);

        $this->withToken($token)->postJson('/api/v1/auth/logout-all')->assertOk();

        $this->assertSame(0, $user->tokens()->count());
    }

    public function test_a_protected_route_requires_a_token(): void
    {
        $this->getJson('/api/v1/auth/me')->assertStatus(401);
        $this->getJson('/api/v1/orders')->assertStatus(401);
    }

    public function test_the_profile_endpoint_never_exposes_credentials(): void
    {
        $user = User::factory()->create();
        $this->seed(\Database\Seeders\RoleAndPermissionSeeder::class);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/profile');

        $response->assertOk();
        $body = $response->json('data.user');

        $this->assertArrayNotHasKey('password', $body);
        $this->assertArrayNotHasKey('remember_token', $body);
        $this->assertStringNotContainsString('$2y$', $response->getContent());
    }
}
