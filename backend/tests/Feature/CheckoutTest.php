<?php

namespace Tests\Feature;

use App\Enums\OrderStatus;
use App\Models\Category;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * Checkout is where money is decided, so these tests are about what the server refuses as much as
 * about what it accepts.
 */
class CheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'customer_name' => 'خریدار مهمان',
            'customer_email' => 'guest@example.com',
            'customer_phone' => '09121234567',
            'shipping_province' => 'تهران',
            'shipping_city' => 'تهران',
            'shipping_postal_code' => '1234567890',
            'shipping_line1' => 'خیابان نمونه، پلاک ۱',
        ], $overrides);
    }

    private function cartWith(Product $product, int $quantity = 1): array
    {
        $token = $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => $quantity])
            ->assertCreated()
            ->headers->get('X-Cart-Token');

        return ['X-Cart-Token' => $token];
    }

    public function test_a_guest_can_check_out_and_receives_an_access_token(): void
    {
        Notification::fake();

        $product = Product::factory()->for(Category::factory())->create(['price' => 400_000, 'stock_quantity' => 5]);
        $headers = $this->cartWith($product, 2);

        $response = $this->withHeaders($headers)->postJson('/api/v1/checkout', $this->payload())->assertCreated();

        $order = $response->json('data.order');

        $this->assertStringStartsWith('MD-', $order['number']);
        $this->assertSame(800_000, $order['subtotal']);
        $this->assertSame(45_000, $order['shipping_total']);
        $this->assertSame(845_000, $order['grand_total']);
        $this->assertSame('pending_payment', $order['status']);
        $this->assertNotEmpty($order['access_token']);
        $this->assertNotEmpty($response->json('data.payment.redirect_url'));

        // Stock moved, and the ledger says why.
        $this->assertSame(3, $product->fresh()->stock_quantity);
        $this->assertSame(-2, StockMovement::query()->where('product_id', $product->getKey())->sum('delta'));

        // The basket is closed and empty.
        $this->assertSame(0, $this->withHeaders($headers)->getJson('/api/v1/cart')->json('data.totals.items_count'));

        // The confirmation went out through the event → listener → notification chain. In tests
        // the queue is `sync`, so it happens inside the request; on a host the listener is queued
        // and a cron entry drains it.
        Notification::assertSentOnDemand(\App\Notifications\OrderPlacedNotification::class);
    }

    public function test_a_price_change_since_the_basket_was_filled_stops_the_checkout(): void
    {
        $product = Product::factory()->for(Category::factory())->create(['price' => 1_000_000, 'stock_quantity' => 5]);
        $headers = $this->cartWith($product);

        // Somebody repriced the product after the shopper put it in the basket.
        $product->price = 1_400_000;
        $product->save();

        $this->withHeaders($headers)
            ->postJson('/api/v1/checkout', $this->payload())
            ->assertStatus(409)
            ->assertJsonValidationErrors('cart');

        // Nothing was written and nothing was taken from stock: the shopper is asked to look again
        // rather than charged a price they never saw.
        $this->assertSame(0, Order::query()->count());
        $this->assertSame(5, $product->fresh()->stock_quantity);
        $this->assertSame(0, StockMovement::query()->count());
    }

    public function test_an_empty_basket_is_refused(): void
    {
        $this->postJson('/api/v1/checkout', $this->payload())->assertStatus(409);

        $this->assertSame(0, Order::query()->count());
    }

    public function test_a_shortage_at_checkout_rolls_the_whole_transaction_back(): void
    {
        $product = Product::factory()->for(Category::factory())->create(['price' => 1_000_000, 'stock_quantity' => 5]);
        $headers = $this->cartWith($product, 2);

        // Another order bought the last pieces in the meantime.
        $product->stock_quantity = 1;
        $product->save();

        $this->withHeaders($headers)
            ->postJson('/api/v1/checkout', $this->payload())
            ->assertStatus(409);

        $this->assertSame(0, Order::query()->count());
        $this->assertSame(1, $product->fresh()->stock_quantity);
        $this->assertSame(0, StockMovement::query()->count());
    }

    public function test_a_coupon_is_consumed_exactly_once_and_cannot_be_over_redeemed(): void
    {
        $product = Product::factory()->for(Category::factory())->create(['price' => 1_000_000, 'stock_quantity' => 5]);
        $coupon = Coupon::factory()->percent(10)->create(['code' => 'ONCEONLY', 'usage_limit' => 1]);

        $headers = $this->cartWith($product);
        $this->withHeaders($headers)->postJson('/api/v1/cart/coupon', ['code' => 'ONCEONLY'])->assertOk();

        $response = $this->withHeaders($headers)->postJson('/api/v1/checkout', $this->payload())->assertCreated();
        $this->assertSame(100_000, $response->json('data.order.discount_total'));
        $this->assertSame(1, $coupon->fresh()->used_count);
        $this->assertDatabaseCount('coupon_redemptions', 1);

        // A second basket cannot spend the same code.
        $second = $this->cartWith($product);
        $this->withHeaders($second)->postJson('/api/v1/cart/coupon', ['code' => 'ONCEONLY'])->assertStatus(422);
    }

    public function test_a_guest_checkout_needs_an_email(): void
    {
        $product = Product::factory()->for(Category::factory())->create(['stock_quantity' => 5]);
        $headers = $this->cartWith($product);

        $this->withHeaders($headers)
            ->postJson('/api/v1/checkout', $this->payload(['customer_email' => null]))
            ->assertStatus(422)
            ->assertJsonValidationErrors('customer_email');

        $this->assertSame(0, Order::query()->count());
    }

    public function test_a_signed_in_shopper_does_not_need_to_re_enter_their_email_and_the_order_is_theirs(): void
    {
        $user = \App\Models\User::factory()->create(['email' => 'shopper@example.com']);
        $product = Product::factory()->for(Category::factory())->create(['stock_quantity' => 5]);

        $token = $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 1])
            ->headers->get('X-Cart-Token');

        $payload = $this->payload();
        unset($payload['customer_email']);

        // A real bearer token on a route without auth middleware: the sanctum guard still
        // identifies the shopper, so the order is attached to their account instead of being
        // filed as a guest order.
        $response = $this->withToken($this->tokenFor($user))
            ->withHeaders(['X-Cart-Token' => $token])
            ->postJson('/api/v1/checkout', $payload)
            ->assertCreated();

        $order = Order::query()->where('number', $response->json('data.order.number'))->firstOrFail();

        $this->assertSame($user->getKey(), $order->user_id);
        $this->assertSame('shopper@example.com', $order->customer_email);
    }

    private function tokenFor(\App\Models\User $user): string
    {
        return $user->createToken('test')->plainTextToken;
    }

    public function test_the_order_stores_its_own_copy_of_the_shipping_details(): void
    {
        $product = Product::factory()->for(Category::factory())->create(['stock_quantity' => 5]);
        $headers = $this->cartWith($product);

        $this->withHeaders($headers)->postJson('/api/v1/checkout', $this->payload())->assertCreated();

        $order = Order::query()->firstOrFail();

        $this->assertSame('تهران', $order->shipping_province);
        $this->assertSame('1234567890', $order->shipping_postal_code);
        $this->assertSame(OrderStatus::PendingPayment, $order->status);
        $this->assertNotNull($order->placed_at);
        $this->assertSame(64, strlen($order->access_token));
    }

    public function test_the_payment_callback_settles_the_order_and_is_idempotent(): void
    {
        Notification::fake();

        $product = Product::factory()->for(Category::factory())->create(['price' => 1_000_000, 'stock_quantity' => 5]);
        $headers = $this->cartWith($product);

        $this->withHeaders($headers)->postJson('/api/v1/checkout', $this->payload())->assertCreated();

        $payment = \App\Models\Payment::query()->firstOrFail();
        $authority = (string) $payment->authority;

        $this->getJson("/api/v1/payments/callback?Authority={$authority}&Status=OK")->assertOk();

        $order = Order::query()->firstOrFail();
        $this->assertSame(OrderStatus::Paid, $order->status);
        $this->assertNotNull($order->paid_at);

        // Refreshing the page cannot settle it twice.
        $paidAt = $order->paid_at;
        $this->getJson("/api/v1/payments/callback?Authority={$authority}&Status=OK")->assertOk();

        $order->refresh();
        $this->assertSame(OrderStatus::Paid, $order->status);
        $this->assertEquals($paidAt->timestamp, $order->paid_at->timestamp);
        $this->assertDatabaseCount('order_status_histories', 2); // placed + paid
    }

    public function test_a_cancelled_payment_leaves_the_order_unpaid(): void
    {
        $product = Product::factory()->for(Category::factory())->create(['stock_quantity' => 5]);
        $headers = $this->cartWith($product);

        $this->withHeaders($headers)->postJson('/api/v1/checkout', $this->payload())->assertCreated();

        $authority = (string) \App\Models\Payment::query()->firstOrFail()->authority;

        $this->getJson("/api/v1/payments/callback?Authority={$authority}&Status=NOK")->assertOk();

        $order = Order::query()->firstOrFail();
        $this->assertSame(OrderStatus::PendingPayment, $order->status);
        $this->assertNull($order->paid_at);
    }

    public function test_an_unknown_authority_is_not_found(): void
    {
        $this->getJson('/api/v1/payments/callback?Authority=UNKNOWN&Status=OK')->assertStatus(404);
    }
}
