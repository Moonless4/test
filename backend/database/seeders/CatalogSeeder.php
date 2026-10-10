<?php

namespace Database\Seeders;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

/**
 * A small, real catalogue so the storefront has something to render before the shop fills it.
 *
 * Prices are plain Toman integers, and every discounted product carries both numbers: `price` is
 * what the shopper pays, `compare_at_price` is the original shown struck through above it.
 *
 * Idempotent by slug/sku (updateOrCreate), so the one-shot container setup can re-seed on every
 * start without duplicating or resetting anything.
 */
class CatalogSeeder extends Seeder
{
    /** @var array<string, array{name: string, description: string}> */
    private const CATEGORIES = [
        'women' => ['name' => 'زنانه', 'description' => 'پوشاک و اکسسوری زنانه'],
        'men' => ['name' => 'مردانه', 'description' => 'پوشاک و اکسسوری مردانه'],
        'accessories' => ['name' => 'اکسسوری', 'description' => 'کیف، شال و زیورآلات'],
        'shoes' => ['name' => 'کفش', 'description' => 'کفش و صندل'],
    ];

    /**
     * name, category, sku, price, compare_at_price, stock
     *
     * @var array<int, array{0: string, 1: string, 2: string, 3: int, 4: int|null, 5: int}>
     */
    private const PRODUCTS = [
        ['پالتو پشمی بلند', 'women', 'MD-W-1001', 4850000, 6200000, 12],
        ['مانتو کتان جلو دکمه', 'women', 'MD-W-1002', 2650000, 3100000, 20],
        ['شال نخی طرح‌دار', 'accessories', 'MD-A-2001', 690000, 890000, 45],
        ['کیف چرم دست‌دوز', 'accessories', 'MD-A-2002', 3200000, null, 8],
        ['پیراهن مردانه آستین بلند', 'men', 'MD-M-3001', 1890000, 2350000, 25],
        ['کاپشن زمستانی مردانه', 'men', 'MD-M-3002', 5900000, null, 6],
        ['کتانی روزمره', 'shoes', 'MD-S-4001', 2450000, 2990000, 18],
        ['نیم‌بوت چرم', 'shoes', 'MD-S-4002', 3980000, null, 9],
    ];

    public function run(): void
    {
        $categories = [];

        foreach (self::CATEGORIES as $slug => $category) {
            $categories[$slug] = Category::query()->updateOrCreate(
                ['slug' => $slug],
                [
                    'name' => $category['name'],
                    'description' => $category['description'],
                    'is_active' => true,
                ],
            );
        }

        foreach (self::PRODUCTS as [$name, $categorySlug, $sku, $price, $compareAt, $stock]) {
            Product::query()->updateOrCreate(
                ['sku' => $sku],
                [
                    'category_id' => $categories[$categorySlug]->getKey(),
                    'name' => $name,
                    'slug' => Str::slug($sku).'-'.Str::slug($name),
                    'short_description' => 'محصول آزمایشی برای راه‌اندازی فروشگاه.',
                    'description' => 'این محصول به‌عنوان داده اولیه ثبت شده است و می‌توانید از پنل مدیریت آن را ویرایش یا حذف کنید.',
                    'price' => $price,
                    'compare_at_price' => $compareAt,
                    'stock_quantity' => $stock,
                    'is_active' => true,
                    'is_featured' => $compareAt !== null,
                    'published_at' => now()->subDays(3),
                    'attributes' => ['color' => ['مشکی', 'کرم'], 'size' => ['S', 'M', 'L']],
                ],
            );
        }

        $this->command?->info('Catalogue seeded.');
    }
}
