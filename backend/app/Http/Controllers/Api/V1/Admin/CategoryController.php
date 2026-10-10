<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\AdminIndexRequest;
use App\Http\Requests\Admin\CategoryRequest;
use App\Http\Resources\AdminCategoryResource;
use App\Models\Category;
use App\Services\AuditLogger;
use App\Support\Slug;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;

/**
 * Category administration.
 *
 * `index` returns the whole tree in one response: there are, realistically, a few dozen categories
 * behind a shop, and a paginated tree is unusable in a panel. Each row carries its `parent_id` and a
 * product count, which is what the panel renders.
 *
 * `destroy` refuses to delete a category that still has children or products. The foreign keys would
 * happily orphan them (`nullOnDelete`), but an operator who deletes a category and silently loses
 * the grouping of forty products has been failed by the tool, not by the schema.
 */
class CategoryController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(AdminIndexRequest $request): AnonymousResourceCollection
    {
        $query = Category::query()
            ->with(['image', 'parent:id,name'])
            ->withCount([
                'products',
                'products as active_products_count' => fn ($products) => $products->where('is_active', true),
            ]);

        if ($request->term() !== '') {
            $query->where('name', 'like', '%'.$request->escapedTerm().'%');
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->string('status')->value() === 'active');
        }

        return AdminCategoryResource::collection(
            $query->orderBy('position')->orderBy('name')->get(),
        );
    }

    public function show(Category $category): AdminCategoryResource
    {
        return new AdminCategoryResource(
            $category->load(['image', 'parent:id,name', 'children'])->loadCount([
                'products',
                'products as active_products_count' => fn ($products) => $products->where('is_active', true),
            ]),
        );
    }

    public function store(CategoryRequest $request): JsonResponse
    {
        $data = $request->validated();

        $category = new Category;
        $category->fill(Arr::except($data, ['slug']));
        $category->slug = Arr::get($data, 'slug') ?: Slug::unique(Category::class, (string) $data['name'], 'category');
        $category->save();

        $this->audit->log('category.created', $category, ['slug' => $category->slug]);

        return response()->json([
            'data' => ['category' => new AdminCategoryResource($category->load('image'))],
            'message' => 'دسته‌بندی ایجاد شد.',
        ], 201);
    }

    public function update(CategoryRequest $request, Category $category): JsonResponse
    {
        $data = $request->validated();

        $category->fill(Arr::except($data, ['slug']));

        if (Arr::get($data, 'slug')) {
            $category->slug = $data['slug'];
        }

        $category->save();

        $this->audit->log('category.updated', $category, ['changed' => array_keys($data)]);

        return response()->json([
            'data' => ['category' => new AdminCategoryResource($category->load('image'))],
            'message' => 'دسته‌بندی ذخیره شد.',
        ]);
    }

    public function destroy(Category $category): JsonResponse
    {
        if ($category->children()->exists()) {
            return response()->json([
                'message' => 'این دسته‌بندی زیردسته دارد. ابتدا زیردسته‌ها را منتقل یا حذف کنید.',
            ], 422);
        }

        if ($category->products()->exists()) {
            return response()->json([
                'message' => 'این دسته‌بندی محصول دارد. ابتدا محصولات را به دستهٔ دیگری منتقل کنید، یا دسته را غیرفعال کنید.',
            ], 422);
        }

        $this->audit->log('category.deleted', null, ['slug' => $category->slug, 'name' => $category->name]);

        $category->delete();

        return response()->json(['message' => 'دسته‌بندی حذف شد.']);
    }
}
