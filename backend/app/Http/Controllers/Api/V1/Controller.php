<?php

namespace App\Http\Controllers\Api\V1;

use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use App\Models\Cart;
use Illuminate\Http\JsonResponse;

/**
 * Base controller for the API.
 *
 * Two pieces of cross-cutting behaviour live here:
 *
 *  - `AuthorizesRequests` — every controller can call `$this->authorize(...)`, so ownership is
 *    checked through a policy rather than by comparing ids in a controller by hand.
 *  - `withCartToken` — the guest cart token travels back in a response header, never in a JSON body
 *    that a page might log or cache.
 */
abstract class Controller
{
    use AuthorizesRequests;

    protected function withCartToken(JsonResponse $response, ?Cart $cart): JsonResponse
    {
        if ($cart?->token !== null) {
            $response->headers->set('X-Cart-Token', (string) $cart->token);
        }

        return $response;
    }
}
