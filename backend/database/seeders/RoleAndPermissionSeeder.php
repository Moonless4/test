<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Permission;
use Spatie\Permission\Models\Role;
use Spatie\Permission\PermissionRegistrar;

/**
 * Roles and permissions.
 *
 * The permission names are the *only* vocabulary the admin routes use (`can:products.create`,
 * `permission:orders.manage`), so a role is exactly the sum of the permissions listed here.
 * Roles are deliberately few: super-admin (everything, including user/role management), admin
 * (everything except user and role management), staff (day-to-day catalogue and order work),
 * customer (a shopper, no admin access at all).
 *
 * Re-runnable: syncPermissions replaces the set instead of appending to it, so removing a
 * permission from this file removes it from the role on the next seed.
 */
class RoleAndPermissionSeeder extends Seeder
{
    /** @var array<string, array<int, string>> */
    private const MATRIX = [
        'super-admin' => ['*'],
        'admin' => [
            'products.view', 'products.create', 'products.update', 'products.delete',
            'categories.manage', 'orders.view', 'orders.update', 'coupons.manage',
            'content.manage', 'settings.manage', 'media.manage', 'audit.view',
        ],
        'staff' => [
            'products.view', 'products.update', 'orders.view', 'orders.update', 'media.manage',
        ],
        'customer' => [],
    ];

    /** @var array<int, string> */
    private const PERMISSIONS = [
        'products.view', 'products.create', 'products.update', 'products.delete',
        'categories.manage',
        'orders.view', 'orders.update',
        'coupons.manage',
        'users.view', 'users.update', 'users.roles',
        'content.manage',
        'settings.manage',
        'media.manage',
        'audit.view',
    ];

    public function run(): void
    {
        app(PermissionRegistrar::class)->forgetCachedPermissions();

        foreach (self::PERMISSIONS as $permission) {
            Permission::findOrCreate($permission, 'web');
        }

        foreach (self::MATRIX as $roleName => $permissions) {
            $role = Role::findOrCreate($roleName, 'web');

            $role->syncPermissions(
                $permissions === ['*']
                    ? array_merge(self::PERMISSIONS, ['users.view', 'users.update', 'users.roles'])
                    : $permissions,
            );
        }

        app(PermissionRegistrar::class)->forgetCachedPermissions();

        $this->command?->info('Roles and permissions seeded.');
    }
}
