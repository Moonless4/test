<?php

namespace Tests\Feature;

use App\Models\Setting;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * Where the storefront mounts its admin panel (`GET /content/admin-path`).
 *
 * The panel is part of the storefront's own SPA, so the browser has to learn its address before the
 * router renders — on an endpoint of its own, which is what lets `admin.path` be an internal
 * setting: the address never travels among the settings the shop publishes. It is an address and
 * never a lock; every admin route is guarded by `can:admin.access` on its own.
 */
class AdminPanelPathTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_serves_the_address_while_the_setting_is_internal(): void
    {
        Setting::factory()->internal()->create([
            'key' => Setting::ADMIN_PATH_KEY,
            'value' => 'manage',
        ]);

        $this->getJson('/api/v1/content/admin-path')
            ->assertOk()
            ->assertJsonPath('data.path', 'manage');

        // Which is the point: an internal row is not among the settings the storefront lists.
        $this->getJson('/api/v1/content/settings')
            ->assertOk()
            ->assertJsonMissing(['key' => Setting::ADMIN_PATH_KEY]);
    }

    public function test_it_lowercases_the_stored_segment_and_refuses_one_it_cannot_mount(): void
    {
        Setting::factory()->internal()->create([
            'key' => Setting::ADMIN_PATH_KEY,
            'value' => 'Manage',
        ]);

        $this->getJson('/api/v1/content/admin-path')->assertOk()->assertJsonPath('data.path', 'manage');

        // A value with a slash is not an address the router can mount, so the default is served.
        Setting::query()->where('key', Setting::ADMIN_PATH_KEY)->update(['value' => 'panel/secret']);

        $this->getJson('/api/v1/content/admin-path')
            ->assertOk()
            ->assertJsonPath('data.path', Setting::DEFAULT_ADMIN_PATH);
    }

    /**
     * The endpoint is public because the panel's *login* page is the first screen an operator sees:
     * the storefront has to learn the prefix before anyone holds a token. What travels is one URL
     * segment and nothing else — the assertion below is the whole payload, so a key/value pair, a
     * token or a hint about other addresses cannot be added to this answer unnoticed.
     */
    public function test_it_answers_the_address_and_nothing_else(): void
    {
        Setting::factory()->internal()->create([
            'key' => Setting::ADMIN_PATH_KEY,
            'value' => 'medora-panel',
        ]);

        // A neighbouring internal row, to prove nothing else is swept in with the answer.
        Setting::factory()->internal()->create([
            'key' => 'internal.support_email',
            'value' => 'ops@example.test',
        ]);

        $this->getJson('/api/v1/content/admin-path')
            ->assertOk()
            ->assertExactJson(['data' => ['path' => 'medora-panel']]);
    }

    public function test_it_falls_back_to_the_default_when_no_address_is_stored(): void
    {
        $this->getJson('/api/v1/content/admin-path')
            ->assertOk()
            ->assertJsonPath('data.path', Setting::DEFAULT_ADMIN_PATH);
    }
}
