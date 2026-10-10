<?php

namespace Tests\Feature\Security;

use App\Models\Category;
use App\Models\Order;
use App\Models\Payment;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Tests\TestCase;

/**
 * Inbound webhook security and payment integrity.
 *
 * The endpoint is public by definition, so nothing about it is trusted because of where the request
 * came from: the body is signed, the timestamp is bounded, the idempotency key is single-use, and
 * the amount comes from the payment row rather than from the payload.
 */
class WebhookSecurityTest extends TestCase
{
    use RefreshDatabase;

    private const SECRET = 'test-webhook-secret-not-a-real-one';

    protected function setUp(): void
    {
        parent::setUp();

        config([
            'security.webhooks.payment.secret' => self::SECRET,
            'security.webhooks.payment.tolerance_seconds' => 300,
        ]);
    }

    /**
     * An order waiting for payment, with the authority the gateway issued.
     *
     * @return array{order: Order, payment: Payment}
     */
    private function awaitingPayment(): array
    {
        $product = Product::factory()->for(Category::factory())->create(['price' => 300_000, 'stock_quantity' => 2]);

        $cartToken = $this->postJson('/api/v1/cart/items', ['product_id' => $product->getKey(), 'quantity' => 1])
            ->assertCreated()->headers->get('X-Cart-Token');

        $this->withHeaders(['X-Cart-Token' => $cartToken])->postJson('/api/v1/checkout', [
            'customer_name' => 'خریدار',
            'customer_email' => 'buyer@example.com',
            'customer_phone' => '09121234567',
            'shipping_province' => 'تهران',
            'shipping_city' => 'تهران',
            'shipping_postal_code' => '1234567890',
            'shipping_line1' => 'نشانی',
        ])->assertCreated();

        return ['order' => Order::query()->sole(), 'payment' => Payment::query()->sole()];
    }

    /**
     * @param  array<string, mixed>  $payload
     * @return array<string, string>
     */
    private function signedHeaders(array $payload, ?int $timestamp = null, string $secret = self::SECRET, ?string $key = null): array
    {
        $timestamp ??= now()->getTimestamp();
        $body = json_encode($payload);

        return [
            'X-Medora-Signature' => 'sha256='.hash_hmac('sha256', $timestamp.'.'.$body, $secret),
            'X-Medora-Timestamp' => (string) $timestamp,
            'X-Medora-Idempotency-Key' => $key ?? 'delivery-'.uniqid('', true),
            'Content-Type' => 'application/json',
        ];
    }

    public function test_without_a_configured_secret_the_endpoint_refuses_everything(): void
    {
        config(['security.webhooks.payment.secret' => null]);

        $this->postJson('/api/v1/payments/webhook', ['authority' => 'X-1', 'status' => 'OK'])
            ->assertStatus(503);
    }

    public function test_a_request_without_a_signature_is_refused(): void
    {
        $this->postJson('/api/v1/payments/webhook', ['authority' => 'X-1', 'status' => 'OK'])
            ->assertStatus(403)
            ->assertJsonPath('code', 'invalid_signature');

        // Knowing the URL is not enough, and neither is knowing the shape of the payload.
        $this->postJson('/api/v1/payments/webhook', ['authority' => 'X-1', 'status' => 'OK'], [
            'X-Medora-Timestamp' => (string) now()->getTimestamp(),
            'X-Medora-Idempotency-Key' => 'k1',
        ])->assertStatus(403);
    }

    public function test_a_wrong_signature_or_a_stale_timestamp_is_refused(): void
    {
        $payload = ['authority' => 'X-1', 'status' => 'OK'];

        // Signed with the wrong secret.
        $this->postJson('/api/v1/payments/webhook', $payload, $this->signedHeaders($payload, secret: 'not-the-secret'))
            ->assertStatus(403);

        // Correctly signed, but captured long enough ago that a replay must not be accepted.
        $this->postJson('/api/v1/payments/webhook', $payload, $this->signedHeaders($payload, timestamp: now()->subHour()->getTimestamp()))
            ->assertStatus(403);

        // Correctly signed and fresh: allowed through (and answered 404 here, because no payment
        // carries that authority).
        $this->postJson('/api/v1/payments/webhook', $payload, $this->signedHeaders($payload))
            ->assertStatus(404);
    }

    public function test_a_valid_notification_settles_the_order_and_a_replay_does_nothing(): void
    {
        ['order' => $order, 'payment' => $payment] = $this->awaitingPayment();

        $payload = ['authority' => $payment->authority, 'status' => 'OK'];
        $headers = $this->signedHeaders($payload, key: 'delivery-1');

        $this->postJson('/api/v1/payments/webhook', $payload, $headers)
            ->assertOk()
            ->assertJsonPath('data.payment_status', 'succeeded');

        $this->assertSame('paid', $order->fresh()->status->value);

        // The same delivery again — a gateway retry, or somebody replaying a captured request with
        // the same key — is a no-op that says so.
        $this->postJson('/api/v1/payments/webhook', $payload, $headers)
            ->assertOk()
            ->assertJsonPath('data.duplicate', true);

        $this->assertSame(1, Payment::query()->where('status', 'succeeded')->count());

        // A *new* key replaying an already-settled payment settles nothing either: `settle()` is
        // idempotent, so the double-application the signature cannot prevent is prevented here.
        $this->postJson('/api/v1/payments/webhook', $payload, $this->signedHeaders($payload, key: 'delivery-2'))
            ->assertOk();

        $this->assertSame(1, Payment::query()->where('status', 'succeeded')->count());
        $this->assertSame(1, DB::table('order_status_histories')->where('order_id', $order->getKey())->count());
    }

    public function test_the_amount_is_never_read_from_the_request(): void
    {
        ['order' => $order, 'payment' => $payment] = $this->awaitingPayment();

        // An amount in the query string, and none in the body (which must carry exactly two
        // fields). The settlement reads our own payment row, so neither changes anything.
        $payload = ['authority' => $payment->authority, 'status' => 'OK'];

        $this->postJson('/api/v1/payments/webhook?amount=1&grand_total=1', $payload, $this->signedHeaders($payload))
            ->assertOk();

        // The settlement used the amount from our own payment row, and every total on the order is
        // exactly what the checkout computed.
        $this->assertSame(300_000, $payment->fresh()->amount);
        $this->assertSame(300_000, $order->fresh()->subtotal);
        $this->assertSame(345_000, $order->fresh()->grand_total);
    }

    public function test_the_payload_is_validated_strictly(): void
    {
        $invalid = [
            ['status' => 'OK'],
            ['authority' => '../../etc/passwd', 'status' => 'OK'],
            ['authority' => 'X-1', 'status' => 'MAYBE'],
            ['authority' => 'X-1', 'status' => 'OK', 'unknown' => 'x'],
        ];

        foreach ($invalid as $payload) {
            $this->postJson('/api/v1/payments/webhook', $payload, $this->signedHeaders($payload))
                ->assertStatus(422);
        }
    }
}
