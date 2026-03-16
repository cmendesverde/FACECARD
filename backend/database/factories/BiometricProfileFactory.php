<?php

namespace Database\Factories;

use App\Models\BiometricProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<BiometricProfile>
 */
class BiometricProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'face_reference' => hash('sha256', Str::random(64)),
            'verified_at' => fake()->optional(0.7)->dateTimeBetween('-8 months', 'now'),
        ];
    }
}
