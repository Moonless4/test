<?php

namespace Tests\Feature\Security;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Privilege escalation and cross-account access (IDOR/BOLA).
 *
 * The two directions that matter: an account trying to *raise* its own privileges, and an account
 * trying to *read or change* somebody else's data. Both are checked server-side, both answer the
 * same way whatever the caller's token says, and both are recorded.
 */
class PrivilegeEscalationTest extends TestCase
{
    use RefreshDatabase;

    private function staff(string $role = 'super-admin'): User
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    public function test_a_profile_update_cannot_hand_itself_a_role_or_a_status(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->putJson('/api/v1/profile', [
            'name' => 'نام جدید',
            // None of these are in the request rules, the model's fillable list, or the controller.
            'roles' => ['super-admin'],
            'status' => 'suspended',
            'is_admin' => true,
            'permissions' => ['users.roles'],
        ])->assertOk();

        $fresh = $user->fresh();

        $this->assertSame('نام جدید', $fresh->name);
        $this->assertSame('active', $fresh->status->value);
        $this->assertCount(0, $fresh->getRoleNames());
        $this->assertFalse($fresh->isStaff());
    }

    public function test_nobody_may_change_their_own_roles(): void
    {
        $admin = $this->staff('super-admin');
        $this->actingAsStaff($admin);
        $this->confirmPassword($admin);

        $this->actingAsStaff($admin)
            ->putJson("/api/v1/admin/users/{$admin->id}/roles", ['roles' => ['admin']])
            ->assertStatus(403)
            ->assertJsonPath('code', 'self_role_change');

        // Nothing changed, and the attempt itself is evidence.
        $this->assertTrue($admin->fresh()->hasRole('super-admin'));
        $this->assertDatabaseHas('audit_logs', ['event' => 'security.self_role_change_blocked']);
    }

    public function test_privileged_admin_routes_require_re_authentication(): void
    {
        $admin = $this->staff('super-admin');
        $target = User::factory()->create();

        // A valid, fully privileged token is not enough on its own: a token stolen from an unlocked
        // laptop does not know the password.
        $this->actingAsStaff($admin)
            ->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['staff']])
            ->assertStatus(423)
            ->assertJsonPath('code', 'recent_auth_required');

        $this->assertCount(0, $target->fresh()->getRoleNames());

        $this->actingAsStaff($admin)
            ->postJson('/api/v1/admin/settings', [
                'key' => 'shop.name', 'value' => 'x', 'type' => 'string', 'group' => 'shop', 'is_public' => true,
            ])
            ->assertStatus(423);

        // A wrong password is refused — and counted as a failed credential check.
        $this->actingAsStaff($admin)
            ->postJson('/api/v1/auth/confirm-password', ['password' => 'not-it'])
            ->assertStatus(422)
            ->assertJsonPath('code', 'invalid_password');

        $this->assertDatabaseHas('login_attempts', ['reason' => 'recent_auth', 'successful' => false]);

        // With the password, the same operations proceed.
        $this->actingAsStaff($admin);
        $this->confirmPassword($admin);

        $this->actingAsStaff($admin)
            ->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['staff']])
            ->assertOk();

        $this->assertTrue($target->fresh()->hasRole('staff'));
    }

    public function test_a_staff_member_may_not_lift_themselves_with_the_role_endpoint(): void
    {
        $staff = $this->staff('staff');

        // Without the permission the request never reaches the controller.
        $this->actingAsStaff($staff)
            ->putJson("/api/v1/admin/users/{$staff->id}/roles", ['roles' => ['super-admin']])
            ->assertStatus(403);

        $this->assertFalse($staff->fresh()->hasRole('super-admin'));
    }

    public function test_one_customer_cannot_read_another_customers_order(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();

        $order = Order::factory()->for($owner)->create([
            'number' => 'MD-11111111',
            'status' => OrderStatusValue::pendingPayment(),
        ]);

        // Signed in as somebody else: a 404, so the endpoint does not confirm the order exists.
        $this->actingAs($stranger, 'sanctum')
            ->getJson("/api/v1/orders/{$order->number}")
            ->assertStatus(404);

        // And their own list never contains it.
        $listed = $this->actingAs($stranger, 'sanctum')->getJson('/api/v1/orders')->assertOk();

        $this->assertStringNotContainsString($order->number, $listed->getContent());

        $this->actingAs($owner, 'sanctum')->getJson("/api/v1/orders/{$order->number}")->assertOk();
    }

    public function test_a_customer_cannot_touch_another_customers_address(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();

        $address = \App\Models\Address::factory()->for($owner)->create();

        $this->actingAs($stranger, 'sanctum')
            ->deleteJson("/api/v1/addresses/{$address->id}")
            ->assertStatus(404);

        $this->assertDatabaseHas('addresses', ['id' => $address->id]);
    }

    public function test_a_customer_cannot_reach_the_admin_surface_with_a_valid_token(): void
    {
        $customer = User::factory()->create();

        foreach (['products', 'orders', 'users', 'settings', 'audit-logs'] as $surface) {
            $this->actingAs($customer, 'sanctum')->getJson("/api/v1/admin/{$surface}")->assertStatus(403);
        }
    }

    public function test_a_price_sent_by_the_client_never_reaches_an_order(): void
    {
        $product = Product::factory()->for(Category::factory())->create(['price' => 500_000, 'stock_quantity' => 3]);

        $token = $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 1])
            ->assertCreated()->headers->get('X-Cart-Token');

        $response = $this->withHeaders(['X-Cart-Token' => $token])->postJson('/api/v1/checkout', [
            'customer_name' => 'خریدار',
            'customer_email' => 'buyer@example.com',
            'customer_phone' => '09121234567',
            'shipping_province' => 'تهران',
            'shipping_city' => 'تهران',
            'shipping_postal_code' => '1234567890',
            'shipping_line1' => 'نشانی',
            // The client is welcome to send these; the server computes its own and ignores them.
            'subtotal' => 1,
            'grand_total' => 1,
            'price' => 1,
            'total' => 1,
        ])->assertCreated();

        $this->assertSame(500_000, $response->json('data.order.subtotal'));
        $this->assertSame(545_000, $response->json('data.order.grand_total'));
    }
}

/**
 * The enum case the order factory needs, kept out of the test body so the assertion stays readable.
 */
final class OrderStatusValue
{
    public static function pendingPayment(): string
    {
        return \App\Enums\OrderStatus::PendingPayment->value;
    }
}
