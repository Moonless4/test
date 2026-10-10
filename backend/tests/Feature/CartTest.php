<?php

namespace Tests\Feature;

use App\Models\CartItem;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The basket: lines, stock guards, coupons and the totals the client is shown.
 */
class CartTest extends TestCase
{
    use RefreshDatabase;

    private function product(array $attributes = []): Product
    {
        return Product::factory()->for(Category::factory())->create($attributes);
    }

    public function test_a_guest_gets_a_cart_with_a_token_that_round_trips(): void
    {
        $product = $this->product(['price' => 1_000_000]);

        $created = $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 1])
            ->assertCreated();

        $token = $created->headers->get('X-Cart-Token');
        $this->assertSame(64, strlen((string) $token));
        $this->assertMatchesRegularExpression('/^[a-f0-9]{64}$/', (string) $token);

        $again = $this->withHeaders(['X-Cart-Token' => $token])
            ->getJson('/api/v1/cart')
            ->assertOk();

        $this->assertSame(1, $again->json('data.totals.items_count'));
        // Same cart, not a new one: the token identified it.
        $this->assertSame(1, \App\Models\Cart::query()->count());
    }

    public function test_the_totals_are_computed_from_the_catalogue_not_from_the_request(): void
    {
        $product = $this->product(['price' => 400_000]);

        $response = $this->postJson('/api/v1/cart/items', [
            'product_id' => $product->getKey(),
            'quantity' => 2,
            // A payload that tries to set its own price is simply not read.
            'unit_price' => 1,
            'price' => 1,
        ])->assertCreated();

        $totals = $response->json('data.totals');

        $this->assertSame(800_000, $totals['subtotal']);
        $this->assertSame(45_000, $totals['shipping_total']);
        $this->assertSame(845_000, $totals['grand_total']);
    }

    public function test_free_shipping_above_the_threshold(): void
    {
        $product = $this->product(['price' => 2_500_000]);

        $totals = $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 1])
            ->json('data.totals');

        $this->assertSame(0, $totals['shipping_total']);
        $this->assertSame(2_500_000, $totals['grand_total']);
    }

    public function test_free_shipping_starts_exactly_at_the_threshold(): void
    {
        $threshold = (int) config('shop.shipping.free_threshold');

        // One Toman below the threshold is still charged.
        $below = $this->product(['price' => $threshold - 1]);
        $totals = $this->postJson('/api/v1/cart/items', ['product_id' => $below->getKey(), 'quantity' => 1])
            ->json('data.totals');
        $this->assertSame((int) config('shop.shipping.flat_rate'), $totals['shipping_total']);

        // Exactly at it, shipping is free.
        $at = $this->product(['price' => $threshold]);
        $totals = $this->postJson('/api/v1/cart/items', ['product_id' => $at->getKey(), 'quantity' => 1])
            ->json('data.totals');
        $this->assertSame(0, $totals['shipping_total']);
    }

    public function test_a_quantity_above_stock_is_refused(): void
    {
        $product = $this->product(['stock_quantity' => 3]);

        $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 4])
            ->assertStatus(422)
            ->assertJsonValidationErrors('quantity');

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_an_unpublished_product_cannot_be_added(): void
    {
        $product = $this->product(['is_active' => false, 'published_at' => null]);

        $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 1])
            ->assertStatus(404);
    }

    public function test_a_zero_quantity_removes_the_line(): void
    {
        $product = $this->product();
        $token = $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 2])
            ->headers->get('X-Cart-Token');

        $this->withHeaders(['X-Cart-Token' => $token])
            ->patchJson("/api/v1/cart/items/{$product->getKey()}", ['quantity' => 0])
            ->assertOk()
            ->assertJsonPath('data.totals.items_count', 0);

        $this->assertDatabaseCount('cart_items', 0);
    }

    public function test_a_valid_coupon_discounts_the_total(): void
    {
        $product = $this->product(['price' => 1_000_000]);
        $coupon = Coupon::factory()->percent(20)->create(['code' => 'WELCOME20']);

        $token = $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 1])
            ->headers->get('X-Cart-Token');

        $response = $this->withHeaders(['X-Cart-Token' => $token])
            ->postJson('/api/v1/cart/coupon', ['code' => 'welcome20'])
            ->assertOk();

        $totals = $response->json('data.totals');

        $this->assertSame(200_000, $totals['discount_total']);
        $this->assertSame('WELCOME20', $totals['coupon_code']);
        $this->assertSame(845_000, $totals['grand_total']);
    }

    public function test_coupon_rejections_all_look_the_same(): void
    {
        $product = $this->product(['price' => 900_000]);
        Coupon::factory()->expired()->create(['code' => 'EXPIRED10']);
        Coupon::factory()->inactive()->create(['code' => 'OFF10']);
        Coupon::factory()->create(['code' => 'BIGORDER', 'min_subtotal' => 5_000_000]);

        $token = $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 1])
            ->headers->get('X-Cart-Token');

        foreach (['EXPIRED10', 'OFF10', 'BIGORDER', 'DOES-NOT-EXIST'] as $code) {
            $this->withHeaders(['X-Cart-Token' => $token])
                ->postJson('/api/v1/cart/coupon', ['code' => $code])
                ->assertStatus(422)
                ->assertJsonPath('message', 'این کد تخفیف معتبر نیست.');
        }
    }

    public function test_a_coupon_can_be_removed_again(): void
    {
        $product = $this->product(['price' => 1_000_000]);
        Coupon::factory()->percent(10)->create(['code' => 'TENOFF']);

        $token = $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 1])
            ->headers->get('X-Cart-Token');

        $this->withHeaders(['X-Cart-Token' => $token])->postJson('/api/v1/cart/coupon', ['code' => 'TENOFF'])->assertOk();
        $this->withHeaders(['X-Cart-Token' => $token])->deleteJson('/api/v1/cart/coupon')->assertOk()
            ->assertJsonPath('data.totals.discount_total', 0);
    }

    public function test_a_signed_in_shopper_gets_their_guest_basket_merged(): void
    {
        $product = $this->product(['price' => 1_000_000]);
        $user = \App\Models\User::factory()->create();

        $token = $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 1])
            ->headers->get('X-Cart-Token');

        $this->actingAs($user, 'sanctum')
            ->withHeaders(['X-Cart-Token' => $token])
            ->postJson('/api/v1/auth/cart/merge')
            ->assertOk()
            ->assertJsonPath('data.totals.items_count', 1);

        $this->assertSame(1, CartItem::query()->whereHas('cart', fn ($q) => $q->where('user_id', $user->getKey()))->count());

        // The guest token is retired: the same header no longer finds a cart.
        $this->assertNull(\App\Models\Cart::query()->where('token', $token)->where('status', 'active')->first());
    }
}
