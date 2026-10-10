<?php

namespace Database\Factories;

use App\Models\Faq;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Faq>
 */
class FaqFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'group' => 'orders',
            'question' => 'سوال '.$this->faker->unique()->word().'؟',
            'answer' => $this->faker->paragraph(),
            'position' => 0,
            'is_active' => true,
        ];
    }
}
