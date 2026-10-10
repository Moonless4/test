<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PropertyResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'slug' => $this->slug,
            'name' => $this->name,
            'city' => $this->city,
            'region' => $this->region,
            'country' => $this->country,
            'price' => $this->price,
            'type' => $this->type,
            'status' => $this->status,
            'beds' => $this->beds,
            'baths' => $this->baths,
            'area' => $this->area,
            'land' => $this->land,
            'year' => $this->year,
            'featured' => $this->featured,
            'summary' => $this->summary,
            'description' => $this->description ?? [],
            'features' => $this->features ?? [],
            'amenities' => $this->amenities ?? [],
            'imageId' => $this->image_id,
            'gallery' => $this->whenLoaded('images', fn () => $this->images->map(fn ($img) => [
                'id' => $img->unsplash_id,
                'alt' => $img->alt,
            ])),
            'agent' => new AgentResource($this->whenLoaded('agent')),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
