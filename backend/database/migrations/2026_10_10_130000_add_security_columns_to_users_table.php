<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * The columns administrator MFA and suspicious-login detection need.
     *
     * Nothing here holds a plaintext credential:
     *
     *  - `two_factor_secret` is cast to `encrypted` on the model, so the database only ever holds
     *    the ciphertext produced with `APP_KEY`.
     *  - `two_factor_recovery_codes` holds bcrypt hashes (a JSON list), so a leaked row cannot be
     *    typed into the login form — the same reasoning that keeps password hashes here.
     *  - the two `last_login_*` columns are the baseline a later sign-in is compared against.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->text('two_factor_secret')->nullable()->after('password');
            $table->text('two_factor_recovery_codes')->nullable()->after('two_factor_secret');
            $table->timestamp('two_factor_confirmed_at')->nullable()->after('two_factor_recovery_codes');
            $table->string('last_login_country', 2)->nullable()->after('last_login_ip');
            $table->string('last_login_device', 100)->nullable()->after('last_login_country');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table): void {
            $table->dropColumn([
                'two_factor_secret',
                'two_factor_recovery_codes',
                'two_factor_confirmed_at',
                'last_login_country',
                'last_login_device',
            ]);
        });
    }
};
