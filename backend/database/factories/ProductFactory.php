<?php

namespace Database\Factories;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Product>
 */
class ProductFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $name = 'محصول '.$this->faker->unique()->word();

        return [
            'category_id' => Category::factory(),
            'name' => $name,
            'slug' => Str::slug($name).'-'.Str::lower(Str::random(6)),
            'sku' => 'TST-'.Str::upper(Str::random(8)),
            'short_description' => $this->faker->sentence(),
            'description' => $this->faker->paragraph(),
            'price' => 1_000_000,
            'compare_at_price' => null,
            'stock_quantity' => 10,
            'is_active' => true,
            'is_featured' => false,
            'published_at' => now()->subDay(),
            'attributes' => ['color' => ['مشکی']],
        ];
    }

    public function discounted(int $price = 800_000, int $original = 1_000_000): static
    {
        return $this->state(fn (): array => [
            'price' => $price,
            'compare_at_price' => $original,
            'is_featured' => true,
        ]);
    }

    public function outOfStock(): static
    {
        return $this->state(fn (): array => ['stock_quantity' => 0]);
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['is_active' => false, 'published_at' => null]);
    }
}
