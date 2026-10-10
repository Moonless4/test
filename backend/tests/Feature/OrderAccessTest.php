<?php

namespace Tests\Feature;

use App\Models\Order;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * IDOR/BOLA on orders: the tests that decide whether one shopper can read another's purchase.
 */
class OrderAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_the_owner_can_read_their_order(): void
    {
        $user = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $user->getKey()]);

        $this->actingAs($user, 'sanctum')
            ->getJson("/api/v1/orders/{$order->number}")
            ->assertOk()
            ->assertJsonPath('data.order.number', $order->number);
    }

    public function test_another_account_cannot_read_it_and_learns_nothing(): void
    {
        $owner = User::factory()->create();
        $stranger = User::factory()->create();
        $order = Order::factory()->create(['user_id' => $owner->getKey()]);

        // 404, not 403: the answer must not confirm that this order exists.
        $this->actingAs($stranger, 'sanctum')
            ->getJson("/api/v1/orders/{$order->number}")
            ->assertStatus(404);
    }

    public function test_the_order_list_only_contains_the_callers_orders(): void
    {
        $mine = User::factory()->create();
        $other = User::factory()->create();

        Order::factory()->count(2)->create(['user_id' => $mine->getKey()]);
        Order::factory()->count(3)->create(['user_id' => $other->getKey()]);

        $response = $this->actingAs($mine, 'sanctum')->getJson('/api/v1/orders')->assertOk();

        $this->assertCount(2, $response->json('data'));
    }

    public function test_a_guest_order_is_readable_with_its_access_token_and_not_without_it(): void
    {
        $order = Order::factory()->guest()->create();
        $token = (string) $order->access_token;

        $this->getJson("/api/v1/orders/{$order->number}")->assertStatus(404);

        $this->withHeaders(['X-Order-Token' => $token])
            ->getJson("/api/v1/orders/{$order->number}")
            ->assertOk();

        // A wrong token is as good as no token.
        $this->withHeaders(['X-Order-Token' => str_repeat('a', 64)])
            ->getJson("/api/v1/orders/{$order->number}")
            ->assertStatus(404);
    }

    public function test_the_access_token_never_appears_in_a_listing(): void
    {
        $user = User::factory()->create();
        Order::factory()->create(['user_id' => $user->getKey()]);

        $response = $this->actingAs($user, 'sanctum')->getJson('/api/v1/orders')->assertOk();

        $this->assertArrayNotHasKey('access_token', $response->json('data.0'));
        $this->assertStringNotContainsString('access_token', $response->getContent());
    }

    public function test_an_order_number_that_does_not_exist_is_a_404(): void
    {
        $user = User::factory()->create();

        $this->actingAs($user, 'sanctum')->getJson('/api/v1/orders/MD-000000-NOPE00')->assertStatus(404);
    }
}
