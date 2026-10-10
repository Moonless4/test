<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Where each token was issued from.
     *
     * The session list ("active sessions") is only useful if it can show a shopper *where* a
     * session is, and "new device" detection needs the last device the account signed in with.
     * The token value itself is never stored here — Sanctum keeps a SHA-256 hash of it, and these
     * two columns are metadata about the client, not a credential.
     */
    public function up(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table): void {
            $table->string('ip_address', 45)->nullable()->after('abilities');
            $table->string('user_agent', 255)->nullable()->after('ip_address');
        });
    }

    public function down(): void
    {
        Schema::table('personal_access_tokens', function (Blueprint $table): void {
            $table->dropColumn(['ip_address', 'user_agent']);
        });
    }
};
