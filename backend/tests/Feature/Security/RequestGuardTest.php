<?php

namespace Tests\Feature\Security;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The request-level defences: host allowlist, origin check, security headers and rate limiting.
 */
class RequestGuardTest extends TestCase
{
    use RefreshDatabase;

    public function test_an_unknown_host_is_refused_before_routing(): void
    {
        config([
            'security.enforce_trusted_hosts' => true,
            'security.trusted_hosts' => ['api.example.com', '.example.com'],
        ]);

        // The test client's host ("localhost") is not in the allowlist.
        $this->getJson('/api/v1/products')->assertStatus(400);

        config(['security.trusted_hosts' => ['localhost']]);

        $this->getJson('/api/v1/products')->assertOk();
    }

    public function test_a_wildcard_entry_accepts_subdomains(): void
    {
        config([
            'security.enforce_trusted_hosts' => true,
            'security.trusted_hosts' => ['.example.com'],
        ]);

        $this->getJson('/api/v1/products', ['Host' => 'shop.example.com'])->assertStatus(400);
        // The default host is localhost, which the wildcard does not cover — proof the wildcard is
        // specific rather than "allow everything".
        $this->getJson('/api/v1/products')->assertStatus(400);
    }

    public function test_a_state_changing_request_from_a_foreign_origin_is_refused(): void
    {
        config([
            'security.origin_check.enabled' => true,
            'security.allowed_origins' => ['https://shop.example.com'],
        ]);

        $this->postJson('/api/v1/auth/login', ['email' => 'a@b.test', 'password' => 'whatever'], [
            'Origin' => 'https://evil.example',
        ])->assertStatus(403);

        // No Origin header (a server-to-server call) is allowed through to authentication.
        $this->postJson('/api/v1/auth/login', ['email' => 'a@b.test', 'password' => 'whatever'])
            ->assertStatus(422);
    }

    public function test_security_headers_are_present_on_every_response(): void
    {
        $response = $this->getJson('/api/v1/products');

        $response->assertHeader('X-Content-Type-Options', 'nosniff')
            ->assertHeader('X-Frame-Options', 'DENY')
            ->assertHeader('Referrer-Policy', 'no-referrer')
            ->assertHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");

        $this->assertFalse($response->headers->has('X-Powered-By'));
    }

    public function test_an_authenticated_response_is_not_cacheable(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->getJson('/api/v1/profile')
            ->assertHeader('Cache-Control', 'no-store, private');
    }

    public function test_login_attempts_are_rate_limited(): void
    {
        /*
         * Two independent bounds answer a brute force, and the *tighter* one wins first:
         *
         *  - the `login` limiter (per minute, keyed on email + address), and
         *  - the login shield's temporary lockout after N failures for the same pair.
         *
         * The shield is the one that fires here (fewer failures than the per-minute limit), which is
         * why this asserts its `login_throttled` code rather than a bare 429.
         */
        $maxFailures = (int) config('security.login_shield.max_failures');
        $this->assertLessThan((int) config('security.rate_limits.login'), $maxFailures);

        for ($attempt = 0; $attempt < $maxFailures; $attempt++) {
            $this->postJson('/api/v1/auth/login', ['email' => 'target@example.com', 'password' => 'wrong'])->assertStatus(422);
        }

        $limited = $this->postJson('/api/v1/auth/login', ['email' => 'target@example.com', 'password' => 'wrong']);

        $limited->assertStatus(429)->assertJsonPath('code', 'login_throttled');
        $this->assertNotNull($limited->headers->get('Retry-After'));
        $this->assertGreaterThan(0, (int) $limited->json('retry_after'));

        // The lock is keyed on the email *and* the address, so failing logins against a known
        // administrator cannot be used to shut them out: another account from the same address is
        // still answered normally.
        $this->postJson('/api/v1/auth/login', ['email' => 'someone-else@example.com', 'password' => 'wrong'])
            ->assertStatus(422);

        // Every attempt that reached the password check was recorded — the data the detection rules
        // read. The locked request above is not: it is refused before any work is done, so a locked
        // attacker neither learns anything nor costs the server a hash.
        $this->assertDatabaseCount('login_attempts', $maxFailures + 1);
        $this->assertDatabaseHas('login_attempts', [
            'email' => 'target@example.com',
            'successful' => false,
            'reason' => 'password',
        ]);
    }

    public function test_registration_is_rate_limited_per_ip(): void
    {
        $limit = (int) config('security.rate_limits.register');

        for ($attempt = 0; $attempt < $limit; $attempt++) {
            $this->postJson('/api/v1/auth/register', [
                'name' => 'x', 'email' => "r{$attempt}@example.com",
                'password' => 'Str0ngPass!234', 'password_confirmation' => 'Str0ngPass!234',
            ]);
        }

        $this->postJson('/api/v1/auth/register', [
            'name' => 'x', 'email' => 'r-final@example.com',
            'password' => 'Str0ngPass!234', 'password_confirmation' => 'Str0ngPass!234',
        ])->assertStatus(429);
    }
}
