<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\BiometricProfile;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    private const FACE_LOGIN_MIN_CONFIDENCE = 0.82;

    private const FACE_LOGIN_MAX_DISTANCE = 0.54;

    private const FACE_LOGIN_MIN_ANTI_SPOOF = 0.65;

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
            'message' => 'Cuenta creada con exito.',
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
                'message' => 'Email o contrasena incorrectos.',
            ], 422);
        }

        $token = $user->createToken('facecard-token')->plainTextToken;

        return response()->json([
            'message' => 'Acceso correcto.',
            'token' => $token,
            'token_type' => 'Bearer',
            'user' => $user,
        ]);
    }

    public function prepareFaceLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
        ]);

        $user = User::query()
            ->with(['biometricProfile', 'talentProfile:id,user_id,profile_image'])
            ->where('email', $validated['email'])
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'No hay acceso biometrico disponible para esta cuenta.',
            ], 422);
        }

        $biometricProfile = $user->biometricProfile;
        $referenceImage = $this->resolveReferenceImage($user);
        $descriptor = $this->normalizeDescriptor($biometricProfile?->face_descriptor);

        return response()->json([
            'message' => $descriptor ? 'Perfil biometrico listo.' : 'Habilita Face ID para continuar.',
            'biometric_ready' => (bool) $biometricProfile?->verified_at,
            'descriptor_enrolled' => $descriptor !== null,
            'requires_enrollment' => $descriptor === null,
            'demo_mode_enabled' => app()->environment('local'),
            'reference_image' => $referenceImage,
            'rules' => [
                'min_confidence' => self::FACE_LOGIN_MIN_CONFIDENCE,
                'max_distance' => self::FACE_LOGIN_MAX_DISTANCE,
                'min_anti_spoof_score' => self::FACE_LOGIN_MIN_ANTI_SPOOF,
            ],
            'user' => [
                'name' => $user->name,
                'role' => $user->role,
                'city' => $user->city,
            ],
        ]);
    }

    public function enrollFace(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
            'scan_passed' => ['required', 'accepted'],
            'liveness_passed' => ['required', 'accepted'],
            'confidence' => ['required', 'numeric', 'between:0,1'],
            'anti_spoof_score' => ['required', 'numeric', 'between:0,1'],
            'face_descriptor' => ['required', 'array', 'size:128'],
            'face_descriptor.*' => ['required', 'numeric', 'between:-1,1'],
        ]);

        $user = User::query()
            ->with(['biometricProfile', 'talentProfile:id,user_id,profile_image'])
            ->where('email', $validated['email'])
            ->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            return response()->json([
                'message' => 'Credenciales no validas para habilitar Face ID.',
            ], 422);
        }

        if ((float) $validated['confidence'] < self::FACE_LOGIN_MIN_CONFIDENCE) {
            return response()->json([
                'message' => 'Escaneo con baja confianza. Mejora luz y encuadre.',
            ], 422);
        }

        if ((float) $validated['anti_spoof_score'] < self::FACE_LOGIN_MIN_ANTI_SPOOF) {
            return response()->json([
                'message' => 'La prueba de vida fallo. Activa Face ID de nuevo.',
            ], 422);
        }

        $descriptor = array_map(static fn ($value) => (float) $value, $validated['face_descriptor']);
        $faceReference = hash('sha256', implode('|', array_map(static fn ($value) => number_format($value, 6, '.', ''), $descriptor)));

        BiometricProfile::query()->updateOrCreate(
            ['user_id' => $user->id],
            [
                'face_reference' => $faceReference,
                'reference_image' => $this->resolveReferenceImage($user),
                'face_descriptor' => $descriptor,
                'verified_at' => now(),
            ]
        );

        return response()->json([
            'message' => 'Face ID habilitado.',
            'descriptor_enrolled' => true,
        ]);
    }

    public function faceLogin(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'scan_passed' => ['required', 'accepted'],
            'liveness_passed' => ['required', 'accepted'],
            'confidence' => ['required', 'numeric', 'between:0,1'],
            'anti_spoof_score' => ['nullable', 'numeric', 'between:0,1'],
            'demo_mode' => ['nullable', 'boolean'],
            'face_descriptor' => ['required', 'array', 'size:128'],
            'face_descriptor.*' => ['required', 'numeric', 'between:-1,1'],
        ]);

        if ((float) $validated['confidence'] < self::FACE_LOGIN_MIN_CONFIDENCE) {
            return response()->json([
                'message' => 'Escaneo con baja confianza. Intenta de nuevo.',
            ], 422);
        }

        if (
            isset($validated['anti_spoof_score'])
            && (float) $validated['anti_spoof_score'] < self::FACE_LOGIN_MIN_ANTI_SPOOF
        ) {
            return response()->json([
                'message' => 'La prueba de vida fallo. Repite el escaneo.',
            ], 422);
        }

        $user = User::query()
            ->with(['biometricProfile', 'talentProfile:id,user_id,profile_image'])
            ->where('email', $validated['email'])
            ->first();

        if (! $user) {
            return response()->json([
                'message' => 'No hay acceso biometrico disponible para esta cuenta.',
            ], 422);
        }

        if ($this->isFaceDemoModeEnabled($request, $validated)) {
            $token = $user->createToken('facecard-token')->plainTextToken;

            return response()->json([
                'message' => 'Acceso biometrico demo correcto.',
                'token' => $token,
                'token_type' => 'Bearer',
                'demo_mode' => true,
                'user' => $user->load('talentProfile'),
            ]);
        }

        if (! $user->biometricProfile || ! $user->biometricProfile->verified_at) {
            return response()->json([
                'message' => 'No hay perfil biometrico para esta cuenta.',
            ], 422);
        }

        $storedDescriptor = $this->normalizeDescriptor($user->biometricProfile->face_descriptor);

        if ($storedDescriptor === null) {
            return response()->json([
                'message' => 'Face ID no esta habilitado. Entra con email y habilitalo primero.',
            ], 422);
        }

        $liveDescriptor = array_map(static fn ($value) => (float) $value, $validated['face_descriptor']);
        $distance = $this->calculateEuclideanDistance($storedDescriptor, $liveDescriptor);

        if ($distance > self::FACE_LOGIN_MAX_DISTANCE) {
            return response()->json([
                'message' => 'La biometria no coincide con esta cuenta. Entra con email.',
                'distance' => round($distance, 4),
            ], 422);
        }

        $token = $user->createToken('facecard-token')->plainTextToken;

        return response()->json([
            'message' => 'Acceso biometrico correcto.',
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
            'message' => 'Sesion cerrada.',
        ]);
    }

    public function destroyBiometricProfile(Request $request): JsonResponse
    {
        $deleted = $request->user()->biometricProfile()->delete();

        return response()->json([
            'message' => $deleted
                ? 'Datos biometricos eliminados.'
                : 'No habia datos biometricos que eliminar.',
        ]);
    }

    private function isFaceDemoModeEnabled(Request $request, array $validated): bool
    {
        $demoRequested = (bool) ($validated['demo_mode'] ?? $request->boolean('demo_mode'));

        return app()->environment('local') && $demoRequested;
    }

    private function resolveReferenceImage(User $user): ?string
    {
        return $user->biometricProfile?->reference_image ?: $user->talentProfile?->profile_image;
    }

    private function normalizeDescriptor(mixed $descriptor): ?array
    {
        if (! is_array($descriptor) || count($descriptor) !== 128) {
            return null;
        }

        return array_map(static fn ($value) => (float) $value, $descriptor);
    }

    private function calculateEuclideanDistance(array $left, array $right): float
    {
        $sum = 0.0;

        for ($index = 0; $index < 128; $index++) {
            $delta = $left[$index] - $right[$index];
            $sum += $delta * $delta;
        }

        return sqrt($sum);
    }
}





