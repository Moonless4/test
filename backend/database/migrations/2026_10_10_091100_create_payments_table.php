<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Payments. One row per attempt at the gateway, never per order: a failed attempt followed by a
 * successful one leaves both rows, which is exactly what a support question needs.
 *
 * `authority` is Zarinpal's transaction handle — unique, so the same authority can never settle
 * two orders. Only the masked card number the gateway returns is stored, never a full PAN.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->constrained()->cascadeOnDelete();
            $table->string('gateway', 32)->default('zarinpal');
            $table->unsignedBigInteger('amount');
            $table->char('currency', 3)->default('IRT');
            $table->string('status', 24)->default('pending');
            $table->string('authority', 128)->nullable()->unique();
            $table->string('reference_id', 128)->nullable();
            $table->string('card_mask', 32)->nullable();
            $table->string('failure_reason', 255)->nullable();
            $table->json('meta')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['order_id', 'status']);
            $table->index(['gateway', 'created_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};
