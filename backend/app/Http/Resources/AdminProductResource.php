<?php

namespace App\Http\Resources;

use App\Models\Product;
use Illuminate\Http\Request;

/**
 * A product as the *admin* panel needs it: the storefront fields, plus the ones the public payload
 * deliberately hides.
 *
 * `is_active`, `is_featured` and `low_stock_threshold` decide whether a product is visible at all,
 * so an editor has to see them. `stock_quantity` is read-only here — it is written through
 * App\Services\InventoryService so every change lands in `stock_movements`.
 *
 * @mixin Product
 */
class AdminProductResource extends ProductResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'category_id' => $this->category_id,
            'is_active' => (bool) $this->is_active,
            'is_featured' => (bool) $this->is_featured,
            'low_stock_threshold' => $this->low_stock_threshold,
            'is_low_on_stock' => $this->isLowOnStock(),
            'created_at' => $this->created_at?->toIso8601String(),
            'updated_at' => $this->updated_at?->toIso8601String(),
        ]);
    }
}
