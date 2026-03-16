<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TalentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class TalentProfileController extends Controller
{
    public function show(Request $request): JsonResponse
    {
        $profile = $request->user()->talentProfile;

        if (! $profile) {
            return response()->json([
                'message' => 'Talent profile not found.',
            ], 404);
        }

        return response()->json($profile->load('portfolioItems'));
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureTalentRole($request);

        if ($request->user()->talentProfile) {
            return response()->json([
                'message' => 'Talent profile already exists. Use update instead.',
            ], 409);
        }

        $validated = $this->validateProfile($request);

        $profile = TalentProfile::query()->create([
            ...$validated,
            'user_id' => $request->user()->id,
        ]);

        return response()->json($profile, 201);
    }

    public function update(Request $request): JsonResponse
    {
        $this->ensureTalentRole($request);

        $profile = $request->user()->talentProfile;

        if (! $profile) {
            return response()->json([
                'message' => 'Talent profile not found.',
            ], 404);
        }

        $validated = $this->validateProfile($request);

        $profile->update($validated);

        return response()->json($profile->fresh());
    }

    private function validateProfile(Request $request): array
    {
        return $request->validate([
            'stage_name' => ['required', 'string', 'max:255'],
            'category' => ['required', Rule::in(TalentProfile::CATEGORIES)],
            'city' => ['required', 'string', 'max:120'],
            'age' => ['nullable', 'integer', 'min:16', 'max:85'],
            'bio' => ['required', 'string', 'max:1200'],
            'day_rate' => ['required', 'numeric', 'min:0'],
            'session_rate' => ['required', 'numeric', 'min:0'],
            'availability_text' => ['required', 'string', 'max:255'],
            'profile_image' => ['required', 'url', 'max:2048'],
            'cover_image' => ['nullable', 'url', 'max:2048'],
            'is_featured' => ['sometimes', 'boolean'],
        ]);
    }

    private function ensureTalentRole(Request $request): void
    {
        abort_if(! in_array($request->user()->role, ['talent', 'admin'], true), 403, 'Only talent users can manage this profile.');
    }
}

