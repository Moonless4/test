<?php

namespace App\Http\Controllers\Api\V1\Checkout;

use App\Http\Controllers\Api\V1\Controller;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Where the payment gateway sends the shopper's browser back.
 *
 * Nothing here is trusted from the query string except which transaction is being confirmed:
 * `Authority` identifies the payment row, and the **amount comes from that row**, never from the
 * callback. The gateway's own verification then decides whether the money actually moved.
 *
 * Only the order number and the statuses are returned — a browser-visible URL must not become a way
 * to read somebody's order details. The shopper's own client already holds the order access token.
 *
 * `settle()` is idempotent: a refresh, or a gateway that calls twice, cannot double-apply anything.
 */
class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $payments) {}

    public function callback(Request $request): JsonResponse
    {
        $authority = (string) $request->query('Authority', '');
        $status = (string) $request->query('Status', '');

        if ($authority === '') {
            return response()->json(['message' => 'درخواست پرداخت نامعتبر است.'], 400);
        }

        $order = $this->payments->settle($authority, $status);

        $returnUrl = config('payments.frontend_return_url');

        // If the shop configured where the shopper should land, send them there with the result;
        // otherwise answer with the minimum a client needs to show the outcome.
        if (is_string($returnUrl) && $returnUrl !== '') {
            return response()->json([
                'data' => [
                    'order_number' => $order->number,
                    'status' => $order->status->value,
                    'payment_status' => $order->payment_status->value,
                    'return_url' => $returnUrl.'?order='.urlencode((string) $order->number)
                        .'&payment='.urlencode($order->payment_status->value),
                ],
            ]);
        }

        return response()->json([
            'data' => [
                'order_number' => $order->number,
                'status' => $order->status->value,
                'payment_status' => $order->payment_status->value,
            ],
        ]);
    }
}
