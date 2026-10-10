<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\AdminIndexRequest;
use App\Http\Requests\Admin\ProductRequest;
use App\Http\Resources\AdminProductResource;
use App\Models\Product;
use App\Services\AuditLogger;
use App\Support\Slug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;

/**
 * Catalogue administration.
 *
 * This is the panel's read/write surface for products. Three rules from the storefront side carry
 * over unchanged:
 *
 *  - **The discount is derived, never stored.** The payload sets `price` and `compare_at_price`;
 *    `discount_percent` is computed by the model, so the panel and the shop window cannot disagree.
 *  - **Stock is not written here.** `stock_quantity` is deliberately absent from ProductRequest and
 *    changes only through App\Services\InventoryService (see ProductStockController), so every
 *    movement lands in `stock_movements`.
 *  - **A slug is generated, never guessed at.** A Persian product name has no ASCII form, so a
 *    missing slug falls back to a `product-…` base rather than an empty string, and collisions get
 *    a numeric suffix.
 *
 * Access is decided by the route middleware (`can:products.view|create|update|delete`), so a missing
 * permission is a 403 before a controller runs.
 */
class ProductController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(AdminIndexRequest $request): AnonymousResourceCollection
    {
        $query = Product::query()->with(['category:id,name,slug', 'images.media', 'coverImage.media']);

        // The model's own scope escapes LIKE wildcards, so a search term cannot become a scan.
        if ($request->term() !== '') {
            $query->search($request->term());
        }

        if ($request->filled('category')) {
            $query->where('category_id', $request->integer('category'));
        }

        match ((string) $request->string('status')->value()) {
            'active' => $query->where('is_active', true),
            'inactive' => $query->where('is_active', false),
            'draft' => $query->whereNull('published_at'),
            'featured' => $query->where('is_featured', true),
            'out_of_stock' => $query->where('stock_quantity', '<=', 0),
            default => null,
        };

        match ((string) $request->string('sort')->value()) {
            'oldest' => $query->orderBy('id'),
            'name' => $query->orderBy('name'),
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            default => $query->orderByDesc('id'),
        };

        return AdminProductResource::collection(
            $query->paginate($request->perPage(20))->withQueryString(),
        );
    }

    public function show(Product $product): AdminProductResource
    {
        return new AdminProductResource($product->load(['category:id,name,slug', 'images.media']));
    }

    public function store(ProductRequest $request): JsonResponse
    {
        $data = $request->validated();

        $product = new Product;
        $product->fill(Arr::except($data, ['slug']));
        $product->slug = Arr::get($data, 'slug') ?: Slug::unique(Product::class, (string) $data['name']);
        $product->save();

        $this->audit->log('product.created', $product, [
            'slug' => $product->slug,
            'price' => $product->price,
        ]);

        return response()->json([
            'data' => ['product' => new AdminProductResource($product->load(['category', 'images.media']))],
            'message' => 'محصول ایجاد شد.',
        ], 201);
    }

    public function update(ProductRequest $request, Product $product): JsonResponse
    {
        $data = $request->validated();

        // Only what the payload actually carried is written, so a PATCH that changes the price
        // cannot blank out the description.
        $product->fill(Arr::except($data, ['slug']));

        if (Arr::get($data, 'slug')) {
            $product->slug = $data['slug'];
        }

        $before = ['price' => $product->getOriginal('price'), 'is_active' => $product->getOriginal('is_active')];
        $product->save();

        $this->audit->log('product.updated', $product, [
            'changed' => array_keys($data),
            'price_before' => $before['price'],
            'price_after' => $product->price,
        ]);

        return response()->json([
            'data' => ['product' => new AdminProductResource($product->load(['category', 'images.media']))],
            'message' => 'محصول ذخیره شد.',
        ]);
    }

    /**
     * Products are removed outright (there is no soft-delete column), which is why the audit row
     * keeps the slug, sku and name: the history survives the row it describes. Order lines keep
     * their own copy of the name and sku and simply lose the product link, so a past order still
     * reads correctly.
     */
    public function destroy(Product $product): JsonResponse
    {
        $this->audit->log('product.deleted', null, [
            'slug' => $product->slug,
            'sku' => $product->sku,
            'name' => $product->name,
        ]);

        $product->delete();

        return response()->json(['message' => 'محصول حذف شد.']);
    }
}
