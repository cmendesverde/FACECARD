<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PortfolioController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $talentProfile = $request->user()->talentProfile;

        if (! $talentProfile) {
            return response()->json([
                'message' => 'Perfil no disponible.',
            ], 404);
        }

        return response()->json($talentProfile->portfolioItems);
    }

    public function store(Request $request): JsonResponse
    {
        $talentProfile = $request->user()->talentProfile;

        if (! $talentProfile) {
            return response()->json([
                'message' => 'Perfil no disponible.',
            ], 404);
        }

        $validated = $request->validate([
            'image_url' => ['required', 'url', 'max:2048'],
            'title' => ['nullable', 'string', 'max:255'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $item = $talentProfile->portfolioItems()->create([
            'image_url' => $validated['image_url'],
            'title' => $validated['title'] ?? null,
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json($item, 201);
    }

    public function destroy(Request $request, int $id): JsonResponse
    {
        $talentProfile = $request->user()->talentProfile;

        if (! $talentProfile) {
            return response()->json([
                'message' => 'Perfil no disponible.',
            ], 404);
        }

        $item = $talentProfile->portfolioItems()->findOrFail($id);
        $item->delete();

        return response()->json([
            'message' => 'Item del portfolio eliminado.',
        ]);
    }
}

