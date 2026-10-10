<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('properties', function (Blueprint $table) {
            $table->id();
            $table->string('slug')->unique();
            $table->string('name');
            $table->string('city');
            $table->string('region');
            $table->string('country')->default('ایران');
            $table->bigInteger('price');
            $table->string('type');
            $table->string('status');
            $table->unsignedInteger('beds')->default(0);
            $table->unsignedInteger('baths')->default(0);
            $table->unsignedInteger('area')->default(0);
            $table->unsignedInteger('land')->default(0);
            $table->unsignedInteger('year')->default(0);
            $table->boolean('featured')->default(false);
            $table->text('summary');
            $table->json('description')->nullable();
            $table->json('features')->nullable();
            $table->json('amenities')->nullable();
            $table->string('image_id');
            $table->foreignId('agent_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('property_images', function (Blueprint $table) {
            $table->id();
            $table->foreignId('property_id')->constrained()->cascadeOnDelete();
            $table->string('unsplash_id');
            $table->string('alt')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('property_images');
        Schema::dropIfExists('properties');
    }
};
