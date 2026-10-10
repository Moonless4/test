<?php

namespace App\Http\Controllers\Api\V1\Checkout;

use App\Exceptions\PaymentGatewayException;
use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Checkout\CheckoutRequest;
use App\Http\Requests\Checkout\RecordOrderRequest;
use App\Http\Resources\OrderResource;
use App\Services\CartService;
use App\Services\CheckoutService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;

/**
 * Checkout: turn the basket into an order, then open a payment for it.
 *
 * The order is committed *before* the gateway is called, and a gateway failure does not undo it —
 * the shopper keeps an order they can pay for in a moment, instead of losing the basket because a
 * bank was briefly unreachable. That is why a failed gateway call still answers 201 with the order
 * and a `payment.error`, and only a genuine problem with the basket answers 4xx.
 *
 * A guest checkout is allowed; its response is the only place the order's access token is ever
 * revealed, and it is what lets that guest read the order afterwards.
 */
class CheckoutController extends Controller
{
    public function __construct(
        private readonly CartService $carts,
        private readonly CheckoutService $checkout,
        private readonly PaymentService $payments,
    ) {}

    public function store(CheckoutRequest $request): JsonResponse
    {
        // Checkout is open to guests, so there is no auth middleware on this route: the sanctum
        // guard is asked directly, which is what attaches a signed-in shopper's order to their
        // account (and what makes CartService resolve *their* cart instead of a new guest one).
        $user = $request->user('sanctum');

        $cart = $this->carts->forRequest($request);

        $order = $this->checkout->place($cart, $request->validated(), $user);

        $paymentPayload = ['status' => 'pending', 'redirect_url' => null, 'error' => null];

        try {
            $payment = $this->payments->start($order, $user);

            $paymentPayload = [
                'status' => $payment->status->value,
                'redirect_url' => $this->payments->redirectUrl($payment),
                'error' => null,
            ];
        } catch (PaymentGatewayException $exception) {
            // Recorded on the order as well, so support sees why the gateway was not reached.
            $paymentPayload['status'] = 'failed';
            $paymentPayload['error'] = $exception->getMessage();
        }

        return response()->json([
            'data' => [
                'order' => (new OrderResource($order->load('items', 'payments')))->withAccessToken(),
                'payment' => $paymentPayload,
            ],
        ], 201);
    }

    /**
     * A purchase the storefront already finished and paid for in the browser.
     *
     * This is a route of its own rather than a mode of `store()` because there is no server-side
     * cart to hand over and no gateway to open here: the shopper's own checkout collected the
     * money. The order is written so the shop's panel and the shopper's account finally share one
     * record, and the response carries the same access token `store()` returns.
     */
    public function record(RecordOrderRequest $request): JsonResponse
    {
        $order = $this->checkout->record(
            $request->validated(),
            $request->user('sanctum'),
        );

        return response()->json([
            'data' => ['order' => (new OrderResource($order))->withAccessToken()],
        ], 201);
    }
}
