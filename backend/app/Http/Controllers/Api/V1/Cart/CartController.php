<?php

namespace App\Http\Controllers\Api\V1\Cart;

use App\Http\Controllers\Api\V1\Controller;
use App\Services\AuditLogger;
use App\Services\CartService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    use RespondsWithCart;

    public function __construct(
        private readonly CartService $carts,
        private readonly AuditLogger $audit,
    ) {}

    /**
     * The current basket. A guest gets one created here, and its token comes back in the
     * `X-Cart-Token` header.
     */
    public function show(Request $request): JsonResponse
    {
        return $this->cartResponse($request, $this->carts, $this->carts->forRequest($request));
    }

    /**
     * Hands a guest basket to the signed-in account. CartService does the merge (never exceeding
     * stock) and retires the guest token, so the basket follows the shopper through registration.
     */
    public function merge(Request $request): JsonResponse
    {
        $user = $request->user();
        $token = $this->carts->token($request);

        // forRequest() resolves the account's cart and merges the guest cart named by the header.
        $cart = $this->carts->forRequest($request);

        if ($token !== null) {
            $this->audit->log('cart.merged', $cart, ['guest_token_used' => true], $user);
        }

        return $this->cartResponse($request, $this->carts, $cart);
    }
}
