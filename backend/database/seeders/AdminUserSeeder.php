<?php

namespace Database\Seeders;

use App\Enums\UserStatus;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Log;

/**
 * The first administrator — only when the host explicitly provides one.
 *
 * Nothing is hard-coded: without ADMIN_EMAIL and ADMIN_PASSWORD in the environment this seeder
 * does nothing at all (it never invents a default password, and it never prints one). On a
 * DirectAdmin account the intended path is:
 *
 *     php artisan admin:create
 *
 * which prompts for the password with hidden input. An automated provisioning run sets
 * ADMIN_EMAIL and ADMIN_PASSWORD for this seeder instead.
 */
class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $email = env('ADMIN_EMAIL');
        $password = env('ADMIN_PASSWORD');

        if (! is_string($email) || $email === '' || ! is_string($password) || $password === '') {
            $this->command?->warn('ADMIN_EMAIL/ADMIN_PASSWORD not set — no administrator created. Run `php artisan admin:create`.');

            return;
        }

        $user = User::query()->firstOrNew(['email' => mb_strtolower($email)]);

        $user->name = (string) env('ADMIN_NAME', 'مدیر فروشگاه');
        $user->password = $password;
        $user->status = UserStatus::Active;
        $user->email_verified_at ??= now();
        $user->save();

        $user->syncRoles(['super-admin']);

        // Logged without the address being treated as a credential; the password never appears.
        Log::info('Administrator account ensured from environment.', ['email' => $user->email]);

        $this->command?->info("Administrator ensured: {$user->email}");
    }
}
