<?php

namespace Database\Factories;

use App\Models\Page;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Page>
 */
class PageFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => 'page-'.$this->faker->unique()->word(),
            'title' => $this->faker->sentence(3),
            'body' => $this->faker->paragraph(),
            'status' => Page::STATUS_PUBLISHED,
            'published_at' => now()->subDay(),
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['status' => Page::STATUS_DRAFT, 'published_at' => null]);
    }

    public function scheduled(): static
    {
        return $this->state(fn (): array => [
            'status' => Page::STATUS_PUBLISHED,
            'published_at' => now()->addWeek(),
        ]);
    }
}
