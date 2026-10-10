<?php

namespace Database\Factories;

use App\Models\Setting;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Setting>
 */
class SettingFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'key' => 'store.'.$this->faker->unique()->word(),
            'value' => $this->faker->word(),
            'type' => 'string',
            'group' => 'general',
            'is_public' => true,
        ];
    }

    public function internal(): static
    {
        return $this->state(fn (): array => ['is_public' => false]);
    }
}
