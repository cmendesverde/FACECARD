<?php

$defaultOrigins = [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
];

$configuredOrigins = array_values(array_unique(array_filter(array_map(
    'trim',
    array_merge(
        explode(',', env('CORS_ALLOWED_ORIGINS', '')),
        [env('FRONTEND_URL')]
    )
))));

$configuredOriginPatterns = array_values(array_filter(array_map(
    'trim',
    explode(',', env('CORS_ALLOWED_ORIGIN_PATTERNS', ''))
)));

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => count($configuredOrigins) ? $configuredOrigins : $defaultOrigins,

    'allowed_origins_patterns' => $configuredOriginPatterns,

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
