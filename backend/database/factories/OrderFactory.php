<?php

namespace Database\Factories;

use App\Models\Order;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * Orders for tests that only need one to exist (access rules, listing). The checkout path itself
 * is exercised through the real endpoint, never by fabricating an order.
 *
 * @extends Factory<Order>
 */
class OrderFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'number' => 'MD-'.now()->format('ymd').'-'.Str::upper(Str::random(6)),
            'access_token' => bin2hex(random_bytes(32)),
            'status' => 'pending_payment',
            'payment_status' => 'pending',
            'currency' => 'IRT',
            'subtotal' => 1_000_000,
            'discount_total' => 0,
            'shipping_total' => 45_000,
            'tax_total' => 0,
            'grand_total' => 1_045_000,
            'items_count' => 1,
            'customer_name' => 'مشتری تست',
            'customer_email' => 'customer@example.com',
            'customer_phone' => '09121234567',
            'shipping_province' => 'تهران',
            'shipping_city' => 'تهران',
            'shipping_postal_code' => '1234567890',
            'shipping_line1' => 'خیابان تست',
            'placed_at' => now(),
        ];
    }

    public function guest(): static
    {
        return $this->state(fn (): array => ['user_id' => null]);
    }
}
