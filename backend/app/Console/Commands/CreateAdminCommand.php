<?php

namespace App\Console\Commands;

use App\Enums\UserStatus;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Validator;

/**
 * Creates (or promotes) the first administrator from the command line.
 *
 *     php artisan admin:create
 *     php artisan admin:create --email=you@example.com --name="Your Name"
 *
 * The password is typed into a hidden prompt, so it never lands in the shell history, in a process
 * list, or in this project's chat transcript. `--password` exists for automated provisioning only.
 */
class CreateAdminCommand extends Command
{
    protected $signature = 'admin:create
        {--email= : Administrator email address}
        {--name= : Display name}
        {--password= : Password (only for automation; prefer the hidden prompt)}';

    protected $description = 'Create the first administrator account';

    public function handle(AuditLogger $audit): int
    {
        $email = (string) ($this->option('email') ?: $this->ask('Email address'));
        $name = (string) ($this->option('name') ?: $this->ask('Display name', 'مدیر فروشگاه'));
        $password = (string) ($this->option('password') ?: $this->secret('Password (typing is hidden)'));

        $validator = Validator::make(
            ['email' => $email, 'name' => $name, 'password' => $password],
            [
                'email' => ['required', 'email:rfc', 'max:190'],
                'name' => ['required', 'string', 'max:160'],
                'password' => ['required', 'string', \Illuminate\Validation\Rules\Password::defaults()],
            ],
        );

        if ($validator->fails()) {
            foreach ($validator->errors()->all() as $message) {
                $this->error($message);
            }

            return self::FAILURE;
        }

        $user = User::query()->firstOrNew(['email' => mb_strtolower($email)]);

        $user->name = $name;
        $user->password = $password; // hashed by the model cast
        $user->status = UserStatus::Active;
        $user->email_verified_at ??= now();
        $user->save();

        $user->syncRoles(['super-admin']);

        $audit->log('user.admin_created', $user, ['email' => $user->email, 'via' => 'cli'], $user);

        $this->info("Administrator ready: {$user->email} (roles: super-admin)");

        return self::SUCCESS;
    }
}
