<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Orders.
 *
 * The shipping address and the customer's contact details are **copied** onto the order: editing
 * an address later must not rewrite history, and a guest order has no address row at all.
 *
 * Every money column is an integer number of Toman. All of them are written by the server from
 * the locked catalogue prices — a client never sends an amount that reaches this table.
 *
 * `access_token` is the guest's proof of ownership for `GET /api/v1/orders/{number}`: it is
 * returned once at checkout and never listed anywhere else.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->string('number', 32)->unique();
            $table->string('access_token', 64)->unique();
            $table->string('status', 24)->default('pending_payment');
            $table->string('payment_status', 24)->default('pending');
            $table->char('currency', 3)->default('IRT');

            $table->unsignedBigInteger('subtotal');
            $table->unsignedBigInteger('discount_total')->default(0);
            $table->unsignedBigInteger('shipping_total')->default(0);
            $table->unsignedBigInteger('grand_total');

            $table->foreignId('coupon_id')->nullable()->constrained('coupons')->nullOnDelete();
            $table->unsignedSmallInteger('items_count')->default(0);

            $table->string('customer_name', 160);
            $table->string('customer_email', 190)->nullable();
            $table->string('customer_phone', 20);

            $table->string('shipping_province', 80);
            $table->string('shipping_city', 80);
            $table->string('shipping_postal_code', 20);
            $table->string('shipping_line1', 255);
            $table->string('shipping_line2', 255)->nullable();

            $table->text('note')->nullable();
            $table->timestamp('placed_at')->nullable();
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['status', 'placed_at']);
            $table->index('customer_email');
            $table->index('payment_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
