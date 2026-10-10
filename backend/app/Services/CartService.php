<?php

namespace App\Services;

use App\Exceptions\CouponNotApplicableException;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Coupon;
use App\Models\Product;
use App\Models\User;
use App\Support\CartTotals;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The basket.
 *
 * Everything money-related is computed here from the current catalogue — never from the client,
 * and never from the snapshot stored on a cart line. A guest cart is addressed by a 64-character
 * random token that only its owner has, so one visitor can never read another's basket.
 */
class CartService
{
    public function __construct(
        private readonly CouponService $coupons,
        private readonly AuditLogger $audit,
    ) {}

    /**
     * Resolves the cart for this request: the signed-in shopper's cart, the guest cart named by
     * the X-Cart-Token header, or a brand new guest cart.
     */
    public function forRequest(Request $request): Cart
    {
        // The sanctum guard is resolved directly because the cart endpoints are public (a guest
        // needs a basket too); a bearer token that is present still identifies the shopper.
        $user = $request->user('sanctum');
        $token = $this->token($request);

        if ($user !== null) {
            return $this->forUser($user, $token);
        }

        if ($token !== null) {
            $cart = Cart::query()
                ->active()
                ->where('token', $token)
                ->first();

            if ($cart !== null && ($cart->expires_at === null || $cart->expires_at->isFuture())) {
                return $cart->load('items.product', 'coupon');
            }
        }

        return $this->createGuestCart();
    }

    public function token(Request $request): ?string
    {
        $token = (string) $request->header('X-Cart-Token', '');

        // Strict shape: a token is 64 hex characters. Anything else is ignored rather than queried.
        return preg_match('/^[a-f0-9]{64}$/i', $token) === 1 ? strtolower($token) : null;
    }

    public function createGuestCart(): Cart
    {
        $cart = new Cart;

        // 32 random bytes as hex: exactly 64 characters and nothing but [0-9a-f], which is the
        // shape `token()` accepts. Generated with random_bytes, so it is not guessable.
        $cart->token = bin2hex(random_bytes(32));
        $cart->status = Cart::STATUS_ACTIVE;
        $cart->expires_at = now()->addHours((int) config('shop.cart.guest_ttl_hours'));
        $cart->save();

        return $cart->load('items.product', 'coupon');
    }

    /**
     * The signed-in shopper's cart. A guest cart handed over at login is merged into it, so the
     * basket survives registration — and the guest token is then retired.
     */
    private function forUser(User $user, ?string $guestToken): Cart
    {
        $cart = Cart::query()
            ->active()
            ->where('user_id', $user->getKey())
            ->first();

        if ($cart === null) {
            $cart = new Cart;

            $cart->user_id = $user->getKey();
            $cart->status = Cart::STATUS_ACTIVE;
            $cart->save();
        }

        if ($guestToken !== null) {
            $guest = Cart::query()
                ->active()
                ->whereNull('user_id')
                ->where('token', $guestToken)
                ->first();

            if ($guest !== null && $guest->getKey() !== $cart->getKey()) {
                $this->merge($cart, $guest);
            }
        }

        return $cart->fresh(['items.product', 'coupon']) ?? $cart;
    }

    /**
     * Adds a guest cart's lines to the account's cart, never exceeding stock, then discards the
     * guest cart (its token stops working, which is what makes the merge safe to repeat).
     */
    private function merge(Cart $into, Cart $from): void
    {
        DB::transaction(function () use ($into, $from): void {
            $from->load('items.product');

            foreach ($from->items as $item) {
                if ($item->product === null) {
                    continue;
                }

                $this->addItem($into, $item->product, (int) $item->quantity);
            }

            $from->items()->delete();
            $from->status = Cart::STATUS_CONVERTED;
            $from->token = null;
            $from->save();
        });
    }

    /**
     * @throws ValidationException
     */
    public function addItem(Cart $cart, Product $product, int $quantity): CartItem
    {
        if ($quantity < 1) {
            throw ValidationException::withMessages(['quantity' => ['Quantity must be at least 1.']]);
        }

        $line = $cart->items()->where('product_id', $product->getKey())->first();
        $requested = $quantity + (int) ($line?->quantity ?? 0);

        $this->assertQuantityIsSellable($product, $requested);

        if ($line === null) {
            $line = new CartItem;

            $line->cart_id = $cart->getKey();
            $line->product_id = $product->getKey();
        }

        $line->quantity = $requested;
        // The price the shopper is looking at; checkout re-reads the live price and refuses to
        // proceed if it moved (see CheckoutService).
        $line->unit_price = (int) $product->price;
        $line->save();

        return $line;
    }

    /**
     * @throws ValidationException
     */
    public function updateQuantity(Cart $cart, Product $product, int $quantity): ?CartItem
    {
        $line = $cart->items()->where('product_id', $product->getKey())->firstOrFail();

        if ($quantity < 1) {
            $line->delete();

            return null;
        }

        $this->assertQuantityIsSellable($product, $quantity);

        $line->quantity = $quantity;
        $line->unit_price = (int) $product->price;
        $line->save();

        return $line;
    }

    public function removeItem(Cart $cart, Product $product): void
    {
        $cart->items()->where('product_id', $product->getKey())->delete();
    }

    /**
     * @throws CouponNotApplicableException
     */
    public function applyCoupon(Cart $cart, string $code, ?User $user): Coupon
    {
        $cart->load('items.product');

        $coupon = $this->coupons->findUsable($code, $this->subtotalOf($cart->items), $user);

        $cart->coupon_id = $coupon->getKey();
        $cart->save();

        $this->audit->log('cart.coupon_applied', $cart, ['coupon' => $coupon->code], $user);

        return $coupon;
    }

    public function removeCoupon(Cart $cart): void
    {
        $this->coupons->detach($cart);
    }

    public function clear(Cart $cart): void
    {
        $cart->items()->delete();
        $this->coupons->detach($cart);
    }

    /**
     * The only place a cart total is produced. Read-only: it never writes, so rendering a cart
     * cannot change it.
     */
    public function totals(Cart $cart): CartTotals
    {
        $cart->loadMissing('items.product', 'coupon');

        return $this->totalsForLines(
            $cart->items->map(fn (CartItem $item): array => [
                'unit_price' => (int) $item->unit_price,
                'quantity' => (int) $item->quantity,
            ]),
            $cart->coupon,
        );
    }

    /**
     * @param  Collection<int, array{unit_price: int, quantity: int}>  $lines
     */
    public function totalsForLines(Collection $lines, ?Coupon $coupon): CartTotals
    {
        $subtotal = $lines->sum(fn (array $line): int => (int) $line['unit_price'] * (int) $line['quantity']);
        $itemsCount = (int) $lines->sum(fn (array $line): int => (int) $line['quantity']);

        $discount = $coupon !== null && $subtotal > 0 ? $coupon->discountFor($subtotal) : 0;
        $shipping = $this->shippingFor($subtotal - $discount, $itemsCount);
        $tax = intdiv(($subtotal - $discount) * (int) config('shop.tax.rate_percent'), 100);

        return new CartTotals(
            subtotal: $subtotal,
            discountTotal: $discount,
            shippingTotal: $shipping,
            taxTotal: $tax,
            grandTotal: max(0, $subtotal - $discount + $shipping + $tax),
            itemsCount: $itemsCount,
            coupon: $coupon,
        );
    }

    private function shippingFor(int $payable, int $itemsCount): int
    {
        if ($itemsCount === 0) {
            return 0;
        }

        return $payable >= (int) config('shop.shipping.free_threshold')
            ? 0
            : (int) config('shop.shipping.flat_rate');
    }

    private function subtotalOf(Collection $items): int
    {
        return (int) $items->sum(fn (CartItem $item): int => (int) $item->unit_price * (int) $item->quantity);
    }

    /**
     * @throws ValidationException
     */
    private function assertQuantityIsSellable(Product $product, int $quantity): void
    {
        $max = (int) config('shop.cart.max_quantity_per_line');

        if ($quantity > $max) {
            throw ValidationException::withMessages([
                'quantity' => ["The maximum quantity for one item is {$max}."],
            ]);
        }

        if ($quantity > $product->stock_quantity) {
            throw ValidationException::withMessages([
                'quantity' => ['The requested quantity is not available.'],
            ]);
        }

        Money::assertNonNegative((int) $product->price);
    }
}
