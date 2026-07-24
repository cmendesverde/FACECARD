<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\TalentProfile;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TalentController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = TalentProfile::query()
            ->with([
                'user:id,name,city',
                'portfolioItems' => fn ($portfolioQuery) => $portfolioQuery->limit(1),
            ]);

        if ($request->boolean('featured_only')) {
            $query->where('is_featured', true);
        }

        if ($search = $request->string('search')->toString()) {
            $query->where(function ($searchQuery) use ($search) {
                $searchQuery
                    ->where('stage_name', 'like', "%{$search}%")
                    ->orWhere('category', 'like', "%{$search}%")
                    ->orWhere('city', 'like', "%{$search}%")
                    ->orWhere('bio', 'like', "%{$search}%");
            });
        }

        if ($category = $request->string('category')->toString()) {
            $query->where('category', $category);
        }

        if ($city = $request->string('city')->toString()) {
            $query->where('city', $city);
        }

        if ($availability = $request->string('availability')->toString()) {
            $query->where('availability_text', 'like', "%{$availability}%");
        }

        if ($minDayRate = $request->input('min_day_rate')) {
            $query->where('day_rate', '>=', $minDayRate);
        }

        if ($maxDayRate = $request->input('max_day_rate')) {
            $query->where('day_rate', '<=', $maxDayRate);
        }

        $talents = $query
            ->orderByDesc('is_featured')
            ->orderBy('stage_name')
            ->paginate($request->integer('per_page', 12));

        return response()->json($talents);
    }

    public function show(Request $request, int $id): JsonResponse
    {
        // El email solo se expone a un admin autenticado; el recurso es público.
        $viewer = $request->user('sanctum');
        $userColumns = $viewer?->role === 'admin' ? 'id,name,email,city' : 'id,name,city';

        $talent = TalentProfile::query()
            ->with(["user:{$userColumns}", 'portfolioItems'])
            ->findOrFail($id);

        return response()->json($talent);
    }

    public function featured(): JsonResponse
    {
        $talents = TalentProfile::query()
            ->with(['user:id,name,city'])
            ->where('is_featured', true)
            ->orderBy('stage_name')
            ->limit(6)
            ->get();

        return response()->json($talents);
    }
}
