<?php

namespace App\Http\Resources;

use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A discount code.
 *
 * `used_count` is exposed because an operator has to see how close a limited code is to its cap;
 * `value` means percent or Toman depending on `type`, exactly as the column does, so nothing here
 * invents a second interpretation of the number.
 *
 * @mixin Coupon
 */
class CouponResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'code' => $this->code,
            'type' => $this->type?->value ?? $this->type,
            'value' => $this->value,
            'min_subtotal' => $this->min_subtotal,
            'max_discount' => $this->max_discount,
            'usage_limit' => $this->usage_limit,
            'usage_limit_per_user' => $this->usage_limit_per_user,
            'used_count' => $this->used_count,
            'starts_at' => $this->starts_at?->toIso8601String(),
            'ends_at' => $this->ends_at?->toIso8601String(),
            'is_active' => (bool) $this->is_active,
        ];
    }
}
