<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Auth\Notifications\VerifyEmail;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Illuminate\Support\Facades\URL;
use Tests\TestCase;

class EmailVerificationTest extends TestCase
{
    use RefreshDatabase;

    public function test_a_signed_link_verifies_the_address(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->getKey(),
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->getJson($url)->assertOk();

        $this->assertTrue($user->fresh()->hasVerifiedEmail());
    }

    public function test_an_unsigned_or_tampered_link_is_refused(): void
    {
        $user = User::factory()->unverified()->create();
        $hash = sha1($user->getEmailForVerification());

        // No signature at all.
        $this->getJson("/api/v1/auth/email/verify/{$user->getKey()}/{$hash}")->assertStatus(403);

        // A valid signature for a different hash.
        $url = URL::temporarySignedRoute('verification.verify', now()->addMinutes(60), [
            'id' => $user->getKey(),
            'hash' => sha1('someone-elses@example.com'),
        ]);

        $this->getJson($url)->assertStatus(403);
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_an_expired_link_is_refused(): void
    {
        $user = User::factory()->unverified()->create();

        $url = URL::temporarySignedRoute('verification.verify', now()->subMinute(), [
            'id' => $user->getKey(),
            'hash' => sha1($user->getEmailForVerification()),
        ]);

        $this->getJson($url)->assertStatus(403);
        $this->assertFalse($user->fresh()->hasVerifiedEmail());
    }

    public function test_the_resend_endpoint_is_silent_about_account_state(): void
    {
        Notification::fake();

        $verified = User::factory()->create();
        $this->actingAs($verified, 'sanctum')->postJson('/api/v1/auth/email/resend')->assertOk();

        Notification::assertNotSentTo($verified, VerifyEmail::class);

        $unverified = User::factory()->unverified()->create();
        $this->actingAs($unverified, 'sanctum')->postJson('/api/v1/auth/email/resend')->assertOk();

        Notification::assertSentTo($unverified, VerifyEmail::class);
    }
}
