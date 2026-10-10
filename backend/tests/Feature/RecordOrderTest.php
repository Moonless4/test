<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

/**
 * A purchase the storefront's own basket already finished.
 *
 * The basket and the gateway are the browser's, so what this endpoint is given is a *report*. These
 * tests are therefore mostly about what it refuses to believe: only the item money is proven from
 * the catalogue, and a product that has left the shop stops the record entirely.
 */
class RecordOrderTest extends TestCase
{
    use RefreshDatabase;

    private function payload(Product $product, array $overrides = []): array
    {
        return array_merge([
            'number' => 'ST-123456',
            'items' => [['slug' => $product->slug, 'quantity' => 2, 'attributes' => ['size' => 'M']]],
            'customer' => [
                'name' => 'خریدار مهمان',
                'phone' => '09121234567',
                'province' => 'تهران',
                'city' => 'تهران',
                'postal_code' => '1234567890',
                'line1' => 'خیابان نمونه، پلاک ۱',
            ],
            'shipping' => ['title' => 'پست پیشتاز', 'cost' => 45_000],
            'discount_total' => 0,
            'payment' => ['method' => 'online', 'status' => 'paid', 'reference' => 'SBX-123'],
        ], $overrides);
    }

    public function test_a_paid_storefront_order_is_recorded_and_priced_from_the_catalogue(): void
    {
        Notification::fake();

        $product = Product::factory()->for(Category::factory())->create(['price' => 400_000, 'stock_quantity' => 5]);

        $response = $this->postJson('/api/v1/checkout/record', $this->payload($product, [
            'discount_total' => 50_000,
        ]))->assertCreated();

        $order = $response->json('data.order');

        // The number the shopper was shown, so the panel and their own account name one order.
        $this->assertSame('ST-123456', $order['number']);
        $this->assertSame('paid', $order['status']);
        $this->assertSame('succeeded', $order['payment_status']);

        // The money is the catalogue's: ۲ × ۴۰۰٬۰۰۰ منهای تخفیف به‌علاوهٔ ارسال.
        $this->assertSame(800_000, $order['subtotal']);
        $this->assertSame(50_000, $order['discount_total']);
        $this->assertSame(45_000, $order['shipping_total']);
        $this->assertSame(795_000, $order['grand_total']);

        // What the shopper picked travels with the line, so the panel can see the size.
        $this->assertSame(['size' => 'M'], Order::query()->sole()->items()->sole()->attributes);

        // Stock moved through the same ledger a cart checkout writes to.
        $this->assertSame(3, $product->fresh()->stock_quantity);
        $this->assertSame(-2, StockMovement::query()->where('product_id', $product->getKey())->sum('delta'));

        // The attempt is on the record, with the bank's own tracking code.
        $this->assertDatabaseHas('payments', [
            'order_id' => Order::query()->sole()->getKey(),
            'status' => 'succeeded',
            'reference_id' => 'SBX-123',
            'amount' => 795_000,
        ]);
    }

    public function test_a_product_that_left_the_catalogue_is_refused(): void
    {
        $product = Product::factory()->for(Category::factory())->draft()->create();

        $this->postJson('/api/v1/checkout/record', $this->payload($product))
            ->assertStatus(422)
            ->assertJsonValidationErrors('items');

        // Nothing was written and nothing was taken from stock.
        $this->assertSame(0, Order::query()->count());
        $this->assertSame(0, StockMovement::query()->count());
    }

    public function test_a_pay_on_delivery_order_is_recorded_unpaid(): void
    {
        $product = Product::factory()->for(Category::factory())->create(['price' => 400_000, 'stock_quantity' => 5]);

        $response = $this->postJson('/api/v1/checkout/record', $this->payload($product, [
            'payment' => ['method' => 'cod', 'status' => 'pending'],
        ]))->assertCreated();

        $order = $response->json('data.order');

        // Confirmed, but the money has not been collected — which is exactly what the panel shows.
        $this->assertSame('processing', $order['status']);
        $this->assertSame('pending', $order['payment_status']);
        $this->assertDatabaseCount('payments', 0);
    }

    public function test_a_number_that_is_already_taken_falls_back_to_one_of_ours(): void
    {
        $product = Product::factory()->for(Category::factory())->create(['price' => 400_000, 'stock_quantity' => 5]);

        $first = $this->postJson('/api/v1/checkout/record', $this->payload($product))
            ->assertCreated()
            ->json('data.order.number');

        $second = $this->postJson('/api/v1/checkout/record', $this->payload($product))
            ->assertCreated()
            ->json('data.order.number');

        $this->assertSame('ST-123456', $first);
        // The shop's number, because the shopper's own is already on the books.
        $this->assertStringStartsWith('MD-', $second);
    }
}
