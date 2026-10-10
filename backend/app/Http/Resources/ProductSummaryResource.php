<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A product inside a list: everything a card needs, and nothing more. Keeping the heavy fields
 * (`description`, full attribute set) out of listing payloads is what keeps a 48-item page small.
 *
 * @mixin Product
 */
class ProductSummaryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'price' => $this->price,
            'compare_at_price' => $this->compare_at_price,
            'discount_percent' => $this->discountPercent(),
            'currency' => Money::CURRENCY,
            'is_in_stock' => $this->isInStock(),
            'is_featured' => (bool) $this->is_featured,
            // The filter rail derives its size and colour options from the products it was given, so
            // a listing has to carry `attributes` too — a handful of short strings per product.
            'attributes' => $this->attributes,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
        ];
    }
}
