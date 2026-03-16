<?php

namespace Database\Factories;

use App\Models\PortfolioItem;
use App\Models\TalentProfile;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<PortfolioItem>
 */
class PortfolioItemFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $seed = fake()->numberBetween(1, 9999);

        return [
            'talent_profile_id' => TalentProfile::factory(),
            'image_url' => "https://loremflickr.com/1200/1200/fashion,editorial,portrait?lock={$seed}",
            'title' => fake()->randomElement([
                'Campaign Portrait',
                'Studio Story',
                'Editorial Cut',
                'Lookbook Session',
            ]),
            'sort_order' => fake()->numberBetween(1, 8),
        ];
    }
}

