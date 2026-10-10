<?php

namespace App\Http\Controllers\Api\V1\Catalog;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\CategoryResource;
use App\Services\CatalogService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CategoryController extends Controller
{
    public function __construct(private readonly CatalogService $catalog) {}

    public function index(): AnonymousResourceCollection
    {
        return CategoryResource::collection($this->catalog->categories());
    }

    public function show(string $category): CategoryResource
    {
        // Only an active category is reachable: a hidden one answers 404, exactly like a
        // non-existent one, so the endpoint cannot be used to discover unpublished structure.
        return new CategoryResource($this->catalog->findActiveCategory($category));
    }
}
