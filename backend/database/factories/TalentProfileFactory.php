<?php

namespace Database\Factories;

use App\Models\TalentProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TalentProfile>
 */
class TalentProfileFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $category = fake()->randomElement(TalentProfile::CATEGORIES);
        $seed = fake()->unique()->numberBetween(1, 9999);

        return [
            'user_id' => User::factory()->state([
                'role' => 'talent',
            ]),
            'stage_name' => fake()->name(),
            'category' => $category,
            'city' => fake()->randomElement(['Madrid', 'Barcelona', 'Valencia', 'Sevilla']),
            'bio' => fake()->sentence(18),
            'day_rate' => fake()->numberBetween(450, 1800),
            'session_rate' => fake()->numberBetween(250, 950),
            'availability_text' => fake()->randomElement([
                'Available for editorial bookings from Monday to Thursday.',
                'Open for campaigns and private sessions during weekdays.',
                'Accepting premium bookings with two weeks notice.',
            ]),
            'profile_image' => '/media/placeholders/portrait-'.(($seed % 6) + 1).'.jpg',
            'cover_image' => '/media/placeholders/portrait-'.((($seed + 1) % 6) + 1).'.jpg',
            'is_featured' => fake()->boolean(35),
        ];
    }
}

