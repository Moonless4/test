<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

/**
 * The filter rail's own options (`GET /products/filters`).
 *
 * They are read from the whole published catalogue so the rail is the same on every screen, and the
 * route has to stay ahead of `products/{product}` — otherwise a shopper asking for the options is
 * answered with "no such product".
 */
class CatalogFiltersTest extends TestCase
{
    use RefreshDatabase;

    public function test_it_lists_the_sizes_colours_and_brands_the_catalogue_carries(): void
    {
        $category = Category::factory()->create();

        Product::factory()->for($category)->create([
            'brand' => 'MEDORA',
            'attributes' => ['size' => ['S', 'M'], 'color' => ['مشکی'], 'جنس' => ['کتان طبیعی']],
        ]);

        Product::factory()->for($category)->create([
            'brand' => 'ATRI',
            'attributes' => ['size' => ['39', '40'], 'color' => ['کرم'], 'جنس' => ['چرم طبیعی']],
        ]);

        $this->getJson('/api/v1/products/filters')
            ->assertOk()
            ->assertJsonPath('data.sizes', ['S', 'M', '39', '40'])
            ->assertJsonPath('data.colors', ['مشکی', 'کرم'])
            ->assertJsonPath('data.brands', ['MEDORA', 'ATRI']);
    }

    public function test_an_unpublished_product_contributes_no_option(): void
    {
        Product::factory()->draft()->create([
            'brand' => 'HIDDEN',
            'attributes' => ['size' => ['XXL'], 'color' => ['زیتونی']],
        ]);

        $this->getJson('/api/v1/products/filters')
            ->assertOk()
            ->assertJsonPath('data.sizes', [])
            ->assertJsonPath('data.colors', [])
            ->assertJsonPath('data.brands', []);
    }

    public function test_a_query_never_narrows_the_options(): void
    {
        // The rail is the catalogue's, not one page's: asking with a query must not shrink it.
        Product::factory()->create(['attributes' => ['size' => ['S']]]);
        Product::factory()->create(['attributes' => ['size' => ['XXL']]]);

        $this->getJson('/api/v1/products/filters?q=کت&category=nothing')
            ->assertOk()
            ->assertJsonPath('data.sizes', ['S', 'XXL']);
    }
}
