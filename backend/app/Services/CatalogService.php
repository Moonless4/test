<?php

namespace App\Services;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Database\Eloquent\Collection;

/**
 * Read side of the catalogue. Controllers never build a query themselves: the filter set is
 * defined once here, so `/products` and `/search` cannot drift apart, and every scope used is
 * declared on the model.
 */
class CatalogService
{
    private const MAX_PER_PAGE = 48;

    private const DEFAULT_PER_PAGE = 12;

    /**
     * @param  array<string, mixed>  $filters
     */
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Product::query()
            ->visible()
            ->with(['category:id,name,slug', 'images.media']);

        if (! empty($filters['category'])) {
            $category = Category::query()
                ->where('slug', $filters['category'])
                ->orWhere('id', $filters['category'])
                ->first();

            // An unknown category must return nothing, never everything: a typo in a URL must not
            // turn into "show me the whole catalogue".
            $query->where('category_id', $category?->getKey() ?? 0);
        }

        if (! empty($filters['q'])) {
            $query->search((string) $filters['q']);
        }

        if (isset($filters['min_price'])) {
            $query->where('price', '>=', (int) $filters['min_price']);
        }

        if (isset($filters['max_price'])) {
            $query->where('price', '<=', (int) $filters['max_price']);
        }

        if (! empty($filters['discounted'])) {
            $query->discounted();
        }

        if (! empty($filters['featured'])) {
            $query->where('is_featured', true);
        }

        // Whitelisted sorts only — a client cannot inject a column name.
        match ($filters['sort'] ?? 'newest') {
            'price_asc' => $query->orderBy('price'),
            'price_desc' => $query->orderByDesc('price'),
            'name' => $query->orderBy('name'),
            'discount' => $query->discounted()->orderByRaw('(compare_at_price - price) / compare_at_price DESC'),
            default => $query->orderByDesc('published_at')->orderByDesc('id'),
        };

        $perPage = (int) ($filters['per_page'] ?? self::DEFAULT_PER_PAGE);

        return $query->paginate(min(max($perPage, 1), self::MAX_PER_PAGE))->withQueryString();
    }

    public function findVisibleProduct(int|string $key): Product
    {
        return Product::query()
            ->visible()
            ->with(['category:id,name,slug', 'images.media'])
            ->where(fn ($query) => $query->where('id', $key)->orWhere('slug', $key))
            ->firstOrFail();
    }

    /**
     * @return Collection<int, Product>
     */
    public function related(Product $product, int $limit = 8): Collection
    {
        if ($product->category_id === null) {
            return new Collection;
        }

        return Product::query()
            ->visible()
            ->where('category_id', $product->category_id)
            ->whereKeyNot($product->getKey())
            ->with(['category:id,name,slug', 'images.media'])
            ->orderByDesc('is_featured')
            ->orderByDesc('published_at')
            ->limit(min(max($limit, 1), 24))
            ->get();
    }

    /**
     * @return Collection<int, Category>
     */
    public function categories(): Collection
    {
        return Category::query()
            ->active()
            ->ordered()
            ->with(['image'])
            ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
            ->get();
    }

    public function findActiveCategory(int|string $key): Category
    {
        return Category::query()
            ->active()
            ->with('image')
            ->withCount(['products' => fn ($query) => $query->where('is_active', true)])
            ->where(fn ($query) => $query->where('id', $key)->orWhere('slug', $key))
            ->firstOrFail();
    }
}
