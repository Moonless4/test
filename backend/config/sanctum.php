<?php

use Laravel\Sanctum\Sanctum;

return [

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', sprintf(
        '%s,%s',
        'localhost',
        'localhost:3000',
    ))),

    'guard' => ['web'],

    'expiration' => env('SANCTUM_TOKEN_EXPIRATION', 10080), // 7 days (in minutes)

    'token_prefix' => env('SANCTUM_TOKEN_PREFIX', ''),

    'middleware' => [
        'authenticate_session' => Laravel\Sanctum\Http\Middleware\AuthenticateSession::class,
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
        'verify_csrf_token' => App\Http\Middleware\VerifyCsrfToken::class,
    ],

];
