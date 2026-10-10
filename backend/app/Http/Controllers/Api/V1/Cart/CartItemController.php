<?php

namespace App\Http\Controllers\Api\V1\Cart;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Cart\CartItemStoreRequest;
use App\Http\Requests\Cart\CartItemUpdateRequest;
use App\Models\Product;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Cart lines.
 *
 * The cart is always resolved from the request (account or guest token); no endpoint accepts a cart
 * id, so one shopper can never reach another's basket by guessing a number. Whether a product may
 * be sold is decided by CartService, not here.
 */
class CartItemController extends Controller
{
    use RespondsWithCart;

    public function __construct(private readonly CartService $carts) {}

    public function store(CartItemStoreRequest $request): JsonResponse
    {
        $cart = $this->carts->forRequest($request);

        // `visible()` means an unpublished or deactivated product cannot be added to a cart.
        $product = Product::query()->visible()->whereKey($request->integer('product_id'))->firstOrFail();

        $this->carts->addItem($cart, $product, $request->integer('quantity'));

        return $this->cartResponse($request, $this->carts, $cart, 201);
    }

    public function update(CartItemUpdateRequest $request, int $product): JsonResponse
    {
        $cart = $this->carts->forRequest($request);

        $model = Product::query()->visible()->whereKey($product)->firstOrFail();

        // A quantity of zero removes the line.
        $this->carts->updateQuantity($cart, $model, $request->integer('quantity'));

        return $this->cartResponse($request, $this->carts, $cart);
    }

    public function destroy(Request $request, int $product): JsonResponse
    {
        $cart = $this->carts->forRequest($request);

        // Not `firstOrFail`: removing something that is already gone is success, not an error.
        $model = Product::query()->whereKey($product)->first();

        if ($model !== null) {
            $this->carts->removeItem($cart, $model);
        }

        return $this->cartResponse($request, $this->carts, $cart);
    }
}
