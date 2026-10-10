<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Events\OrderPlaced;
use App\Exceptions\CartChangedException;
use App\Exceptions\CouponNotApplicableException;
use App\Exceptions\InsufficientStockException;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\OrderStatusHistory;
use App\Models\Product;
use App\Models\User;
use App\Support\Money;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

/**
 * Turns a basket into an order.
 *
 * This is the most security-sensitive method in the application, and three rules make it safe:
 *
 *  1. **The client sends no money.** Prices, discounts, shipping and the total are computed here
 *     from rows locked inside this transaction. A request body can only carry *who* is buying and
 *     *where it goes*.
 *  2. **A stale price stops the sale.** If any line's price moved since it was added to the cart,
 *     or a product became unavailable, the whole checkout is refused with 409 so the shopper is
 *     never charged an amount they did not see.
 *  3. **All or nothing.** Order, lines, stock movements, coupon redemption and the cart hand-over
 *     happen in one transaction: a failure anywhere leaves the database exactly as it was, and the
 *     basket intact.
 */
class CheckoutService
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly CouponService $coupons,
        private readonly CartService $carts,
        private readonly PaymentService $payments,
        private readonly AuditLogger $audit,
    ) {}

    /**
     * @param  array{customer_name: string, customer_email: ?string, customer_phone: string, shipping_province: string, shipping_city: string, shipping_postal_code: string, shipping_line1: string, shipping_line2: ?string, note: ?string}  $customer
     *
     * @throws CartChangedException
     * @throws CouponNotApplicableException
     * @throws InsufficientStockException
     */
    public function place(Cart $cart, array $customer, ?User $user): Order
    {
        return DB::transaction(function () use ($cart, $customer, $user): Order {
            $cart = Cart::query()->whereKey($cart->getKey())->lockForUpdate()->firstOrFail();

            /** @var \Illuminate\Support\Collection<int, CartItem> $items */
            $items = CartItem::query()
                ->where('cart_id', $cart->getKey())
                ->orderBy('product_id')
                ->lockForUpdate()
                ->get();

            if ($items->isEmpty()) {
                throw new CartChangedException([['product_id' => 0, 'name' => 'Cart', 'reason' => 'is empty']]);
            }

            $products = Product::query()
                ->whereIn('id', $items->pluck('product_id'))
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('id');

            $changes = [];
            $lines = [];

            foreach ($items as $item) {
                $product = $products->get($item->product_id);

                if ($product === null || ! $product->is_active || $product->published_at === null || $product->published_at->isFuture()) {
                    $changes[] = [
                        'product_id' => (int) $item->product_id,
                        'name' => (string) ($product?->name ?? 'Item'),
                        'reason' => 'is no longer available',
                    ];

                    continue;
                }

                if ((int) $product->price !== (int) $item->unit_price) {
                    $changes[] = [
                        'product_id' => (int) $product->getKey(),
                        'name' => (string) $product->name,
                        'reason' => 'price has changed',
                    ];

                    continue;
                }

                $lines[] = ['product' => $product, 'quantity' => (int) $item->quantity];
            }

            if ($changes !== []) {
                throw new CartChangedException($changes);
            }

            $liveLines = collect($lines)->map(fn (array $line): array => [
                'unit_price' => (int) $line['product']->price,
                'quantity' => (int) $line['quantity'],
            ]);

            $coupon = $this->resolveCoupon($cart, $liveLines->sum(fn (array $line): int => $line['unit_price'] * $line['quantity']), $user);

            $totals = $this->carts->totalsForLines($liveLines, $coupon);

            $order = new Order;

            $order->user_id = $user?->getKey();
            $order->number = $this->generateNumber();
            // 32 random bytes as hex: the guest's only proof of ownership for this order.
            $order->access_token = bin2hex(random_bytes(32));
            $order->status = OrderStatus::PendingPayment;
            $order->payment_status = PaymentStatus::Pending;
            $order->currency = Money::CURRENCY;
            $order->subtotal = $totals->subtotal;
            $order->discount_total = $totals->discountTotal;
            $order->shipping_total = $totals->shippingTotal;
            $order->tax_total = $totals->taxTotal;
            $order->grand_total = $totals->grandTotal;
            $order->coupon_id = $coupon?->getKey();
            $order->items_count = $totals->itemsCount;
            $order->customer_name = $customer['customer_name'];
            // A signed-in shopper does not have to retype the address on their own account; the
            // column is still filled either way, because the receipt is sent from the order.
            $order->customer_email = $customer['customer_email'] ?? $user?->email;
            $order->customer_phone = $customer['customer_phone'];
            $order->shipping_province = $customer['shipping_province'];
            $order->shipping_city = $customer['shipping_city'];
            $order->shipping_postal_code = $customer['shipping_postal_code'];
            $order->shipping_line1 = $customer['shipping_line1'];
            $order->shipping_line2 = $customer['shipping_line2'] ?? null;
            $order->note = $customer['note'] ?? null;
            $order->placed_at = now();
            $order->save();

            foreach ($lines as $line) {
                /** @var Product $product */
                $product = $line['product'];
                $quantity = $line['quantity'];

                $orderItem = new OrderItem;

                $orderItem->order_id = $order->getKey();
                $orderItem->product_id = $product->getKey();
                // The name, sku and price are copied: the order stays readable and correct after
                // the catalogue changes.
                $orderItem->name = (string) $product->name;
                $orderItem->sku = (string) $product->sku;
                $orderItem->unit_price = (int) $product->price;
                $orderItem->quantity = $quantity;
                $orderItem->line_total = (int) $product->price * $quantity;
                $orderItem->attributes = $product->attributes;
                $orderItem->save();
            }

            // Stock is taken only once the order exists, so every movement can name it. A shortage
            // here rolls the whole transaction back — no order, no stock change.
            $this->inventory->reserve($lines, $order, $user);

            if ($coupon !== null) {
                $this->coupons->consume($coupon, $order, $totals->discountTotal, $user);
            }

            $history = new OrderStatusHistory;

            $history->order_id = $order->getKey();
            $history->from_status = null;
            $history->to_status = OrderStatus::PendingPayment;
            $history->changed_by = $user?->getKey();
            $history->note = 'سفارش ثبت شد';
            $history->created_at = now();
            $history->save();

            // The basket is closed, not deleted: its lines go, so a page refresh cannot reorder,
            // and the cart row keeps the story of what was bought.
            $cart->items()->delete();
            $cart->status = Cart::STATUS_CONVERTED;
            $cart->coupon_id = null;
            $cart->save();

            $this->audit->log('order.placed', $order, [
                'number' => $order->number,
                'total' => $order->grand_total,
                'items' => $order->items_count,
                'coupon' => $coupon?->code,
                'guest' => $user === null,
            ], $user);

            OrderPlaced::dispatch($order);

            return $order->load('items');
        });
    }

    /**
     * Re-validates the cart's coupon against the *live* subtotal while holding its row lock, so a
     * code that expired (or was used up) between "add to cart" and "pay" stops the checkout
     * instead of silently changing the total.
     *
     * @throws CartChangedException
     */
    private function resolveCoupon(Cart $cart, int $subtotal, ?User $user): ?Coupon
    {
        if ($cart->coupon_id === null) {
            return null;
        }

        $coupon = $this->coupons->lockForCheckout(
            Coupon::query()->whereKey($cart->coupon_id)->firstOrFail(),
        );

        if (! $this->coupons->isUsable($coupon, $subtotal, $user)) {
            throw new CartChangedException([[
                'product_id' => 0,
                'name' => 'Coupon',
                'reason' => 'is no longer valid',
            ]]);
        }

        return $coupon;
    }

    /**
     * Records a purchase the shop has already taken, from the shopper's own basket.
     *
     * The storefront's basket, its coupon and its «مدورا کوین» balance live in the browser, so a
     * finished order arrives here as a list of slugs rather than as a server-side cart. Two things
     * follow from that, and both are deliberate:
     *
     *  1. **The line money is the catalogue's.** Every slug is resolved and locked, and the order is
     *     priced from those rows: a payload names products and quantities, never prices.
     *  2. **Shipping and the discount are reported**, exactly as the checkout screen quoted them,
     *     because the basket that produced them is not here. They are recorded as sent; only the
     *     item money is proven. Handing the basket over to the cart endpoints is what would make
     *     them proven too.
     *
     * Stock is taken through the same ledger as `place()`, so a recorded order shows up in
     * inventory exactly like one that went through the cart.
     *
     * @param  array<string, mixed>  $payload
     *
     * @throws ValidationException
     */
    public function record(array $payload, ?User $user): Order
    {
        return DB::transaction(function () use ($payload, $user): Order {
            /** @var \Illuminate\Support\Collection<int, array<string, mixed>> $requested */
            $requested = collect($payload['items']);

            $products = Product::query()
                ->whereIn('slug', $requested->pluck('slug')->unique()->values())
                ->orderBy('id')
                ->lockForUpdate()
                ->get()
                ->keyBy('slug');

            $lines = [];
            $missing = [];

            foreach ($requested as $item) {
                $product = $products->get((string) $item['slug']);

                if ($product === null || ! $product->is_active || $product->published_at === null || $product->published_at->isFuture()) {
                    $missing[] = (string) $item['slug'];

                    continue;
                }

                $lines[] = [
                    'product' => $product,
                    'quantity' => (int) $item['quantity'],
                    'attributes' => $item['attributes'] ?? null,
                ];
            }

            if ($missing !== []) {
                throw ValidationException::withMessages([
                    'items' => 'این محصولات دیگر در فروشگاه نیستند: '.implode('، ', $missing),
                ]);
            }

            $subtotal = 0;
            $itemsCount = 0;

            foreach ($lines as $line) {
                $subtotal += (int) $line['product']->price * $line['quantity'];
                $itemsCount += $line['quantity'];
            }

            $shipping = max(0, (int) ($payload['shipping']['cost'] ?? 0));
            // Never more than the basket is worth: a larger discount would make the total negative,
            // which no order may carry.
            $discount = min(max(0, (int) ($payload['discount_total'] ?? 0)), $subtotal);
            $grandTotal = max(0, $subtotal - $discount + $shipping);

            $reported = (string) ($payload['payment']['status'] ?? 'pending');

            // The reported outcome picks a status the lifecycle already allows — never an arbitrary
            // one. A failed or cancelled payment cancels the order; anything else is unpaid.
            $status = match ($reported) {
                'paid' => OrderStatus::Paid,
                'pending' => OrderStatus::Processing,
                'failed', 'cancelled' => OrderStatus::Cancelled,
                default => OrderStatus::PendingPayment,
            };

            $paymentStatus = match ($reported) {
                'paid' => PaymentStatus::Succeeded,
                'failed' => PaymentStatus::Failed,
                'cancelled' => PaymentStatus::Cancelled,
                default => PaymentStatus::Pending,
            };

            $customer = (array) $payload['customer'];

            $order = new Order;

            $order->user_id = $user?->getKey();
            $order->number = $this->recordedNumber($payload['number'] ?? null);
            $order->access_token = bin2hex(random_bytes(32));
            $order->status = $status;
            $order->payment_status = $paymentStatus;
            $order->currency = Money::CURRENCY;
            $order->subtotal = $subtotal;
            $order->discount_total = $discount;
            $order->shipping_total = $shipping;
            $order->tax_total = 0;
            $order->grand_total = $grandTotal;
            $order->items_count = $itemsCount;
            $order->customer_name = (string) $customer['name'];
            $order->customer_email = $customer['email'] ?? $user?->email;
            $order->customer_phone = (string) $customer['phone'];
            $order->shipping_province = (string) $customer['province'];
            $order->shipping_city = (string) $customer['city'];
            $order->shipping_postal_code = (string) $customer['postal_code'];
            $order->shipping_line1 = (string) $customer['line1'];
            $order->note = $customer['note'] ?? null;
            $order->placed_at = now();
            $order->paid_at = $paymentStatus === PaymentStatus::Succeeded
                ? (isset($payload['payment']['paid_at']) ? Carbon::parse((string) $payload['payment']['paid_at']) : now())
                : null;
            $order->save();

            foreach ($lines as $line) {
                /** @var Product $product */
                $product = $line['product'];
                $quantity = $line['quantity'];

                $orderItem = new OrderItem;

                $orderItem->order_id = $order->getKey();
                $orderItem->product_id = $product->getKey();
                $orderItem->name = (string) $product->name;
                $orderItem->sku = (string) $product->sku;
                $orderItem->unit_price = (int) $product->price;
                $orderItem->quantity = $quantity;
                $orderItem->line_total = (int) $product->price * $quantity;
                // What the shopper picked on the product page — size and colour — when the
                // storefront sent it; the catalogue's own attributes otherwise.
                $picked = $line['attributes'] ?? null;
                $orderItem->attributes = is_array($picked) && $picked !== [] ? $picked : $product->attributes;
                $orderItem->save();
            }

            $this->inventory->reserve($lines, $order, $user);

            $history = new OrderStatusHistory;

            $history->order_id = $order->getKey();
            $history->from_status = null;
            $history->to_status = $status;
            $history->changed_by = $user?->getKey();
            $history->note = 'سفارش در فروشگاه ثبت شد';
            $history->created_at = now();
            $history->save();

            if ($paymentStatus === PaymentStatus::Succeeded) {
                $this->payments->recordSettled(
                    $order,
                    (string) ($payload['payment']['method'] ?? 'online'),
                    $payload['payment']['reference'] ?? null,
                );
            }

            $this->audit->log('order.recorded', $order, [
                'number' => $order->number,
                'total' => $order->grand_total,
                'items' => $order->items_count,
                'payment' => $paymentStatus->value,
                'guest' => $user === null,
            ], $user);

            OrderPlaced::dispatch($order);

            return $order->load('items', 'payments');
        });
    }

    /**
     * The number the shopper was already shown, when it is free — so the panel and the shopper's
     * own account name the same order — and one of ours otherwise.
     */
    private function recordedNumber(?string $number): string
    {
        $candidate = is_string($number) ? mb_strtoupper(trim($number)) : '';

        if ($candidate !== ''
            && preg_match('/^[A-Z0-9-]{4,32}$/', $candidate) === 1
            && ! Order::query()->where('number', $candidate)->exists()) {
            return $candidate;
        }

        return $this->generateNumber();
    }

    /**
     * A human-quotable number. The unique index is the real guarantee — the loop just avoids the
     * error page in the (vanishingly rare) collision.
     */
    private function generateNumber(): string
    {
        do {
            $number = 'MD-'.now()->format('ymd').'-'.Str::upper(Str::random(6));
        } while (Order::query()->where('number', $number)->exists());

        return $number;
    }
}
