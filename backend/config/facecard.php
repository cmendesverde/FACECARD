<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Modo demo del acceso facial
    |--------------------------------------------------------------------------
    |
    | Cuando está activo, el login facial simulado se habilita sin verificación
    | biométrica real. Es independiente de APP_ENV: así la demo puede funcionar
    | en producción (portafolio) sin depender de app()->environment('local').
    |
    */

    'demo_mode' => env('FACECARD_DEMO_MODE', false),

];
