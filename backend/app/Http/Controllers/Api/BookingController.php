<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Booking;
use App\Models\TalentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class BookingController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Booking::query()->with([
            'client:id,name,email',
            'talentProfile.user:id,name,city',
        ]);

        if ($user->role === 'client') {
            $query->where('client_id', $user->id);
        }

        if ($user->role === 'talent') {
            $talentProfileId = $user->talentProfile?->id;

            if (! $talentProfileId) {
                return response()->json([]);
            }

            $query->where('talent_profile_id', $talentProfileId);
        }

        $bookings = $query
            ->latest('event_date')
            ->latest('created_at')
            ->get();

        return response()->json($bookings);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'talent_profile_id' => ['required', 'exists:talent_profiles,id'],
            'project_type' => ['required', 'string', 'max:255'],
            'event_date' => ['required', 'date', 'after_or_equal:today'],
            'location' => ['required', 'string', 'max:255'],
            'budget' => ['required', 'numeric', 'min:0'],
            'notes' => ['nullable', 'string'],
        ]);

        $talentProfile = TalentProfile::query()->findOrFail($validated['talent_profile_id']);

        $booking = Booking::query()->create([
            'client_id' => $request->user()->id,
            'talent_profile_id' => $talentProfile->id,
            'project_type' => $validated['project_type'],
            'event_date' => $validated['event_date'],
            'location' => $validated['location'],
            'budget' => $validated['budget'],
            'notes' => $validated['notes'] ?? null,
            'status' => 'pending',
        ]);

        return response()->json($booking->load(['client:id,name,email', 'talentProfile.user:id,name']), 201);
    }

    public function updateStatus(Request $request, int $id): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(Booking::STATUSES)],
        ]);

        $booking = Booking::query()->findOrFail($id);
        $user = $request->user();

        $isAdmin = $user->role === 'admin';
        $isTalentOwner = $user->role === 'talent' && $user->talentProfile?->id === $booking->talent_profile_id;

        if (! $isAdmin && ! $isTalentOwner) {
            return response()->json([
                'message' => 'No tienes permisos para actualizar esta reserva.',
            ], 403);
        }

        $booking->update([
            'status' => $validated['status'],
        ]);

        return response()->json($booking->fresh()->load(['client:id,name,email', 'talentProfile.user:id,name']));
    }
}

