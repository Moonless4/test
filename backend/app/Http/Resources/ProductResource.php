<?php

namespace App\Http\Resources;

use App\Models\Product;
use App\Support\Money;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A product as the storefront renders it.
 *
 * `price` is what the shopper pays (Toman, integer) and `compare_at_price` is the original, shown
 * struck through above it whenever `discount_percent` is greater than zero — the frontend rule and
 * this payload always agree, because both numbers come from the same row.
 *
 * @mixin Product
 */
class ProductResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'slug' => $this->slug,
            'sku' => $this->sku,
            'short_description' => $this->short_description,
            'description' => $this->description,
            'price' => $this->price,
            'compare_at_price' => $this->compare_at_price,
            'discount_percent' => $this->discountPercent(),
            'currency' => Money::CURRENCY,
            'is_in_stock' => $this->isInStock(),
            'stock_quantity' => $this->stock_quantity,
            'attributes' => $this->attributes,
            'category' => new CategoryResource($this->whenLoaded('category')),
            'images' => ProductImageResource::collection($this->whenLoaded('images')),
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
