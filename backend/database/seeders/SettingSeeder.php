<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

/**
 * Site settings the storefront reads through `GET /api/v1/content/settings`.
 *
 * Only keys marked public are ever serialised, so this is also the list of what the shop is
 * willing to publish. Update the real values from the admin panel (`settings.manage`), not here:
 * the seeder only fills a key that has no value yet, so re-running it never overwrites what the
 * shop has already set.
 *
 * The defaults live in a method rather than a constant because two of them are read from
 * config('shop.*') — a constant expression cannot call a function.
 */
class SettingSeeder extends Seeder
{
    /**
     * @return array<string, array{value: string, type: string, group: string, public: bool}>
     */
    private function settings(): array
    {
        return [
            'store.name' => ['value' => 'مدورا', 'type' => 'string', 'group' => 'general', 'public' => true],
            'store.tagline' => ['value' => 'پوشاک و اکسسوری', 'type' => 'string', 'group' => 'general', 'public' => true],
            'store.phone' => ['value' => '', 'type' => 'string', 'group' => 'contact', 'public' => true],
            'store.email' => ['value' => '', 'type' => 'string', 'group' => 'contact', 'public' => true],
            'store.address' => ['value' => '', 'type' => 'string', 'group' => 'contact', 'public' => true],
            'store.instagram' => ['value' => '', 'type' => 'string', 'group' => 'social', 'public' => true],
            'store.telegram' => ['value' => '', 'type' => 'string', 'group' => 'social', 'public' => true],
            'shop.free_shipping_threshold' => ['value' => (string) config('shop.shipping.free_threshold'), 'type' => 'int', 'group' => 'shop', 'public' => true],
            'shop.shipping_flat_rate' => ['value' => (string) config('shop.shipping.flat_rate'), 'type' => 'int', 'group' => 'shop', 'public' => true],
            'shop.return_window_days' => ['value' => '7', 'type' => 'int', 'group' => 'shop', 'public' => true],
            // The admin panel's own URL segment. The storefront reads it before its first render to
            // know where the panel is mounted, and it does so on its own endpoint
            // (`GET /content/admin-path`) — which is why this row can stay internal: the panel's
            // address is not part of the shop's published settings. It is only ever an address,
            // never a lock: every admin route is guarded by the API's `can:admin.access`.
            'admin.path' => ['value' => 'admin', 'type' => 'string', 'group' => 'admin', 'public' => false],
            // Internal keys: is_public = false, so they can never travel to the browser.
            'internal.support_email' => ['value' => '', 'type' => 'string', 'group' => 'internal', 'public' => false],
        ];
    }

    public function run(): void
    {
        foreach ($this->settings() as $key => $setting) {
            Setting::query()->updateOrCreate(
                ['key' => $key],
                [
                    'type' => $setting['type'],
                    'group' => $setting['group'],
                    'is_public' => $setting['public'],
                    // An existing value is never overwritten by the seeder.
                    'value' => Setting::query()->where('key', $key)->value('value') ?? $setting['value'],
                ],
            );
        }

        $this->command?->info('Settings seeded.');
    }
}
