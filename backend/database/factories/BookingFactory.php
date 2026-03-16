<?php

namespace Database\Factories;

use App\Models\Booking;
use App\Models\TalentProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Booking>
 */
class BookingFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'client_id' => User::factory()->state([
                'role' => 'client',
            ]),
            'talent_profile_id' => TalentProfile::factory(),
            'project_type' => fake()->randomElement([
                'Editorial Shoot',
                'Brand Campaign',
                'Private Session',
                'Studio Production',
            ]),
            'event_date' => fake()->dateTimeBetween('+2 days', '+4 months')->format('Y-m-d'),
            'location' => fake()->randomElement(['Madrid', 'Barcelona', 'Valencia', 'Sevilla']),
            'budget' => fake()->numberBetween(600, 5000),
            'notes' => fake()->optional()->sentence(12),
            'status' => fake()->randomElement(Booking::STATUSES),
        ];
    }
}
