<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * One row per authentication attempt, successful or not.
     *
     * Why a table and not only the audit log: suspicious-login detection has to answer "has this
     * address ever succeeded from this IP before?" and "how many failures arrived in the last N
     * minutes?" — questions an append-only audit trail answers slowly and only after a full scan.
     * The table carries no password, no token and no OTP: an email, an address, a user agent, a
     * country code when a trusted proxy supplied one, and the outcome.
     *
     * Rows are pruned by `security:prune` (see config/security.php → audit.retention_days).
     */
    public function up(): void
    {
        Schema::create('login_attempts', function (Blueprint $table): void {
            $table->id();
            $table->string('email')->nullable();
            $table->string('ip', 45)->nullable();
            $table->string('user_agent', 255)->nullable();
            $table->string('country', 2)->nullable();
            $table->string('device', 100)->nullable();
            $table->boolean('successful')->default(false);
            // `password`, `locked`, `two_factor_failed`, `two_factor_required`, `suspended`.
            $table->string('reason', 40)->nullable();
            $table->timestamp('created_at')->nullable();

            // Detection queries are always "for this address" or "from this address, recently".
            $table->index(['email', 'created_at']);
            $table->index(['ip', 'created_at']);
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('login_attempts');
    }
};
