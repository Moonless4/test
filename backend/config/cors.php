<?php

/*
 * CORS. The API is consumed by an external frontend, so the origin list is explicit and comes
 * from the environment: `Access-Control-Allow-Origin: *` is never sent for an authenticated API.
 *
 * `supports_credentials` is true because the cart token travels in a cookie as well as in the
 * `X-Cart-Token` header; the origin list is therefore required to be a literal list.
 */
return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],

    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')),
    ))),

    // Patterns exist for wildcard subdomains; left empty so a typo cannot widen access silently.
    'allowed_origins_patterns' => [],

    'allowed_headers' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('CORS_ALLOWED_HEADERS', 'Content-Type,Authorization,Accept,X-Requested-With,X-Cart-Token,X-Order-Token')),
    ))),

    'exposed_headers' => ['X-Request-Id', 'X-Cart-Token', 'Retry-After'],

    'max_age' => (int) env('CORS_MAX_AGE', 3600),

    'supports_credentials' => true,

];
