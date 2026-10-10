<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Post;
use App\Models\Product;
use App\Models\Setting;
use App\Models\StockMovement;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * The day-to-day half of the panel: orders, discount codes, accounts, content and settings.
 *
 * Two rules are checked here that a permission alone cannot express: an order may only move along
 * the lifecycle App\Enums\OrderStatus allows (so stock is never returned twice), and a setting's key
 * — the name the storefront looks it up by — cannot be renamed out from under it.
 */
class AdminOperationsTest extends TestCase
{
    use RefreshDatabase;

    private function admin(string $role = 'super-admin'): User
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    /**
     * A real order, placed through the public checkout: the admin tests then work on exactly the row
     * a shopper would have produced, stock reservation included.
     */
    private function placeOrder(Product $product, int $quantity = 2): Order
    {
        Notification::fake();

        $token = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->getKey(),
            'quantity' => $quantity,
        ])->assertCreated()->headers->get('X-Cart-Token');

        $number = $this->withHeaders(['X-Cart-Token' => $token])->postJson('/api/v1/checkout', [
            'customer_name' => 'خریدار تست',
            'customer_email' => 'buyer@example.com',
            'customer_phone' => '09121234567',
            'shipping_province' => 'تهران',
            'shipping_city' => 'تهران',
            'shipping_postal_code' => '1234567890',
            'shipping_line1' => 'خیابان نمونه',
        ])->assertCreated()->json('data.order.number');

        return Order::query()->where('number', $number)->firstOrFail();
    }

    public function test_an_order_can_be_found_by_its_number_and_read_in_full(): void
    {
        $admin = $this->admin();
        $order = $this->placeOrder(Product::factory()->create(['stock_quantity' => 5]));

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/orders?q='.$order->number)
            ->assertOk()
            ->assertJsonPath('meta.total', 1);

        $this->actingAs($admin, 'sanctum')
            ->getJson("/api/v1/admin/orders/{$order->id}")
            ->assertOk()
            ->assertJsonPath('data.number', $order->number)
            ->assertJsonPath('data.status', 'pending_payment');
    }

    public function test_an_illegal_status_transition_is_refused_and_says_what_is_allowed(): void
    {
        $admin = $this->admin();
        $order = $this->placeOrder(Product::factory()->create(['stock_quantity' => 5]));

        $response = $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'shipped'])
            ->assertStatus(422);

        // The panel can render the buttons from this list instead of guessing them.
        $this->assertSame(['paid', 'cancelled'], $response->json('allowed'));
        $this->assertSame('pending_payment', $order->fresh()->status->value);
        $this->assertSame(0, OrderStatusHistory::query()->where('to_status', 'shipped')->count());
    }

    public function test_cancelling_an_order_returns_its_stock_and_records_who_did_it(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create(['stock_quantity' => 5]);
        $order = $this->placeOrder($product, 2);

        // The checkout took two off the shelf.
        $this->assertSame(3, $product->fresh()->stock_quantity);

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/orders/{$order->id}/status", [
                'status' => 'cancelled',
                'note' => 'درخواست مشتری',
            ])
            ->assertOk()
            ->assertJsonPath('data.order.status', 'cancelled');

        $this->assertSame(5, $product->fresh()->stock_quantity);

        $movement = StockMovement::query()
            ->where('product_id', $product->getKey())
            ->where('reason', StockMovement::REASON_CANCELLATION)
            ->sole();

        $this->assertSame(2, $movement->delta);
        $this->assertSame($admin->getKey(), $movement->user_id);

        $this->assertDatabaseHas('order_status_histories', [
            'order_id' => $order->getKey(),
            'from_status' => 'pending_payment',
            'to_status' => 'cancelled',
            'changed_by' => $admin->getKey(),
        ]);

        $this->assertDatabaseHas('audit_logs', ['event' => 'order.status_changed']);
    }

    public function test_a_cancelled_order_cannot_be_cancelled_again(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create(['stock_quantity' => 5]);
        $order = $this->placeOrder($product, 2);

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'cancelled'])
            ->assertOk();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/orders/{$order->id}/status", ['status' => 'cancelled'])
            ->assertStatus(422);

        // A final status has no way out, so the stock can only ever be returned once.
        $this->assertSame(5, $product->fresh()->stock_quantity);
        $this->assertSame(1, StockMovement::query()->where('reason', StockMovement::REASON_CANCELLATION)->count());
    }

    public function test_a_coupon_is_created_uppercase_and_validated_by_type(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/coupons', [
            'code' => 'sale10',
            'type' => 'percent',
            'value' => 10,
            'max_discount' => 500_000,
        ])->assertCreated()->assertJsonPath('data.coupon.code', 'SALE10');

        // A percentage coupon must carry a ceiling, and 90% is the hard limit.
        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/coupons', [
            'code' => 'BIG',
            'type' => 'percent',
            'value' => 95,
        ])->assertStatus(422)->assertJsonValidationErrors('value');

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/coupons', [
            'code' => 'NOCAP',
            'type' => 'percent',
            'value' => 20,
        ])->assertStatus(422)->assertJsonValidationErrors('max_discount');

        $this->assertSame(1, Coupon::query()->count());
    }

    public function test_a_redeemed_coupon_is_deactivated_rather_than_deleted(): void
    {
        $admin = $this->admin();
        $coupon = Coupon::factory()->create();
        $order = Order::factory()->create();

        $coupon->redemptions()->create([
            'order_id' => $order->getKey(),
            'user_id' => $order->user_id,
            'amount' => 100_000,
        ]);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/coupons/{$coupon->id}")
            ->assertStatus(422);

        $this->assertDatabaseHas('coupons', ['id' => $coupon->getKey()]);

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/coupons/{$coupon->id}", ['is_active' => false])
            ->assertOk()
            ->assertJsonPath('data.coupon.is_active', false);
    }

    public function test_an_admin_can_suspend_an_account_but_not_their_own(): void
    {
        $admin = $this->admin();
        $customer = User::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/users/{$customer->id}", ['status' => 'suspended'])
            ->assertOk()
            ->assertJsonPath('data.user.status', 'suspended');

        $this->assertSame(User::query()->findOrFail($customer->getKey())->status->value, 'suspended');

        // Locking yourself out of the panel is refused, not merely discouraged.
        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/users/{$admin->id}", ['status' => 'suspended'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('status');
    }

    public function test_a_super_admin_replaces_roles_and_the_change_is_audited(): void
    {
        $admin = $this->admin();
        $target = User::factory()->create();

        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['staff']])
            ->assertOk()
            ->assertJsonPath('data.user.roles.0', 'staff');

        $this->assertTrue($target->fresh()->hasRole('staff'));

        // A role that does not exist on the web guard is a validation error, not a silent no-op.
        $this->actingAs($admin, 'sanctum')
            ->putJson("/api/v1/admin/users/{$target->id}/roles", ['roles' => ['wizard']])
            ->assertStatus(422)
            ->assertJsonValidationErrors('roles.0');

        $this->assertDatabaseHas('audit_logs', ['event' => 'user.roles_updated']);
    }

    public function test_a_page_is_a_draft_until_it_is_published(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/pages', [
            'slug' => 'about',
            'title' => 'درباره ما',
            'body' => 'متن صفحه',
        ])->assertCreated()->assertJsonPath('data.page.title', 'درباره ما');

        // The public endpoint only serves the `published` scope.
        $this->getJson('/api/v1/content/pages/about')->assertStatus(404);

        $page = \App\Models\Page::query()->sole();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/pages/{$page->id}", [
                'status' => 'published',
                'published_at' => now()->subMinute()->toIso8601String(),
            ])
            ->assertOk();

        $this->getJson('/api/v1/content/pages/about')
            ->assertOk()
            ->assertJsonPath('data.title', 'درباره ما');

        // Drafts are visible to the panel, which is the whole point of the admin list.
        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/pages?status=published')
            ->assertOk()
            ->assertJsonPath('meta.total', 1);
    }

    public function test_a_post_gets_its_author_from_the_session_and_can_be_deleted(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/posts', [
            'slug' => 'first-post',
            'title' => 'اولین نوشته',
            'body' => 'متن نوشته',
        ])->assertCreated();

        $post = Post::query()->sole();
        $this->assertSame($admin->getKey(), $post->author_id);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/posts/{$post->id}")
            ->assertOk();

        $this->assertSame(0, Post::query()->count());
        $this->assertNotEmpty($response->json('data.post.slug'));

        $this->assertDatabaseHas('audit_logs', ['event' => 'post.deleted']);
    }

    public function test_faq_entries_are_managed_and_only_active_ones_are_public(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/faqs', [
            'group' => 'shipping',
            'question' => 'ارسال چند روز طول می‌کشد؟',
            'answer' => 'دو روز کاری.',
            'position' => 1,
        ])->assertCreated();

        $this->getJson('/api/v1/content/faqs')->assertOk()->assertJsonPath('meta.total', 1);

        $faq = \App\Models\Faq::query()->sole();

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/faqs/{$faq->id}", ['is_active' => false])
            ->assertOk();

        $this->getJson('/api/v1/content/faqs')->assertOk()->assertJsonPath('meta.total', 0);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/faqs/{$faq->id}")
            ->assertOk();
    }

    public function test_a_setting_can_be_created_changed_and_its_key_is_immutable(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/settings', [
            'key' => 'shop.free_shipping',
            'value' => true,
            'type' => 'bool',
            'group' => 'shop',
            'is_public' => true,
        ])->assertCreated()->assertJsonPath('data.setting.value', true);

        $setting = Setting::query()->sole();

        // The key is what the storefront looks the row up by: renaming it is refused outright.
        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/settings/{$setting->id}", ['key' => 'shop.renamed'])
            ->assertStatus(422)
            ->assertJsonValidationErrors('key');

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/settings/{$setting->id}", ['value' => false])
            ->assertOk()
            ->assertJsonPath('data.setting.value', false);

        // The public endpoint serves public keys only.
        $this->getJson('/api/v1/content/settings')
            ->assertOk()
            ->assertJsonPath('data.0.key', 'shop.free_shipping')
            ->assertJsonPath('data.0.value', false);

        $this->actingAs($admin, 'sanctum')
            ->deleteJson("/api/v1/admin/settings/{$setting->id}")
            ->assertOk();

        $this->getJson('/api/v1/content/settings')->assertOk()->assertJsonPath('data', []);
    }

    public function test_the_audit_trail_is_readable_and_filterable_by_actor(): void
    {
        $admin = $this->admin();

        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/categories', ['name' => 'دستهٔ تازه'])
            ->assertCreated();

        $this->actingAs($admin, 'sanctum')
            ->getJson('/api/v1/admin/audit-logs?user_id='.$admin->getKey())
            ->assertOk()
            ->assertJsonPath('meta.total', 1)
            ->assertJsonPath('data.0.event', 'category.created');

        // The trail is append-only: there is no route that writes to it.
        $this->actingAs($admin, 'sanctum')
            ->postJson('/api/v1/admin/audit-logs', ['event' => 'forged'])
            ->assertStatus(405);
    }

    public function test_a_category_can_be_created_and_renamed(): void
    {
        $admin = $this->admin();

        $response = $this->actingAs($admin, 'sanctum')->postJson('/api/v1/admin/categories', [
            'name' => 'مانتو',
        ])->assertCreated();

        $id = $response->json('data.category.id');

        $this->actingAs($admin, 'sanctum')
            ->patchJson("/api/v1/admin/categories/{$id}", ['name' => 'مانتو و پالتو'])
            ->assertOk()
            ->assertJsonPath('data.category.name', 'مانتو و پالتو');

        $this->assertSame(1, Category::query()->count());
    }
}
