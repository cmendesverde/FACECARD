<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\BookingController;
use App\Http\Controllers\Api\PortfolioController;
use App\Http\Controllers\Api\TalentController;
use App\Http\Controllers\Api\TalentExportController;
use App\Http\Controllers\Api\TalentProfileController;
use Illuminate\Support\Facades\Route;

Route::post('/register', [AuthController::class, 'register'])->middleware('throttle:auth');
Route::post('/login', [AuthController::class, 'login'])->middleware('throttle:auth');
Route::post('/face-login/prepare', [AuthController::class, 'prepareFaceLogin'])->middleware('throttle:face');
Route::post('/face-login/enroll', [AuthController::class, 'enrollFace']);
Route::post('/face-login', [AuthController::class, 'faceLogin'])->middleware('throttle:face');

Route::get('/talents', [TalentController::class, 'index']);
Route::get('/talents/{id}', [TalentController::class, 'show']);
Route::get('/featured-talents', [TalentController::class, 'featured']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);
    Route::get('/user', [AuthController::class, 'user']);
    Route::delete('/me/biometric-profile', [AuthController::class, 'destroyBiometricProfile']);

    Route::middleware('admin')->group(function () {
        Route::get('/exports/talents.csv', [TalentExportController::class, 'csv']);
        Route::get('/exports/talents.json', [TalentExportController::class, 'json']);
    });

    Route::get('/bookings', [BookingController::class, 'index']);
    Route::post('/bookings', [BookingController::class, 'store']);
    Route::patch('/bookings/{id}/status', [BookingController::class, 'updateStatus']);

    Route::get('/me/talent-profile', [TalentProfileController::class, 'show']);
    Route::post('/me/talent-profile', [TalentProfileController::class, 'store']);
    Route::put('/me/talent-profile', [TalentProfileController::class, 'update']);

    Route::get('/me/portfolio', [PortfolioController::class, 'index']);
    Route::post('/me/portfolio', [PortfolioController::class, 'store']);
    Route::delete('/me/portfolio/{id}', [PortfolioController::class, 'destroy']);
});


