<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Cross-Origin Resource Sharing (CORS) Configuration
    |--------------------------------------------------------------------------
    |
    | Here you may configure your settings for cross-origin resource sharing
    | or "CORS". This determines what cross-origin operations may execute
    | in web browsers. You are free to adjust these settings as needed.
    |
    | To learn more: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS
    |
    */

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    /*
    | Quando supports_credentials é true, o navegador não aceita origem * em
    | cross-origin. Se o front estiver em outro domínio, defina CORS_ALLOWED_ORIGINS
    | no .env (ex.: https://silfer-production.up.railway.app).
    */
    'allowed_origins' => array_filter(
        array_map('trim', explode(',', env('CORS_ALLOWED_ORIGINS', '*')))
    ) ?: ['*'],

    'allowed_origins_patterns' => [],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => true,

];
