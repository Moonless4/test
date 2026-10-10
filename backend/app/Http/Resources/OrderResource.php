<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * An order.
 *
 * Two things are protected here:
 *
 *  - `access_token` — the guest's proof of ownership — is emitted **only** by the checkout
 *    response, and even then only when the controller explicitly asks for it. It never appears in
 *    a list.
 *  - Payment rows expose status, amount and a masked card number; `authority` and the gateway's
 *    raw metadata stay server-side.
 *
 * @mixin Order
 */
class OrderResource extends JsonResource
{
    private bool $revealAccessToken = false;

    /** Only the checkout response calls this, and only for the order that was just created. */
    public function withAccessToken(): static
    {
        $this->revealAccessToken = true;

        return $this;
    }

    public function toArray(Request $request): array
    {
        return [
            'number' => $this->number,
            'status' => $this->status->value,
            'payment_status' => $this->payment_status->value,
            'currency' => $this->currency,
            'subtotal' => $this->subtotal,
            'discount_total' => $this->discount_total,
            'shipping_total' => $this->shipping_total,
            'tax_total' => $this->tax_total,
            'grand_total' => $this->grand_total,
            'items_count' => $this->items_count,
            'customer' => [
                'name' => $this->customer_name,
                'email' => $this->customer_email,
                'phone' => $this->customer_phone,
            ],
            'shipping' => [
                'province' => $this->shipping_province,
                'city' => $this->shipping_city,
                'postal_code' => $this->shipping_postal_code,
                'line1' => $this->shipping_line1,
                'line2' => $this->shipping_line2,
            ],
            'note' => $this->note,
            'items' => OrderItemResource::collection($this->whenLoaded('items')),
            'payments' => PaymentResource::collection($this->whenLoaded('payments')),
            'history' => OrderStatusHistoryResource::collection($this->whenLoaded('statusHistories')),
            'placed_at' => $this->placed_at?->toIso8601String(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'access_token' => $this->when($this->revealAccessToken, fn () => $this->access_token),
        ];
    }
}
