<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Discount codes.
 *
 * `value` means percent (1–90) for a percent coupon and Toman for a fixed one; `max_discount`
 * caps a percent coupon so a 30% code cannot give away an entire expensive basket. `used_count`
 * is incremented inside the same transaction that places the order — see
 * App\Services\CheckoutService — so a code cannot be over-redeemed by two simultaneous checkouts.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('coupons', function (Blueprint $table) {
            $table->id();
            $table->string('code', 40)->unique();
            $table->string('type', 16);
            $table->unsignedBigInteger('value');
            $table->unsignedBigInteger('min_subtotal')->default(0);
            $table->unsignedBigInteger('max_discount')->nullable();
            $table->unsignedInteger('usage_limit')->nullable();
            $table->unsignedInteger('usage_limit_per_user')->nullable();
            $table->unsignedInteger('used_count')->default(0);
            $table->timestamp('starts_at')->nullable();
            $table->timestamp('ends_at')->nullable();
            $table->boolean('is_active')->default(true);
            $table->timestamps();

            $table->index(['is_active', 'starts_at', 'ends_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('coupons');
    }
};
