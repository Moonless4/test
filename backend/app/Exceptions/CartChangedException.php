<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Raised when something in the basket changed between the moment the shopper saw the total and
 * the moment they pressed "pay" — a price moved, a product was unpublished, a coupon expired.
 *
 * The order is refused rather than silently charged at the new price: the shopper must be shown
 * the number they are actually agreeing to. The client refreshes the cart and asks again.
 */
class CartChangedException extends RuntimeException
{
    /**
     * @param  array<int, array{product_id: int, name: string, reason: string}>  $changes
     */
    public function __construct(public readonly array $changes)
    {
        parent::__construct('Your cart has changed. Please review it and try again.');
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'errors' => [
                'cart' => array_map(
                    static fn (array $change): string => sprintf('%s: %s', $change['name'], $change['reason']),
                    $this->changes,
                ),
            ],
        ], 409);
    }
}
