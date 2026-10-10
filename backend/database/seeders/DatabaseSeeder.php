<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

/**
 * Reference data only.
 *
 * The order matters: roles must exist before an administrator can be given one. No demo customer,
 * no demo order, no demo password — anything a seeder invented would be a real account on a real
 * host.
 */
class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RoleAndPermissionSeeder::class,
            SettingSeeder::class,
            CatalogSeeder::class,
            ContentSeeder::class,
            AdminUserSeeder::class,
        ]);
    }
}
