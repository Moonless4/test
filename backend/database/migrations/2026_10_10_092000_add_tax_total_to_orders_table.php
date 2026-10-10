<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Tax is charged at 0% by default (see config/shop.php), but the column exists from the start so
 * enabling it later is a configuration change rather than a schema change — and so the order total
 * always equals subtotal − discount + shipping + tax, with no hidden component.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->unsignedBigInteger('tax_total')->default(0)->after('shipping_total');
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('tax_total');
        });
    }
};
