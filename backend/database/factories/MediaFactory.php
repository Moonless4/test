<?php

namespace Database\Factories;

use App\Models\Media;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<Media>
 */
class MediaFactory extends Factory
{
    /**
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'disk' => 'public',
            'path' => 'media/public/'.Str::ulid()->toBase32().'.png',
            'original_name' => 'product.png',
            'mime_type' => 'image/png',
            'size_bytes' => 1024,
            'width' => 800,
            'height' => 1000,
            'checksum' => hash('sha256', Str::random(32)),
            'is_public' => true,
            'uploaded_by' => null,
        ];
    }
}
