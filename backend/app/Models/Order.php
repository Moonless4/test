<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * An order.
 *
 * Fillable is deliberately almost empty: an order is built by App\Services\CheckoutService from
 * locked catalogue prices and the authenticated request, never from a request payload. If a
 * controller ever tried `Order::create($request->validated())`, the strict model mode would throw
 * instead of quietly writing whatever the client sent.
 *
 * `access_token` is the guest's proof of ownership for the order detail endpoint. It is generated
 * server-side, shown once, and never appears in a collection response.
 */
#[Fillable(['note'])]
class Order extends Model
{
    /** @use HasFactory<\Database\Factories\OrderFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'status' => OrderStatus::class,
            'payment_status' => PaymentStatus::class,
            'subtotal' => 'integer',
            'discount_total' => 'integer',
            'shipping_total' => 'integer',
            'tax_total' => 'integer',
            'grand_total' => 'integer',
            'items_count' => 'integer',
            'placed_at' => 'datetime',
            'paid_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function coupon(): BelongsTo
    {
        return $this->belongsTo(Coupon::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class);
    }

    public function statusHistories(): HasMany
    {
        return $this->hasMany(OrderStatusHistory::class)->orderBy('created_at');
    }

    public function scopePaid(Builder $query): Builder
    {
        return $query->whereIn('status', [
            OrderStatus::Paid,
            OrderStatus::Processing,
            OrderStatus::Shipped,
            OrderStatus::Delivered,
        ]);
    }

    /**
     * Ownership test used by OrderPolicy and by the guest order endpoint. Compared with
     * hash_equals so the access token cannot be discovered byte by byte through timing.
     */
    public function isAccessibleWith(?int $userId, ?string $accessToken): bool
    {
        if ($userId !== null && $this->user_id === $userId) {
            return true;
        }

        return $accessToken !== null
            && $this->access_token !== null
            && hash_equals($this->access_token, $accessToken);
    }

    public function markPaid(): void
    {
        $this->payment_status = PaymentStatus::Succeeded;
        $this->paid_at ??= now();
        $this->save();
    }
}
