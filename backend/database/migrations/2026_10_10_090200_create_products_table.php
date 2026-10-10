<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Products. Money is an unsigned integer number of Toman — never a float, never a formatted
 * string. `compare_at_price` is the pre-discount price the storefront renders struck through
 * above `price`, so both live here and the discount is always derived, never stored.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            // Nullable so an administrator can remove a category without losing its products.
            $table->foreignId('category_id')->nullable()->constrained('categories')->nullOnDelete();
            $table->string('name', 200);
            $table->string('slug', 220)->unique();
            $table->string('sku', 64)->unique();
            $table->string('short_description', 500)->nullable();
            $table->text('description')->nullable();
            $table->unsignedBigInteger('price');
            $table->unsignedBigInteger('compare_at_price')->nullable();
            $table->integer('stock_quantity')->default(0);
            $table->unsignedSmallInteger('low_stock_threshold')->default(3);
            $table->boolean('is_active')->default(true);
            $table->boolean('is_featured')->default(false);
            $table->timestamp('published_at')->nullable();
            $table->json('attributes')->nullable();
            $table->timestamps();

            $table->index(['is_active', 'published_at']);
            $table->index(['category_id', 'is_active']);
            $table->index('is_featured');
            // Storefront search matches on name and sku with LIKE; a plain index keeps it cheap.
            $table->index('name');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
