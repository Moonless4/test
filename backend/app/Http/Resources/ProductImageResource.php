<?php

namespace App\Http\Resources;

use App\Models\ProductImage;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin ProductImage
 */
class ProductImageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'alt' => $this->alt,
            'position' => $this->position,
            'url' => $this->media?->url(),
            'width' => $this->media?->width,
            'height' => $this->media?->height,
        ];
    }
}
