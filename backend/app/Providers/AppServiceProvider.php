<?php

namespace App\Providers;

use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        RateLimiter::for('auth', fn (Request $request) => Limit::perMinute(5)
            ->by($request->ip())
            ->response(fn () => response()->json([
                'message' => 'Demasiados intentos. Espera un minuto e intentalo de nuevo.',
            ], 429)));

        RateLimiter::for('face', fn (Request $request) => Limit::perMinute(10)
            ->by($request->ip())
            ->response(fn () => response()->json([
                'message' => 'Demasiadas solicitudes de acceso facial. Espera un minuto.',
            ], 429)));
    }
}
