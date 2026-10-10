<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

/**
 * Site settings. `is_public` is the switch that decides whether a key may leave through
 * `GET /api/v1/content/settings` — a value that is not marked public is never serialised to the
 * storefront, so a contact phone number cannot leak by being added carelessly.
 */
return new class extends Migration
{
    public function up(): void
    {
        Schema::create('settings', function (Blueprint $table) {
            $table->id();
            $table->string('key', 120)->unique();
            $table->text('value')->nullable();
            $table->string('type', 16)->default('string');
            $table->string('group', 32)->default('general');
            $table->boolean('is_public')->default(false);
            $table->timestamps();

            $table->index(['group', 'is_public']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('settings');
    }
};
