<?php

namespace App\Support;

use App\Models\Coupon;

/**
 * The computed totals of a cart or an order, in Toman.
 *
 * A plain value object on purpose: the maths happens once in CartService and travels to the
 * resource as numbers, so no layer above it can invent a different total.
 */
final readonly class CartTotals
{
    public function __construct(
        public int $subtotal,
        public int $discountTotal,
        public int $shippingTotal,
        public int $taxTotal,
        public int $grandTotal,
        public int $itemsCount,
        public ?Coupon $coupon = null,
    ) {}

    /**
     * @return array<string, int|string|null>
     */
    public function toArray(): array
    {
        return [
            'subtotal' => $this->subtotal,
            'discount_total' => $this->discountTotal,
            'shipping_total' => $this->shippingTotal,
            'tax_total' => $this->taxTotal,
            'grand_total' => $this->grandTotal,
            'items_count' => $this->itemsCount,
            'currency' => Money::CURRENCY,
            'coupon_code' => $this->coupon?->code,
        ];
    }
}
