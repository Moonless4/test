<?php

namespace Database\Factories;

use App\Models\Post;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Post>
 */
class PostFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'slug' => 'post-'.$this->faker->unique()->word(),
            'title' => $this->faker->sentence(4),
            'excerpt' => $this->faker->sentence(),
            'body' => $this->faker->paragraphs(2, true),
            'status' => Post::STATUS_PUBLISHED,
            'published_at' => now()->subDay(),
            'tags' => ['راهنما'],
        ];
    }

    public function draft(): static
    {
        return $this->state(fn (): array => ['status' => Post::STATUS_DRAFT, 'published_at' => null]);
    }
}
