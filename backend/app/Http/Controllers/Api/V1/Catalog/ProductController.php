<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Catalog\ProductIndexRequest;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ProductSummaryResource;
use App\Services\CatalogService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ProductController extends Controller
{
    public function __construct(private readonly CatalogService $catalog) {}

    /**
     * The catalogue, filterable and paginated. Listing payloads use ProductSummaryResource: a
     * 48-item page must not carry 48 full descriptions.
     */
    public function index(ProductIndexRequest $request): AnonymousResourceCollection
    {
        return ProductSummaryResource::collection(
            $this->catalog->paginate($request->filters()),
        );
    }

    public function show(string $product): ProductResource
    {
        // 404 for anything not published and active — an unpublished draft is not readable by
        // guessing its id, which is why the visibility scope is applied in the query, not after.
        return new ProductResource($this->catalog->findVisibleProduct($product));
    }

    public function related(string $product): AnonymousResourceCollection
    {
        $product = $this->catalog->findVisibleProduct($product);

        return ProductSummaryResource::collection($this->catalog->related($product));
    }
}
