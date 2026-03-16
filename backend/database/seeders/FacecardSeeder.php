<?php

namespace Database\Seeders;

use App\Models\BiometricProfile;
use App\Models\Booking;
use App\Models\TalentProfile;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\File;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class FacecardSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $password = Hash::make('password');

        User::query()->updateOrCreate(
            ['email' => 'admin@facecard.local'],
            [
                'name' => 'Facecard Admin',
                'password' => $password,
                'role' => 'admin',
                'city' => 'Madrid',
                'email_verified_at' => now(),
            ]
        );

        $clientProfiles = [
            ['name' => 'Lucia Ramos', 'city' => 'Madrid'],
            ['name' => 'Carlos Vela', 'city' => 'Barcelona'],
            ['name' => 'Paula Crespo', 'city' => 'Valencia'],
            ['name' => 'Miguel Lobo', 'city' => 'Sevilla'],
            ['name' => 'Nora Alba', 'city' => 'Madrid'],
            ['name' => 'Daniel Mora', 'city' => 'Barcelona'],
        ];

        $clients = collect($clientProfiles)->map(function (array $client, int $index) use ($password) {
            return User::query()->updateOrCreate(
                ['email' => 'client'.($index + 1).'@facecard.local'],
                [
                    'name' => $client['name'],
                    'password' => $password,
                    'role' => 'client',
                    'city' => $client['city'],
                    'email_verified_at' => now(),
                ]
            );
        });

        $buildQuery = static function (array $tags): string {
            $normalized = [];

            foreach ($tags as $tag) {
                $value = strtolower(trim((string) $tag));

                if ($value === '') {
                    continue;
                }

                $value = str_replace(' ', '-', $value);

                if (! in_array($value, $normalized, true)) {
                    $normalized[] = $value;
                }
            }

            return implode(',', $normalized);
        };

        $appUrl = rtrim((string) config('app.url', 'http://127.0.0.1:8000'), '/');
        $talentMediaRoot = public_path('media/talents');

        $resolveLocalTalentMedia = static function (string $stageName) use ($appUrl, $talentMediaRoot): array {
            $slug = Str::slug($stageName);
            $folderPath = $talentMediaRoot.DIRECTORY_SEPARATOR.$slug;

            if (! File::isDirectory($folderPath)) {
                return [];
            }

            return collect(File::files($folderPath))
                ->filter(function (\SplFileInfo $file): bool {
                    return in_array(strtolower($file->getExtension()), ['jpg', 'jpeg', 'png', 'webp', 'jfif'], true);
                })
                ->sortBy(fn (\SplFileInfo $file) => strtolower($file->getFilename()))
                ->values()
                ->map(fn (\SplFileInfo $file) => $appUrl.'/media/talents/'.$slug.'/'.rawurlencode($file->getFilename()))
                ->all();
        };

        $categoryProfileTags = [
            'model' => ['fashion', 'editorial', 'model', 'studio', 'portrait', 'high contrast', 'black and white'],
            'photographer' => ['fashion', 'photographer', 'portrait', 'camera', 'studio', 'editorial'],
            'makeup artist' => ['makeup artist', 'beauty', 'editorial', 'close up', 'studio portrait'],
            'tattoo artist' => ['tattoo artist', 'portrait', 'studio', 'blackwork', 'editorial'],
            'creative director' => ['creative director', 'fashion', 'editorial', 'portrait', 'luxury campaign'],
            'stylist' => ['fashion stylist', 'editorial', 'portrait', 'wardrobe', 'runway'],
        ];

        $categoryCoverTags = [
            'model' => ['fashion campaign', 'editorial set', 'studio', 'monochrome'],
            'photographer' => ['fashion set', 'studio lights', 'editorial campaign'],
            'makeup artist' => ['beauty editorial', 'makeup set', 'fashion campaign'],
            'tattoo artist' => ['tattoo studio', 'creative campaign', 'editorial portrait'],
            'creative director' => ['fashion campaign', 'art direction', 'editorial concept'],
            'stylist' => ['fashion campaign', 'styling set', 'editorial wardrobe'],
        ];

        $defaultPortfolioTagSets = [
            ['fashion', 'editorial', 'portrait'],
            ['studio', 'portrait', 'high contrast'],
            ['creative', 'photography', 'fashion'],
            ['editorial', 'beauty', 'portrait'],
            ['fashion', 'campaign', 'monochrome'],
            ['studio', 'black and white', 'portrait'],
        ];

        $categoryPortfolioTagSets = [
            'model' => [
                ['fashion', 'editorial', 'model', 'black and white'],
                ['studio', 'portrait', 'model', 'high contrast'],
                ['runway', 'model', 'fashion'],
                ['beauty', 'editorial', 'model'],
                ['campaign', 'model', 'monochrome'],
                ['luxury', 'fashion', 'portrait'],
            ],
            'photographer' => [
                ['photographer', 'portrait', 'camera', 'studio'],
                ['fashion set', 'behind the scenes', 'photographer'],
                ['editorial lighting', 'photographer', 'portrait'],
                ['camera', 'creative', 'portrait'],
                ['studio photographer', 'monochrome'],
                ['campaign', 'photographer', 'fashion'],
            ],
            'makeup artist' => [
                ['makeup artist', 'beauty', 'portrait'],
                ['editorial makeup', 'close up', 'beauty'],
                ['fashion beauty', 'skin texture'],
                ['backstage', 'makeup artist', 'fashion'],
                ['studio beauty', 'monochrome'],
                ['luxury makeup', 'campaign'],
            ],
            'tattoo artist' => [
                ['tattoo artist', 'portrait', 'studio'],
                ['blackwork tattoo', 'close up'],
                ['fine line tattoo', 'artist'],
                ['editorial tattoo', 'portrait'],
                ['body art', 'monochrome'],
                ['creative tattoo', 'studio'],
            ],
            'creative director' => [
                ['creative director', 'fashion', 'portrait'],
                ['art director', 'editorial', 'studio'],
                ['campaign direction', 'creative'],
                ['storyboard', 'fashion', 'creative'],
                ['monochrome portrait', 'creative director'],
                ['luxury brand', 'creative'],
            ],
            'stylist' => [
                ['fashion stylist', 'portrait'],
                ['wardrobe stylist', 'editorial'],
                ['styling', 'lookbook', 'fashion'],
                ['backstage stylist', 'runway'],
                ['monochrome stylist', 'studio'],
                ['luxury styling', 'campaign'],
            ],
        ];

        $talentData = [
            ['name' => 'Sofia Martin', 'stage_name' => 'Sofia Martin', 'gender' => 'female', 'category' => 'model', 'city' => 'Madrid', 'bio' => 'Editorial model focused on luxury fashion campaigns and elegant studio work.', 'day_rate' => 1200, 'session_rate' => 640],
            ['name' => 'Leo Navarro', 'stage_name' => 'Leo Navarro', 'gender' => 'male', 'category' => 'model', 'city' => 'Barcelona', 'bio' => 'Runway and lookbook model with a clean, modern visual identity.', 'day_rate' => 980, 'session_rate' => 520],
            ['name' => 'Alma Roca', 'stage_name' => 'Alma Roca', 'gender' => 'female', 'category' => 'model', 'city' => 'Valencia', 'bio' => 'Studio and beauty model known for high-contrast editorial portraits.', 'day_rate' => 1040, 'session_rate' => 560],
            ['name' => 'Bruno Vidal', 'stage_name' => 'Bruno Vidal', 'gender' => 'male', 'category' => 'model', 'city' => 'Sevilla', 'bio' => 'Menswear and campaign model with a strong fashion-week presence.', 'day_rate' => 990, 'session_rate' => 530],

            ['name' => 'Carla Duarte', 'stage_name' => 'Carla Duarte', 'gender' => 'female', 'category' => 'photographer', 'city' => 'Madrid', 'bio' => 'Fashion photographer shaping minimal and high-contrast editorial narratives.', 'day_rate' => 1450, 'session_rate' => 760],
            ['name' => 'Adrian Vega', 'stage_name' => 'Adrian Vega', 'gender' => 'male', 'category' => 'photographer', 'city' => 'Valencia', 'bio' => 'Portrait and campaign photographer specialized in premium studio lighting.', 'day_rate' => 1320, 'session_rate' => 680],
            ['name' => 'Vera Mendez', 'stage_name' => 'Vera Mendez', 'gender' => 'female', 'category' => 'photographer', 'city' => 'Barcelona', 'bio' => 'Photographer for luxury editorials with refined visual compositions.', 'day_rate' => 1490, 'session_rate' => 790],
            ['name' => 'Pablo Estevez', 'stage_name' => 'Pablo Estevez', 'gender' => 'male', 'category' => 'photographer', 'city' => 'Sevilla', 'bio' => 'Campaign specialist combining dramatic framing and polished color direction.', 'day_rate' => 1370, 'session_rate' => 710],

            ['name' => 'Marta Soler', 'stage_name' => 'Marta Soler', 'gender' => 'female', 'category' => 'makeup artist', 'city' => 'Barcelona', 'bio' => 'Beauty artist creating clean editorial skin and bold runway accents.', 'day_rate' => 840, 'session_rate' => 430],
            ['name' => 'Irene Costa', 'stage_name' => 'Irene Costa', 'gender' => 'female', 'category' => 'makeup artist', 'city' => 'Sevilla', 'bio' => 'Makeup specialist for magazine covers and luxury bridal editorials.', 'day_rate' => 790, 'session_rate' => 410],
            ['name' => 'Sara Beltran', 'stage_name' => 'Sara Beltran', 'gender' => 'female', 'category' => 'makeup artist', 'city' => 'Madrid', 'bio' => 'Editorial makeup artist focused on skin texture and precision beauty looks.', 'day_rate' => 860, 'session_rate' => 450],
            ['name' => 'Hugo Ferran', 'stage_name' => 'Hugo Ferran', 'gender' => 'male', 'category' => 'makeup artist', 'city' => 'Valencia', 'bio' => 'Runway makeup artist with sharp monochrome and fashion-forward execution.', 'day_rate' => 820, 'session_rate' => 420],

            ['name' => 'Tomas Herrera', 'stage_name' => 'Tomas Herrera', 'gender' => 'male', 'category' => 'tattoo artist', 'city' => 'Valencia', 'bio' => 'Tattoo artist blending fine-line precision with avant-garde visual concepts.', 'day_rate' => 930, 'session_rate' => 500],
            ['name' => 'Nadia Rios', 'stage_name' => 'Nadia Rios', 'gender' => 'female', 'category' => 'tattoo artist', 'city' => 'Madrid', 'bio' => 'Blackwork and minimal tattoo sessions tailored for creative campaigns.', 'day_rate' => 900, 'session_rate' => 470],
            ['name' => 'Ruben Pardo', 'stage_name' => 'Ruben Pardo', 'gender' => 'male', 'category' => 'tattoo artist', 'city' => 'Barcelona', 'bio' => 'Tattoo specialist in geometric and editorial body art direction.', 'day_rate' => 960, 'session_rate' => 520],
            ['name' => 'Lidia Franco', 'stage_name' => 'Lidia Franco', 'gender' => 'female', 'category' => 'tattoo artist', 'city' => 'Sevilla', 'bio' => 'Fine-line tattoo artist with premium private sessions for creative projects.', 'day_rate' => 920, 'session_rate' => 490],

            ['name' => 'Diego Luna', 'stage_name' => 'Diego Luna', 'gender' => 'male', 'category' => 'creative director', 'city' => 'Barcelona', 'bio' => 'Creative director orchestrating premium campaigns and visual storytelling.', 'day_rate' => 1700, 'session_rate' => 920],
            ['name' => 'Julia Ferrer', 'stage_name' => 'Julia Ferrer', 'gender' => 'female', 'category' => 'creative director', 'city' => 'Sevilla', 'bio' => 'Editorial director balancing brand elegance with bold artistic execution.', 'day_rate' => 1580, 'session_rate' => 850],
            ['name' => 'Alex Montero', 'stage_name' => 'Alex Montero', 'gender' => 'male', 'category' => 'creative director', 'city' => 'Madrid', 'bio' => 'Creative lead for luxury fashion identities and campaign systems.', 'day_rate' => 1760, 'session_rate' => 960],
            ['name' => 'Cloe Salas', 'stage_name' => 'Cloe Salas', 'gender' => 'female', 'category' => 'creative director', 'city' => 'Valencia', 'bio' => 'Visual strategist focused on minimal storytelling and fashion direction.', 'day_rate' => 1620, 'session_rate' => 880],

            ['name' => 'Elena Prado', 'stage_name' => 'Elena Prado', 'gender' => 'female', 'category' => 'stylist', 'city' => 'Valencia', 'bio' => 'Wardrobe stylist focused on timeless palettes and premium silhouette curation.', 'day_rate' => 880, 'session_rate' => 460],
            ['name' => 'Marco Gil', 'stage_name' => 'Marco Gil', 'gender' => 'male', 'category' => 'stylist', 'city' => 'Madrid', 'bio' => 'Fashion stylist with a sharp editorial eye and campaign-ready looks.', 'day_rate' => 910, 'session_rate' => 480],
            ['name' => 'Paula Neri', 'stage_name' => 'Paula Neri', 'gender' => 'female', 'category' => 'stylist', 'city' => 'Barcelona', 'bio' => 'Stylist blending classic tailoring with contemporary editorial narratives.', 'day_rate' => 940, 'session_rate' => 500],
            ['name' => 'Javier Quintero', 'stage_name' => 'Javier Quintero', 'gender' => 'male', 'category' => 'stylist', 'city' => 'Sevilla', 'bio' => 'Campaign stylist specialized in monochrome direction and premium sets.', 'day_rate' => 900, 'session_rate' => 470],
        ];

        $talentProfiles = collect($talentData)->map(function (array $talent, int $index) use (
            $password,
            $buildQuery,
            $categoryProfileTags,
            $categoryCoverTags,
            $categoryPortfolioTagSets,
            $defaultPortfolioTagSets,
            $resolveLocalTalentMedia
        ) {
            $user = User::query()->updateOrCreate(
                ['email' => 'talent'.($index + 1).'@facecard.local'],
                [
                    'name' => $talent['name'],
                    'password' => $password,
                    'role' => 'talent',
                    'city' => $talent['city'],
                    'email_verified_at' => now(),
                ]
            );

            $baseSeed = ($index + 1) * 100;
            $genderTags = $talent['gender'] === 'female' ? ['woman', 'female'] : ['man', 'male'];
            $profileTags = array_merge($categoryProfileTags[$talent['category']] ?? ['fashion', 'editorial', 'portrait'], $genderTags);
            $coverTags = array_merge($categoryCoverTags[$talent['category']] ?? ['fashion campaign', 'editorial set'], $genderTags);

            $localImageUrls = $resolveLocalTalentMedia($talent['stage_name']);
            $profileFallback = 'https://source.unsplash.com/1200x1600/?'.$buildQuery($profileTags).'&sig='.$baseSeed;
            $coverFallback = 'https://source.unsplash.com/1600x900/?'.$buildQuery($coverTags).'&sig='.($baseSeed + 1);
            $profileImage = $localImageUrls[0] ?? $profileFallback;
            $coverImage = $localImageUrls[1] ?? $profileImage ?? $coverFallback;

            $profile = TalentProfile::query()->updateOrCreate(
                ['user_id' => $user->id],
                [
                    'stage_name' => $talent['stage_name'],
                    'category' => $talent['category'],
                    'city' => $talent['city'],
                    'age' => 20 + ($index % 14),
                    'bio' => $talent['bio'],
                    'day_rate' => $talent['day_rate'],
                    'session_rate' => $talent['session_rate'],
                    'availability_text' => 'Available for premium bookings with at least 72h notice.',
                    'profile_image' => $profileImage,
                    'cover_image' => $coverImage,
                    'is_featured' => true,
                ]
            );

            $portfolioTagSets = $categoryPortfolioTagSets[$talent['category']] ?? $defaultPortfolioTagSets;

            for ($portfolioIndex = 0; $portfolioIndex < 6; $portfolioIndex++) {
                $tagSet = $portfolioTagSets[$portfolioIndex % count($portfolioTagSets)];
                $query = $buildQuery(array_merge($tagSet, $genderTags));
                $fallbackImage = 'https://source.unsplash.com/1200x1200/?'.$query.'&sig='.($baseSeed + $portfolioIndex + 2);
                $portfolioImage = count($localImageUrls) > 0
                    ? $localImageUrls[$portfolioIndex % count($localImageUrls)]
                    : $fallbackImage;

                $profile->portfolioItems()->updateOrCreate(
                    ['sort_order' => $portfolioIndex + 1],
                    [
                        'image_url' => $portfolioImage,
                        'title' => 'Portfolio '.($portfolioIndex + 1),
                    ]
                );
            }

            if ($index % 2 === 0) {
                BiometricProfile::query()->updateOrCreate(
                    ['user_id' => $user->id],
                    [
                        'face_reference' => hash('sha256', "talent-face-{$user->id}"),
                        'verified_at' => now()->subDays($index + 3),
                    ]
                );
            }

            return $profile;
        });

        $projectTypes = [
            'Editorial Shoot',
            'Brand Campaign',
            'Lookbook Production',
            'Private Session',
            'Beauty Story',
        ];

        $statuses = Booking::STATUSES;
        $targetBookings = 28;
        $existingBookings = Booking::query()->count();

        if ($existingBookings < $targetBookings && $clients->isNotEmpty() && $talentProfiles->isNotEmpty()) {
            $toCreate = $targetBookings - $existingBookings;

            for ($i = 0; $i < $toCreate; $i++) {
                $client = $clients->random();
                $talentProfile = $talentProfiles->random();

                Booking::query()->create([
                    'client_id' => $client->id,
                    'talent_profile_id' => $talentProfile->id,
                    'project_type' => $projectTypes[array_rand($projectTypes)],
                    'event_date' => Carbon::now()->addDays(random_int(3, 110))->toDateString(),
                    'location' => $talentProfile->city,
                    'budget' => random_int(700, 6000),
                    'notes' => 'Premium booking request for campaign and portfolio delivery.',
                    'status' => $statuses[array_rand($statuses)],
                ]);
            }
        }

        foreach ($clients->take(3) as $client) {
            BiometricProfile::query()->updateOrCreate(
                ['user_id' => $client->id],
                [
                    'face_reference' => hash('sha256', "client-face-{$client->id}"),
                    'verified_at' => now()->subDays(random_int(5, 30)),
                ]
            );
        }
    }
}
