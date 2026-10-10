<?php

namespace App\Models;

use App\Enums\CouponType;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * A discount code.
 *
 * `isUsableBy()` is the single place that decides whether a code applies — the calculator and the
 * checkout both call it, so a code cannot be accepted by the cart screen and then rejected (or
 * worse, silently ignored) at checkout.
 */
#[Fillable([
    'code', 'type', 'value', 'min_subtotal', 'max_discount',
    'usage_limit', 'usage_limit_per_user', 'starts_at', 'ends_at', 'is_active',
])]
class Coupon extends Model
{
    /** @use HasFactory<\Database\Factories\CouponFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'type' => CouponType::class,
            'value' => 'integer',
            'min_subtotal' => 'integer',
            'max_discount' => 'integer',
            'usage_limit' => 'integer',
            'usage_limit_per_user' => 'integer',
            'used_count' => 'integer',
            'starts_at' => 'datetime',
            'ends_at' => 'datetime',
            'is_active' => 'boolean',
        ];
    }

    public function redemptions(): HasMany
    {
        return $this->hasMany(CouponRedemption::class);
    }

    public function scopeActive(Builder $query): Builder
    {
        return $query->where('is_active', true);
    }

    public function hasStarted(): bool
    {
        return $this->starts_at === null || $this->starts_at->isPast();
    }

    public function hasExpired(): bool
    {
        return $this->ends_at !== null && $this->ends_at->isPast();
    }

    public function isExhausted(): bool
    {
        return $this->usage_limit !== null && $this->used_count >= $this->usage_limit;
    }

    /**
     * Discount in Toman for a given subtotal. Percent coupons are capped by `max_discount`, and
     * the result can never exceed the subtotal.
     */
    public function discountFor(int $subtotal): int
    {
        if ($subtotal <= 0) {
            return 0;
        }

        $discount = match ($this->type) {
            CouponType::Percent => intdiv($subtotal * $this->value, 100),
            CouponType::Fixed => $this->value,
        };

        if ($this->max_discount !== null) {
            $discount = min($discount, $this->max_discount);
        }

        return max(0, min($discount, $subtotal));
    }
}
