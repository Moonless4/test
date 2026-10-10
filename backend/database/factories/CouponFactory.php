<?php

namespace Database\Factories;

use App\Enums\CouponType;
use App\Models\Coupon;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Coupon>
 */
class CouponFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'code' => 'TEST'.Str::upper(Str::random(6)),
            'type' => CouponType::Percent,
            'value' => 10,
            'min_subtotal' => 0,
            'max_discount' => null,
            'usage_limit' => null,
            'usage_limit_per_user' => null,
            'used_count' => 0,
            'starts_at' => now()->subDay(),
            'ends_at' => now()->addMonth(),
            'is_active' => true,
        ];
    }

    public function percent(int $percent, ?int $maxDiscount = null): static
    {
        return $this->state(fn (): array => [
            'type' => CouponType::Percent,
            'value' => $percent,
            'max_discount' => $maxDiscount,
        ]);
    }

    public function fixed(int $amount): static
    {
        return $this->state(fn (): array => ['type' => CouponType::Fixed, 'value' => $amount]);
    }

    public function expired(): static
    {
        return $this->state(fn (): array => ['ends_at' => now()->subDay()]);
    }

    public function inactive(): static
    {
        return $this->state(fn (): array => ['is_active' => false]);
    }
}
