<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\ProductStockRequest;
use App\Http\Resources\AdminProductResource;
use App\Models\Product;
use App\Services\AuditLogger;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;

/**
 * Deliberate stock corrections.
 *
 * The controller does not touch `products.stock_quantity` itself: it hands the absolute quantity to
 * App\Services\InventoryService, which locks the row, computes the delta and writes a
 * `stock_movements` row in the same transaction. There is therefore no path — panel, checkout or
 * script — that changes stock without leaving a trace.
 */
class ProductStockController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly AuditLogger $audit,
    ) {}

    public function update(ProductStockRequest $request, Product $product): JsonResponse
    {
        $before = (int) $product->stock_quantity;

        $this->inventory->adjust(
            $product,
            (int) $request->integer('stock_quantity'),
            $request->user(),
            $request->string('note')->value() ?: null,
        );

        $product->refresh();

        $this->audit->log('product.stock_adjusted', $product, [
            'before' => $before,
            'after' => (int) $product->stock_quantity,
            'note' => $request->string('note')->value() ?: null,
        ]);

        return response()->json([
            'data' => ['product' => new AdminProductResource($product->load('images.media'))],
            'message' => 'موجودی به‌روزرسانی شد.',
        ]);
    }
}
