<?php

namespace Database\Factories;

use App\Models\Cart;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Cart>
 */
class CartFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => null,
            'token' => bin2hex(random_bytes(32)),
            'status' => Cart::STATUS_ACTIVE,
            'coupon_id' => null,
            'expires_at' => now()->addDay(),
        ];
    }

    public function forUser(\App\Models\User $user): static
    {
        return $this->state(fn (): array => ['user_id' => $user->getKey(), 'token' => null]);
    }
}
