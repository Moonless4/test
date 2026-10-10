<?php

/*
 * Security policy of the API. Everything here is env-driven so the same code runs on the
 * sandbox and on the production DirectAdmin host without a code change.
 */
return [

    /*
     * Host allowlist. Requests whose Host header is not matched are answered 400 before any
     * routing happens (see App\Http\Middleware\EnforceTrustedHost). A leading dot matches the
     * domain and every subdomain: `.example.com` accepts example.com and api.example.com.
     *
     * Empty list = checking disabled, which is Laravel's default behaviour.
     */
    'trusted_hosts' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('TRUSTED_HOSTS', '')),
    ))),

    'enforce_trusted_hosts' => (bool) env('ENFORCE_TRUSTED_HOSTS', true),

    /*
     * CORS origins allowed to make state-changing calls. Kept in one place so the CORS handler
     * and the origin check cannot drift apart. Never `*` for an authenticated API.
     */
    'allowed_origins' => array_values(array_filter(array_map(
        'trim',
        explode(',', (string) env('CORS_ALLOWED_ORIGINS', '')),
    ))),

    /*
     * A state-changing request that carries an Origin outside the allowlist is refused. Browsers
     * always send Origin on cross-site writes, so this stops a foreign page from driving the API
     * with a visitor's credentials. Requests without an Origin (curl, server-to-server, the
     * payment gateway) are unaffected: they still need a valid token to get past auth.
     */
    'origin_check' => [
        'enabled' => (bool) env('ENFORCE_ORIGIN_CHECK', true),
    ],

    'headers' => [
        'csp' => env('CSP_POLICY', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'"),
        'frame_options' => env('SECURITY_FRAME_OPTIONS', 'DENY'),
        'referrer_policy' => env('SECURITY_REFERRER_POLICY', 'no-referrer'),
        'permissions_policy' => env('SECURITY_PERMISSIONS_POLICY', 'accelerometer=(), autoplay=(), camera=(), display-capture=(), encrypted-media=(), fullscreen=(), geolocation=(), gyroscope=(), magnetometer=(), microphone=(), midi=(), payment=(), picture-in-picture=(), publickey-credentials-get=(), screen-wake-lock=(), usb=(), xr-spatial-tracking=()'),
        'cross_domain_policies' => env('SECURITY_CROSS_DOMAIN_POLICIES', 'none'),
    ],

    'hsts' => [
        'enabled' => (bool) env('SECURITY_HSTS', true),
        'max_age' => (int) env('SECURITY_HSTS_MAX_AGE', 31536000),
        'include_subdomains' => (bool) env('SECURITY_HSTS_SUBDOMAINS', true),
        // Only enable after every subdomain is HTTPS-only; a wrong preload is hard to undo.
        'preload' => (bool) env('SECURITY_HSTS_PRELOAD', false),
    ],

    /*
     * Password policy. `uncompromised` asks HaveIBeenPwned (k-anonymity, only a hash prefix
     * leaves the server); it needs outbound HTTPS, which some Iranian hosts restrict, so it is
     * opt-in.
     */
    'password' => [
        'min' => (int) env('PASSWORD_MIN_LENGTH', 10),
        'max' => (int) env('PASSWORD_MAX_LENGTH', 72),
        'uncompromised' => (bool) env('PASSWORD_UNCOMPROMISED', false),
    ],

    /*
     * Access tokens. 12 hours by default: long enough for a shop session, short enough that a
     * leaked token is not a permanent key. Sanctum enforces the value on every request.
     */
    'tokens' => [
        'expiration_minutes' => env('SANCTUM_TOKEN_TTL') === null ? null : (int) env('SANCTUM_TOKEN_TTL'),
        'abilities' => [
            'customer' => ['cart:manage', 'orders:read', 'orders:write', 'profile:manage'],
            'staff' => ['*'],
        ],
    ],

    /*
     * Uploads. MIME is verified from the file's own bytes (finfo), never from the client's
     * Content-Type or the filename. Nothing executable is ever accepted.
     */
    'uploads' => [
        'max_kb' => (int) env('UPLOAD_MAX_KB', 5120),
        'max_dimension' => (int) env('UPLOAD_IMAGE_MAX_DIMENSION', 4000),
        'image_mimes' => array_values(array_filter(array_map(
            'trim',
            explode(',', (string) env('UPLOAD_ALLOWED_IMAGE_MIME', 'image/jpeg,image/png,image/webp,image/avif')),
        ))),
        'private_mimes' => array_values(array_filter(array_map(
            'trim',
            explode(',', (string) env('UPLOAD_ALLOWED_PRIVATE_MIME', 'application/pdf')),
        ))),
    ],

    /*
     * Per-minute rate limits. Keys are the limiter names used by the routes; see
     * App\Providers\AppServiceProvider::configureRateLimiting().
     */
    'rate_limits' => [
        'login' => (int) env('RATE_LIMIT_LOGIN', 10),
        'register' => (int) env('RATE_LIMIT_REGISTER', 5),
        'password_reset' => (int) env('RATE_LIMIT_PASSWORD_RESET', 5),
        'verification' => (int) env('RATE_LIMIT_VERIFICATION', 3),
        'api' => (int) env('RATE_LIMIT_API', 120),
        'sensitive' => (int) env('RATE_LIMIT_SENSITIVE', 20),
        'checkout' => (int) env('RATE_LIMIT_CHECKOUT', 15),
    ],

];
