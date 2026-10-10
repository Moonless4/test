<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

/**
 * A catalogue product.
 *
 * Pricing rule that must not drift from the storefront: `compare_at_price` is the *original*
 * price and `price` is what the shopper pays. When `compare_at_price` is set and higher than
 * `price`, every surface renders the original struck through above the discounted price. The
 * discount is always derived here, never stored as a number of its own.
 *
 * `price` and `stock_quantity` are never writable through a request payload directly: price
 * changes go through the admin form request, and stock changes through App\Services\InventoryService
 * so that every movement lands in `stock_movements`.
 */
#[Fillable([
    'category_id', 'name', 'slug', 'sku', 'brand', 'short_description', 'description',
    'price', 'compare_at_price', 'rating', 'stock_quantity', 'low_stock_threshold',
    'is_active', 'is_featured', 'published_at', 'attributes',
])]
class Product extends Model
{
    /** @use HasFactory<\Database\Factories\ProductFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'price' => 'integer',
            'compare_at_price' => 'integer',
            // A float, not a decimal string: the storefront reads the score as a number.
            'rating' => 'float',
            'stock_quantity' => 'integer',
            'low_stock_threshold' => 'integer',
            'is_active' => 'boolean',
            'is_featured' => 'boolean',
            'published_at' => 'datetime',
            'attributes' => 'array',
        ];
    }

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ProductImage::class)->orderBy('position');
    }

    public function coverImage(): HasOne
    {
        return $this->hasOne(ProductImage::class)->orderBy('position');
    }

    /** Products the storefront may show: published and active. */
    public function scopeVisible(Builder $query): Builder
    {
        return $query->where('is_active', true)
            ->whereNotNull('published_at')
            ->where('published_at', '<=', now());
    }

    public function scopeDiscounted(Builder $query): Builder
    {
        return $query->whereNotNull('compare_at_price')
            ->whereColumn('compare_at_price', '>', 'price');
    }

    /**
     * Storefront search. The term is escaped before it reaches LIKE so a shopper cannot inject
     * wildcards ("%") and turn a search into a table scan.
     */
    public function scopeSearch(Builder $query, ?string $term): Builder
    {
        $term = trim((string) $term);

        if ($term === '') {
            return $query;
        }

        $escaped = addcslashes($term, '%_\\');

        return $query->where(function (Builder $inner) use ($escaped) {
            $inner->where('name', 'like', "%{$escaped}%")
                ->orWhere('sku', 'like', "%{$escaped}%");
        });
    }

    public function hasDiscount(): bool
    {
        return $this->compare_at_price !== null && $this->compare_at_price > $this->price;
    }

    public function discountPercent(): int
    {
        if (! $this->hasDiscount()) {
            return 0;
        }

        return (int) floor((($this->compare_at_price - $this->price) / $this->compare_at_price) * 100);
    }

    public function isInStock(): bool
    {
        return $this->stock_quantity > 0;
    }

    public function isLowOnStock(): bool
    {
        return $this->stock_quantity > 0 && $this->stock_quantity <= $this->low_stock_threshold;
    }
}
