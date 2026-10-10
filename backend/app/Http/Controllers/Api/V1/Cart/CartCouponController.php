<?php

namespace App\Http\Controllers\Api\V1\Cart;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Cart\CartCouponRequest;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartCouponController extends Controller
{
    use RespondsWithCart;

    public function __construct(private readonly CartService $carts) {}

    /**
     * Applies a discount code. A code that is unknown, expired, used up or below its minimum all
     * give the same 422 — see CouponService.
     */
    public function store(CartCouponRequest $request): JsonResponse
    {
        $cart = $this->carts->forRequest($request);

        $this->carts->applyCoupon($cart, (string) $request->string('code'), $request->user());

        return $this->cartResponse($request, $this->carts, $cart);
    }

    public function destroy(Request $request): JsonResponse
    {
        $cart = $this->carts->forRequest($request);

        $this->carts->removeCoupon($cart);

        return $this->cartResponse($request, $this->carts, $cart);
    }
}
