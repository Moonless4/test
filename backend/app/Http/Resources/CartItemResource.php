<?php

namespace App\Http\Resources;

use App\Models\CartItem;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin CartItem
 */
class CartItemResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'product_id' => $this->product_id,
            'quantity' => $this->quantity,
            'unit_price' => $this->unit_price,
            'line_total' => $this->lineTotal(),
            // A line whose product disappeared or went out of stock is flagged rather than hidden,
            // so the cart screen can say what is wrong instead of silently changing the total.
            'is_available' => $this->product !== null && $this->product->is_active,
            'stock_quantity' => $this->product?->stock_quantity,
            'product' => new ProductSummaryResource($this->whenLoaded('product')),
        ];
    }
}
