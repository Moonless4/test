<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * The two catalogue fields the filter rail offers and the API migration dropped: the product's
 * brand and its rating.
 *
 * Both were part of the store's own catalogue before this API existed (`src/lib/data.ts`, the same
 * 32 products the seeder now holds) and the rail's «برند» and «امتیاز» groups are built from them,
 * so a catalogue without them loses half the sidebar.
 *
 * `rating` is a decimal of the shoppers' average (0.0–5.0), nullable because a product nobody has
 * scored must be able to say so rather than claim a zero. Review *texts* are not stored here — a
 * product shows its score, and the reviews themselves arrive with the reviews feature.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('brand', 100)->nullable()->after('sku');
            $table->decimal('rating', 2, 1)->nullable()->after('compare_at_price');

            // The rail asks for the catalogue's brands as a set; the index keeps that cheap.
            $table->index('brand');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropIndex(['brand']);
            $table->dropColumn(['brand', 'rating']);
        });
    }
};
