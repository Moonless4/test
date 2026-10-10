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
     *
     * `expiration_minutes` is never null by default: a token with no expiry is a password that
     * cannot be changed. Only an explicit `SANCTUM_TOKEN_TTL=0` asks for unlimited tokens, which
     * the deployment guide tells a host not to do.
     */
    'tokens' => [
        'expiration_minutes' => (int) env('SANCTUM_TOKEN_TTL', 720) ?: null,
        'abilities' => [
            'customer' => ['cart:manage', 'orders:read', 'orders:write', 'profile:manage'],
            'staff' => ['*'],
        ],
        /*
         * Abilities carried by the short-lived tokens the two-factor flow hands out. A token that
         * has only `twofa:challenge` can reach the challenge endpoint and nothing else — a stolen
         * half-finished login is worth nothing.
         */
        'two_factor_challenge' => 'twofa:challenge',
        'two_factor_setup' => 'twofa:setup',
        'two_factor_verified' => 'twofa:verified',
    ],

    /*
     * Administrator two-factor authentication (TOTP, RFC 6238 — implemented by
     * pragmarx/google2fa, never by hand).
     *
     * `enforce_admins` is on by default because an administrator who can skip MFA is the whole
     * attack: with it on, a staff account may only reach /admin once it has confirmed a TOTP
     * code, and a confirmed account must pass the challenge at every login. A host that cannot
     * put an authenticator app in its operator's hands sets TWO_FACTOR_ENFORCE_ADMINS=false and
     * accepts the weaker posture knowingly.
     */
    'two_factor' => [
        'enabled' => (bool) env('TWO_FACTOR_ENABLED', true),
        'enforce_admins' => (bool) env('TWO_FACTOR_ENFORCE_ADMINS', true),
        'issuer' => (string) env('TWO_FACTOR_ISSUER', env('APP_NAME', 'Medora')),
        // Accepted 30-second steps either side of the current one (clock drift, nothing more).
        'window' => (int) env('TWO_FACTOR_WINDOW', 1),
        'recovery_codes' => (int) env('TWO_FACTOR_RECOVERY_CODES', 8),
        // A half-finished login is valid for minutes, not hours.
        'challenge_ttl_minutes' => (int) env('TWO_FACTOR_CHALLENGE_TTL', 5),
        // Wrong codes before the challenge is abandoned and the challenge token dies.
        'max_attempts' => (int) env('TWO_FACTOR_MAX_ATTEMPTS', 5),
        'attempt_decay_minutes' => (int) env('TWO_FACTOR_ATTEMPT_DECAY', 15),
    ],

    /*
     * Login shield: what happens between "this looks like a brute force" and "this is a lockout".
     *
     * The lockout is *temporary* and keyed on the email **and** the address it came from: a
     * permanent lock, or one keyed on the email alone, would let anybody shut a known administrator
     * out of the shop by failing logins on purpose.
     */
    'login_shield' => [
        'max_failures' => (int) env('LOGIN_SHIELD_MAX_FAILURES', 5),
        'lockout_minutes' => (int) env('LOGIN_SHIELD_LOCKOUT_MINUTES', 15),
        'failure_decay_minutes' => (int) env('LOGIN_SHIELD_DECAY_MINUTES', 30),
        // Each failure answers a little slower (capped, in milliseconds): it costs an attacker
        // time without turning a password check into a denial-of-service lever.
        'progressive_delay_ms' => (int) env('LOGIN_SHIELD_DELAY_MS', 250),
        'progressive_delay_cap_ms' => (int) env('LOGIN_SHIELD_DELAY_CAP_MS', 1000),
        // A sign-in from a country other than the last one, inside this window, is "impossible
        // travel" — only checked when a trusted proxy supplied a country.
        'travel_window_hours' => (int) env('LOGIN_SHIELD_TRAVEL_HOURS', 12),
        // More live sessions than this is worth an event (it is often a shared password).
        'session_watch' => (int) env('LOGIN_SHIELD_SESSION_WATCH', 5),
    ],

    /*
     * Re-authentication. A bearer token proves the token was issued; it does not prove the person
     * at the keyboard knows the password *now*. Sensitive changes (roles, settings, two-factor)
     * ask for the password again and remember the answer for this long, per token.
     */
    'recent_auth' => [
        'ttl_minutes' => (int) env('RECENT_AUTH_TTL', 15),
    ],

    /*
     * Outbound requests. Nothing in this application fetches a URL a client supplied, and the one
     * outbound call (Turnstile, when enabled) goes to a fixed host — but the guard exists so that
     * a future feature cannot turn into an SSRF primitive by accident. See App\Support\SafeUrl.
     */
    'outbound' => [
        'timeout' => (int) env('OUTBOUND_TIMEOUT', 5),
        'connect_timeout' => (int) env('OUTBOUND_CONNECT_TIMEOUT', 3),
        // Empty = any host, as long as it resolves to a public address over http(s).
        'allowed_hosts' => array_values(array_filter(array_map(
            'trim',
            explode(',', (string) env('OUTBOUND_ALLOWED_HOSTS', '')),
        ))),
        // Only a test suite or a deliberately offline host turns this on.
        'allow_private_networks' => (bool) env('OUTBOUND_ALLOW_PRIVATE', false),
    ],

    /*
     * Bot protection. Off by default and only ever required on the few endpoints where automation
     * is worth money to an attacker; turning it on needs a Cloudflare Turnstile site/secret pair.
     */
    'turnstile' => [
        'enabled' => (bool) env('TURNSTILE_ENABLED', false),
        'site_key' => env('TURNSTILE_SITE_KEY'),
        'secret' => env('TURNSTILE_SECRET_KEY'),
        'verify_url' => (string) env('TURNSTILE_VERIFY_URL', 'https://challenges.cloudflare.com/turnstile/v0/siteverify'),
        // Which routes require a token when the feature is on.
        'protect' => ['login', 'register', 'password-forgot'],
    ],

    /*
     * Inbound webhooks. A signature proves the payload came from the gateway; the timestamp
     * bounds how long a captured request stays usable; the idempotency key makes a replay a
     * no-op. A URL is never a credential.
     */
    'webhooks' => [
        'payment' => [
            'secret' => env('PAYMENT_WEBHOOK_SECRET'),
            'tolerance_seconds' => (int) env('PAYMENT_WEBHOOK_TOLERANCE', 300),
            'signature_header' => (string) env('PAYMENT_WEBHOOK_SIGNATURE_HEADER', 'X-Medora-Signature'),
            'timestamp_header' => (string) env('PAYMENT_WEBHOOK_TIMESTAMP_HEADER', 'X-Medora-Timestamp'),
            'idempotency_header' => (string) env('PAYMENT_WEBHOOK_IDEMPOTENCY_HEADER', 'X-Medora-Idempotency-Key'),
        ],
    ],

    /*
     * Retention. A security log is evidence, not a permanent record of every shopper: the audit
     * trail and the login attempts are pruned to this many days by `security:prune`.
     */
    'audit' => [
        'retention_days' => (int) env('AUDIT_RETENTION_DAYS', 365),
        'login_attempt_retention_days' => (int) env('LOGIN_ATTEMPT_RETENTION_DAYS', 90),
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
        // One endpoint does not share another's budget: a second-factor code, a token operation
        // or an administrator's list are each worth attacking on their own terms.
        'two_factor' => (int) env('RATE_LIMIT_TWO_FACTOR', 6),
        'recent_auth' => (int) env('RATE_LIMIT_RECENT_AUTH', 5),
        'admin' => (int) env('RATE_LIMIT_ADMIN', 60),
        'token' => (int) env('RATE_LIMIT_TOKEN', 10),
        'webhook' => (int) env('RATE_LIMIT_WEBHOOK', 60),
        'upload' => (int) env('RATE_LIMIT_UPLOAD', 10),
    ],

];
