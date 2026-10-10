<?php

namespace Tests\Feature\Admin;

use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Who may reach the admin surface.
 *
 * The panel is the one part of the API where a missing guard is not a bug but a breach, so the
 * expectations here are deliberately strict:
 *
 *  - no token → 401, not 403 (the caller has not identified themselves yet);
 *  - a customer account → 403 on every admin route, including the read-only ones;
 *  - a staff member → only the surfaces their role names, checked route by route, because
 *    `staff` may update products but must not touch users, settings or the audit log.
 */
class AdminAccessTest extends TestCase
{
    use RefreshDatabase;

    private function userWithRole(string $role): User
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    public function test_a_guest_is_refused_before_any_admin_controller_runs(): void
    {
        $this->getJson('/api/v1/admin/products')->assertStatus(401);
        $this->getJson('/api/v1/admin/orders')->assertStatus(401);
        $this->postJson('/api/v1/admin/products', [])->assertStatus(401);
    }

    public function test_a_customer_account_cannot_reach_the_admin_surface(): void
    {
        $customer = User::factory()->create();

        $this->actingAs($customer, 'sanctum')->getJson('/api/v1/admin/products')->assertStatus(403);
        $this->actingAs($customer, 'sanctum')->getJson('/api/v1/admin/orders')->assertStatus(403);
        $this->actingAs($customer, 'sanctum')->getJson('/api/v1/admin/users')->assertStatus(403);
        $this->actingAs($customer, 'sanctum')->getJson('/api/v1/admin/audit-logs')->assertStatus(403);
        $this->actingAs($customer, 'sanctum')->getJson('/api/v1/admin/settings')->assertStatus(403);
    }

    public function test_a_super_admin_reaches_every_admin_surface(): void
    {
        $admin = $this->userWithRole('super-admin');

        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/products')->assertOk();
        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/categories')->assertOk();
        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/orders')->assertOk();
        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/coupons')->assertOk();
        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/users')->assertOk();
        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/media')->assertOk();
        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/audit-logs')->assertOk();
        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/pages')->assertOk();
        $this->actingAs($admin, 'sanctum')->getJson('/api/v1/admin/settings')->assertOk();
    }

    public function test_a_staff_member_is_limited_to_the_surfaces_their_role_names(): void
    {
        $staff = $this->userWithRole('staff');

        $this->actingAs($staff, 'sanctum')->getJson('/api/v1/admin/products')->assertOk();
        $this->actingAs($staff, 'sanctum')->getJson('/api/v1/admin/orders')->assertOk();

        // The media library *is* on the staff role: they are the ones who photograph the stock.
        $this->actingAs($staff, 'sanctum')->getJson('/api/v1/admin/media')->assertOk();

        // Not on the staff role: privileges, settings, content and the audit trail.
        $this->actingAs($staff, 'sanctum')->getJson('/api/v1/admin/users')->assertStatus(403);
        $this->actingAs($staff, 'sanctum')->getJson('/api/v1/admin/settings')->assertStatus(403);
        $this->actingAs($staff, 'sanctum')->getJson('/api/v1/admin/pages')->assertStatus(403);
        $this->actingAs($staff, 'sanctum')->getJson('/api/v1/admin/audit-logs')->assertStatus(403);

        // Creating or deleting a product is not on the staff role either.
        $this->actingAs($staff, 'sanctum')->postJson('/api/v1/admin/products', [])->assertStatus(403);
    }

    public function test_an_admin_may_not_manage_roles_without_the_permission(): void
    {
        $admin = $this->userWithRole('admin');
        $target = User::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['staff']])
            ->assertStatus(403);
    }

    public function test_only_a_super_admin_may_grant_the_super_admin_role(): void
    {
        $admin = $this->userWithRole('admin');
        $admin->givePermissionTo('users.roles');

        $target = User::factory()->create();

        // Roles are a privilege operation: the password is required again before the change.
        $this->confirmPassword($admin);

        // An administrator who may manage roles still may not mint a peer above themselves.
        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['super-admin']])
            ->assertStatus(403);

        // Assigning a role at or below their own level is allowed.
        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['staff']])
            ->assertOk();

        $this->assertTrue($target->fresh()->hasRole('staff'));
    }
}
