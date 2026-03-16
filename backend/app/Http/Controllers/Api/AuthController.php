<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'role' => ['nullable', 'in:talent,client'],
            'city' => ['nullable', 'string', 'max:120'],
        ]);

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'],
            'role' => $validated['role'] ?? 'client',
            'city' => $validated['city'] ?? null,
        ]);

        $token = $user->createToken('facecard-token')->plainTextToken;

        return response()->json([
            'message' => 'Account created successfully.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Invalid credentials.',
            ], 422);
        }

        $token = $user->createToken('facecard-token')->plainTextToken;

        return response()->json([
            'message' => 'Login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function faceLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'scan_passed' => ['required', 'accepted'],
            'confidence' => ['nullable', 'numeric', 'between:0,1'],
        ]);

        $user = User::query()
            ->where('email', $validated['email'])
            ->whereHas('biometricProfile', function ($query) {
                $query->whereNotNull('verified_at');
            })
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'Biometric profile not available for this account.',
            ], 422);
        }

        $token = $user->createToken('facecard-token')->plainTextToken;

        return response()->json([
            'message' => 'Biometric login successful.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user->load('talentProfile'),
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        return response()->json(
            $request->user()->load('talentProfile')
        );
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Logged out successfully.',
        ]);
    }
}
