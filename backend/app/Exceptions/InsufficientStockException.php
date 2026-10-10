<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Raised when a cart line cannot be satisfied from stock. Rendered as 409 with a per-product
 * message so the cart screen can point at the exact line instead of showing a generic failure.
 */
class InsufficientStockException extends RuntimeException
{
    /**
     * @param  array<int, array{product_id: int, name: string, requested: int, available: int}>  $shortages
     */
    public function __construct(public readonly array $shortages)
    {
        parent::__construct('Some items are no longer available in the requested quantity.');
    }

    public function render(): \Illuminate\Http\JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'errors' => [
                'items' => array_map(
                    static fn (array $line): string => sprintf(
                        '%s: %d requested, %d available.',
                        $line['name'],
                        $line['requested'],
                        $line['available'],
                    ),
                    $this->shortages,
                ),
            ],
        ], 409);
    }
}
