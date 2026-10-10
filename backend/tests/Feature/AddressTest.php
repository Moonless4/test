<?php

namespace Tests\Feature;

use App\Models\Address;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AddressTest extends TestCase
{
    use RefreshDatabase;

    private function payload(array $overrides = []): array
    {
        return array_merge([
            'label' => 'خانه',
            'receiver_first_name' => 'رضا',
            'receiver_last_name' => 'محمدی',
            'phone' => '09121234567',
            'province' => 'تهران',
            'city' => 'تهران',
            'postal_code' => '1234567890',
            'line1' => 'خیابان نمونه، پلاک ۱',
            'is_default' => false,
        ], $overrides);
    }

    public function test_a_shopper_manages_their_own_addresses(): void
    {
        $user = User::factory()->create();

        $created = $this->actingAs($user, 'sanctum')->postJson('/api/v1/addresses', $this->payload())->assertCreated();
        $id = $created->json('data.address.id');

        $this->actingAs($user, 'sanctum')->getJson('/api/v1/addresses')->assertOk()->assertJsonCount(1, 'data');

        $this->actingAs($user, 'sanctum')
            ->putJson("/api/v1/addresses/{$id}", $this->payload(['city' => 'کرج']))
            ->assertOk()
            ->assertJsonPath('data.address.city', 'کرج');

        $this->actingAs($user, 'sanctum')->deleteJson("/api/v1/addresses/{$id}")->assertOk();
        $this->assertDatabaseCount('addresses', 0);
    }

    public function test_persian_digits_are_accepted_and_stored_as_latin(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user, 'sanctum')->postJson('/api/v1/addresses', $this->payload([
            'phone' => '۰۹۱۲۳۴۵۶۷۸۹',
            'postal_code' => '۱۲۳۴۵۶۷۸۹۰',
        ]))->assertCreated();

        $this->assertSame('09123456789', $response->json('data.address.phone'));
        $this->assertSame('1234567890', $response->json('data.address.postal_code'));
    }

    public function test_an_invalid_phone_or_postal_code_is_refused(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/addresses', $this->payload(['phone' => '12345']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('phone');

        $this->actingAs($user, 'sanctum')
            ->postJson('/api/v1/addresses', $this->payload(['postal_code' => '1']))
            ->assertStatus(422)
            ->assertJsonValidationErrors('postal_code');
    }

    public function test_another_account_cannot_read_write_or_delete_an_address(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $address = Address::factory()->create(['user_id' => $owner->getKey()]);

        // 404, never 403: a 403 would confirm that the address id is real and belongs to somebody.
        $this->actingAs($stranger, 'sanctum')
            ->putJson("/api/v1/addresses/{$address->getKey()}", $this->payload())
            ->assertStatus(404);

        $this->actingAs($stranger, 'sanctum')
            ->deleteJson("/api/v1/addresses/{$address->getKey()}")
            ->assertStatus(404);

        $this->actingAs($stranger, 'sanctum')
            ->getJson('/api/v1/addresses')
            ->assertOk()
            ->assertJsonCount(0, 'data');

        $this->assertDatabaseHas('addresses', [
            'id' => $address->getKey(),
            'user_id' => $owner->getKey(),
            'city' => 'تهران',
        ]);
    }

    public function test_exactly_one_address_stays_default(): void
    {
        $user = User::factory()->create();
        $first = Address::factory()->default()->create(['user_id' => $user->getKey()]);
        $second = Address::factory()->create(['user_id' => $user->getKey()]);

        $this->actingAs($user, 'sanctum')
            ->postJson("/api/v1/addresses/{$second->getKey()}/default")
            ->assertOk();

        $this->assertFalse($first->fresh()->is_default);
        $this->assertTrue($second->fresh()->is_default);
        $this->assertSame(1, Address::query()->where('user_id', $user->getKey())->where('is_default', true)->count());
    }
}
