<?php

namespace App\Http\Controllers\Api\V1\Cart;

use App\Http\Resources\CartResource;
use App\Models\Cart;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Shared by the three cart controllers: they all answer with the whole cart, because a partial
 * cart response forces the client to guess what changed. Totals always come from CartService.
 */
trait RespondsWithCart
{
    protected function cartResponse(Request $request, CartService $carts, Cart $cart, int $status = 200): JsonResponse
    {
        $cart->load('items.product', 'coupon');

        $response = (new CartResource($cart, $carts->totals($cart)))->response($request);

        $response->setStatusCode($status);
        $response->setData($response->getData(true));

        return $this->withCartToken($response, $cart);
    }
}
