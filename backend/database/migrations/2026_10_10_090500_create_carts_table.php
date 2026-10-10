<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Carts.
 *
 * A shopper who is not signed in still gets a server-side cart: the `token` is a 64-character
 * random value handed to the client once and returned in the `X-Cart-Token` header. On login the
 * guest cart is merged into the account's cart and the token is discarded.
 *
 * `expires_at` lets the scheduler drop abandoned carts; nothing money-related is stored here
 * beyond the item snapshots — totals are always recomputed from the catalogue.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('token', 64)->nullable()->unique();
            $table->string('status', 20)->default('active');
            $table->foreignId('coupon_id')->nullable()->constrained('coupons')->nullOnDelete();
            $table->timestamp('expires_at')->nullable();
            $table->timestamps();

            $table->index(['status', 'expires_at']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('carts');
    }
};
