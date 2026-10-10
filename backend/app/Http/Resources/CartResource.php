<?php

namespace App\Http\Resources;

use App\Models\Cart;
use App\Support\CartTotals;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The basket. Totals come from CartTotals — computed by CartService — and are never assembled here,
 * so the API cannot disagree with the checkout.
 *
 * The guest cart token is deliberately absent: it is returned in the `X-Cart-Token` response header
 * instead, which keeps it out of any JSON body a page might log.
 *
 * @mixin Cart
 */
class CartResource extends JsonResource
{
    public function __construct(Cart $resource, private readonly CartTotals $totals)
    {
        parent::__construct($resource);
    }

    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'items' => CartItemResource::collection($this->whenLoaded('items')),
            'totals' => $this->totals->toArray(),
        ];
    }
}
