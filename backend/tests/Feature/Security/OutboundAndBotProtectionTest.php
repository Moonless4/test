<?php

namespace Tests\Feature\Security;

use App\Exceptions\UnsafeUrlException;
use App\Support\SafeUrl;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;
use PHPUnit\Framework\Attributes\DataProvider;
use Tests\TestCase;

/**
 * The outbound-request guard (SSRF) and the optional bot challenge.
 *
 * The two share this file because they are the same kind of control: something the application must
 * do *before* it talks to a third party it does not control.
 */
class OutboundAndBotProtectionTest extends TestCase
{
    use RefreshDatabase;

    /**
     * One data set per address, each an array of arguments as PHPUnit 11+ requires; the key names
     * the data set, so a failure says which address leaked and not just "data set #6".
     *
     * @return array<string, array<int, string>>
     */
    public static function unsafeAddresses(): array
    {
        return [
            'the application itself' => ['http://127.0.0.1:8000/api/v1/admin/users'],
            'cloud metadata' => ['http://169.254.169.254/latest/meta-data/'],
            'a private range 10/8' => ['http://10.0.0.5/internal'],
            'a private range 192.168/16' => ['http://192.168.1.1/router'],
            'a private range 172.16/12' => ['http://172.16.4.4/service'],
            'the IPv6 loopback' => ['http://[::1]/'],
            'an IPv6 unique-local address' => ['http://[fd00::1]/'],
            'carrier-grade NAT' => ['http://100.64.1.1/'],
            'a scheme that is not http(s)' => ['file:///etc/passwd'],
            'another scheme that is not http(s)' => ['gopher://internal:70/1'],
            'a name that resolves to the loopback' => ['http://localhost:3306/'],
        ];
    }

    // An attribute, not a `@dataProvider` doc-comment: PHPUnit 12 dropped the annotation and
    // ignores it silently, which left this test with no arguments at all instead of running it
    // once per address.
    #[DataProvider('unsafeAddresses')]
    public function test_an_address_that_is_not_the_public_internet_is_refused(string $url): void
    {
        $this->expectException(UnsafeUrlException::class);

        SafeUrl::assertAllowed($url);
    }

    public function test_a_public_address_is_allowed(): void
    {
        // An IP literal, so the assertion does not depend on a resolver being available.
        SafeUrl::assertAllowed('https://1.1.1.1/');
        SafeUrl::assertAllowed('https://[2606:4700:4700::1111]/');

        $this->assertTrue(true);
    }

    public function test_the_allowlist_narrows_hosts_further_when_it_is_set(): void
    {
        config([
            'security.outbound.allowed_hosts' => ['.example.com', 'gateway.test', '1.1.1.1'],
            // Resolution is what `test_an_address_…` and `test_a_public_address_is_allowed` cover.
            // Here the *matching* rule is what is under test, so the names do not have to resolve
            // for the outcome to be decided by the allowlist alone — a `.test` name never resolves
            // anywhere, and a test that needed it to would fail everywhere.
            'security.outbound.allow_private_networks' => true,
        ]);

        SafeUrl::assertAllowed('https://example.com/v1');        // the entry itself
        SafeUrl::assertAllowed('https://api.example.com/v1');    // and its subdomains (leading dot)
        SafeUrl::assertAllowed('https://gateway.test/notify');   // an exact entry
        SafeUrl::assertAllowed('https://1.1.1.1/v1');            // an exact entry that is an address

        $this->expectException(UnsafeUrlException::class);
        SafeUrl::assertAllowed('https://8.8.8.8/');              // public, but not on the list
    }

    public function test_a_private_address_is_recognized_even_when_it_is_dressed_as_ipv6(): void
    {
        $this->assertTrue(SafeUrl::isPrivateAddress('::ffff:127.0.0.1'));
        $this->assertTrue(SafeUrl::isPrivateAddress('::ffff:10.1.2.3'));
        $this->assertFalse(SafeUrl::isPrivateAddress('1.1.1.1'));
    }

    public function test_the_bot_challenge_is_off_unless_it_is_switched_on(): void
    {
        Http::fake();

        // TURNSTILE_ENABLED=false (the default, and the test environment's setting): no token is
        // required and no outbound call is made — a challenge in front of a working login would be
        // a worse experience than the risk it removes.
        $this->postJson('/api/v1/auth/login', ['email' => 'nobody@example.com', 'password' => 'wrong'])
            ->assertStatus(422);

        Http::assertNothingSent();
    }

    public function test_when_switched_on_a_missing_or_failed_challenge_is_refused(): void
    {
        config(['security.turnstile.enabled' => true, 'security.turnstile.secret' => 'secret-key']);

        // No token at all.
        $this->postJson('/api/v1/auth/login', ['email' => 'nobody@example.com', 'password' => 'wrong'])
            ->assertStatus(403)
            ->assertJsonPath('code', 'challenge_failed');

        // One fake for both answers: `Http::fake()` *merges* stubs, so a second call does not
        // replace the first one — the earliest matching stub keeps winning and the accepted token
        // was still judged by the rejecting stub. The provider's own answer to the token is what
        // this fake reproduces instead.
        Http::fake(function ($request) {
            parse_str($request->body(), $fields);

            return Http::response(['success' => ($fields['response'] ?? null) === 'good-token'], 200);
        });

        // A token the provider rejects.
        $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@example.com', 'password' => 'wrong', 'cf_turnstile_token' => 'bad-token',
        ])->assertStatus(403);

        // A token the provider accepts: the login proceeds and gets its normal answer.
        $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@example.com', 'password' => 'wrong', 'cf_turnstile_token' => 'good-token',
        ])->assertStatus(422);
    }

    public function test_the_challenge_secret_never_appears_in_a_response(): void
    {
        config(['security.turnstile.enabled' => true, 'security.turnstile.secret' => 'secret-key-value']);

        Http::fake(['*' => Http::response(['success' => false], 200)]);

        $response = $this->postJson('/api/v1/auth/login', [
            'email' => 'nobody@example.com', 'password' => 'wrong', 'cf_turnstile_token' => 'bad-token',
        ]);

        $this->assertStringNotContainsString('secret-key-value', $response->getContent());
    }
}
