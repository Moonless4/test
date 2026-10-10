<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * The shopper's own orders.
 *
 * `index()` only ever lists the caller's orders (`where user_id`), and `show()` is reachable two
 * ways: the owner's session, or the one-time access token a guest order was created with. Anything
 * else answers **404**, never 403 — a 403 would confirm that the order exists, which is exactly
 * what somebody probing order numbers wants to learn.
 */
class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        return OrderResource::collection(
            Order::query()
                ->where('user_id', $request->user()->getKey())
                ->orderByDesc('placed_at')
                ->orderByDesc('id')
                ->paginate(min(max((int) $request->integer('per_page', 15), 1), 50)),
        );
    }

    public function show(Request $request, Order $order): JsonResponse
    {
        // Optional authentication: this route is public so a guest can read their own order with
        // the token, and `user('sanctum')` still resolves a bearer token when one is sent.
        $user = $request->user('sanctum');
        $token = trim((string) $request->header('X-Order-Token', ''));

        if (! $order->isAccessibleWith($user?->getKey(), $token !== '' ? $token : null)) {
            abort(404);
        }

        return response()->json([
            'data' => [
                'order' => new OrderResource($order->load('items', 'payments', 'statusHistories')),
            ],
        ]);
    }
}
