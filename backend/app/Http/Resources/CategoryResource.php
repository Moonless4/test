<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Category
 */
class CategoryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'description' => $this->description,
            'position' => $this->position,
            // `whenLoaded` and not `$this->image`: touching an unloaded relation here would run a
            // query per category (the strict model mode turns that into an error in development,
            // and it would be a silent N+1 in production).
            'image' => $this->whenLoaded('image', fn () => $this->image !== null ? new MediaResource($this->image) : null),
            'products_count' => $this->whenCounted('products'),
            'children' => CategoryResource::collection($this->whenLoaded('children')),
        ];
    }
}
