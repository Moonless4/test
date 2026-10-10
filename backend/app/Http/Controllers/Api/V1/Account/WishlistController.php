<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\ProductSummaryResource;
use App\Models\Product;
use App\Models\WishlistItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;

class WishlistController extends Controller
{
    /**
     * The wishlist is always the caller's own: it is queried by `user_id` and never by an id from
     * the request, so there is no way to address somebody else's list.
     */
    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::query()
            ->visible()
            ->with(['category', 'images.media'])
            ->whereIn('id', WishlistItem::query()
                ->where('user_id', $request->user()->getKey())
                ->select('product_id'))
            ->get();

        return ProductSummaryResource::collection($products);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'product_id' => ['required', 'integer', Rule::exists(Product::class, 'id')],
        ]);

        $user = $request->user();

        // firstOrCreate + the unique key make a double tap harmless instead of a duplicate row.
        WishlistItem::query()->firstOrCreate([
            'user_id' => $user->getKey(),
            'product_id' => $validated['product_id'],
        ]);

        return response()->json([
            'message' => 'به علاقه‌مندی‌ها اضافه شد.',
            'data' => ['product_id' => (int) $validated['product_id']],
        ], 201);
    }

    public function destroy(Request $request, int $product): JsonResponse
    {
        WishlistItem::query()
            ->where('user_id', $request->user()->getKey())
            ->where('product_id', $product)
            ->delete();

        return response()->json(['message' => 'از علاقه‌مندی‌ها حذف شد.']);
    }
}
