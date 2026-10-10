<?php

namespace Tests\Feature\Admin;

use App\Models\Category;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductImage;
use App\Models\StockMovement;
use App\Models\User;
use Database\Seeders\RoleAndPermissionSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Tests\TestCase;

/**
 * The catalogue half of the panel: products, the stock ledger, the gallery and categories.
 *
 * The interesting assertions are the ones about what the panel may *not* do — write stock without a
 * ledger row, leave a category with orphans behind, or accept an "original" price below the price
 * actually charged.
 */
class AdminCatalogTest extends TestCase
{
    use RefreshDatabase;

    /** A real 1×1 PNG, so the byte-level MIME check in App\Services\MediaService has something to sniff. */
    private const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=';

    private function admin(string $role = 'super-admin'): User
    {
        $this->seed(RoleAndPermissionSeeder::class);

        $user = User::factory()->create();
        $user->assignRole($role);

        return $user;
    }

    public function test_a_product_can_be_created_and_gets_a_slug_of_its_own(): void
    {
        $admin = $this->admin();
        $category = Category::factory()->create();

        $response = $this->actingAsStaff($admin)->postJson('/api/v1/admin/products', [
            'name' => 'شلوار جین',
            'sku' => 'JN-1001',
            'price' => 1_250_000,
            'category_id' => $category->getKey(),
            'is_active' => true,
        ])->assertCreated();

        // A Persian name has no ASCII form, so the slug must still be something usable — not "".
        $slug = $response->json('data.product.slug');
        $this->assertNotEmpty($slug);
        $this->assertSame(1_250_000, $response->json('data.product.price'));

        // A second product with the same name must not collide with the first.
        $second = $this->actingAsStaff($admin)->postJson('/api/v1/admin/products', [
            'name' => 'شلوار جین',
            'sku' => 'JN-1002',
            'price' => 1_250_000,
        ])->assertCreated();

        $this->assertNotSame($slug, $second->json('data.product.slug'));
        $this->assertSame(2, Product::query()->count());
    }

    public function test_the_original_price_must_be_higher_than_the_price_charged(): void
    {
        $admin = $this->admin();

        $this->actingAsStaff($admin)->postJson('/api/v1/admin/products', [
            'name' => 'پیراهن',
            'sku' => 'SH-1',
            'price' => 900_000,
            'compare_at_price' => 800_000,
        ])->assertStatus(422)->assertJsonValidationErrors('compare_at_price');

        $this->assertSame(0, Product::query()->count());
    }

    public function test_an_update_leaves_the_fields_it_did_not_carry_alone(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create(['price' => 1_000_000, 'description' => 'توضیح اصلی']);

        $this->actingAsStaff($admin)
            ->patchJson("/api/v1/admin/products/{$product->id}", ['price' => 1_100_000])
            ->assertOk();

        $product->refresh();

        $this->assertSame(1_100_000, $product->price);
        $this->assertSame('توضیح اصلی', $product->description);

        $this->assertDatabaseHas('audit_logs', ['event' => 'product.updated']);
    }

    public function test_stock_changes_go_through_the_ledger(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create(['stock_quantity' => 5]);

        $this->actingAsStaff($admin)
            ->putJson("/api/v1/admin/products/{$product->id}/stock", [
                'stock_quantity' => 12,
                'note' => 'شمارش انبار',
            ])
            ->assertOk()
            ->assertJsonPath('data.product.stock_quantity', 12);

        $this->assertSame(12, $product->fresh()->stock_quantity);

        $movement = StockMovement::query()->where('product_id', $product->getKey())->sole();

        $this->assertSame(7, $movement->delta);
        $this->assertSame(StockMovement::REASON_CORRECTION, $movement->reason);
        $this->assertSame($admin->getKey(), $movement->user_id);
        $this->assertDatabaseHas('audit_logs', ['event' => 'product.stock_adjusted']);
    }

    public function test_a_payload_cannot_write_stock_directly(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create(['stock_quantity' => 5]);

        // `stock_quantity` is not part of the product rules at all, so it is ignored rather than
        // applied — the number only ever moves through the inventory service.
        $this->actingAsStaff($admin)
            ->patchJson("/api/v1/admin/products/{$product->id}", ['stock_quantity' => 999])
            ->assertOk();

        $this->assertSame(5, $product->fresh()->stock_quantity);
        $this->assertSame(0, StockMovement::query()->count());
    }

    public function test_a_deleted_product_keeps_its_identity_in_the_audit_trail(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create(['sku' => 'DEL-1']);

        $this->actingAsStaff($admin)
            ->deleteJson("/api/v1/admin/products/{$product->id}")
            ->assertOk();

        $this->assertDatabaseMissing('products', ['id' => $product->getKey()]);
        $this->assertDatabaseHas('audit_logs', ['event' => 'product.deleted']);
    }

    public function test_the_admin_list_shows_products_the_storefront_hides(): void
    {
        $admin = $this->admin();
        Product::factory()->create();
        Product::factory()->draft()->create();

        $this->actingAsStaff($admin)
            ->getJson('/api/v1/admin/products')
            ->assertOk()
            ->assertJsonPath('meta.total', 2);

        // The public catalogue applies the `visible` scope, so the draft is not there.
        $this->getJson('/api/v1/products')->assertOk()->assertJsonPath('meta.total', 1);

        $this->actingAsStaff($admin)
            ->getJson('/api/v1/admin/products?status=draft')
            ->assertOk()
            ->assertJsonPath('meta.total', 1);
    }

    public function test_an_existing_library_image_can_be_attached_and_detached(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create();
        $media = Media::factory()->create();

        $response = $this->actingAsStaff($admin)
            ->postJson("/api/v1/admin/products/{$product->id}/images", [
                'media_id' => $media->getKey(),
                'alt' => 'نمای جلو',
            ])
            ->assertCreated();

        $imageId = $response->json('data.image.id');
        $this->assertSame('نمای جلو', $response->json('data.image.alt'));

        $this->actingAsStaff($admin)
            ->deleteJson("/api/v1/admin/products/{$product->id}/images/{$imageId}")
            ->assertOk();

        $this->assertSame(0, ProductImage::query()->count());
        // The library entry stays: the file is shared, only the link was removed.
        $this->assertDatabaseHas('media', ['id' => $media->getKey()]);
    }

    public function test_an_uploaded_image_lands_in_the_public_library(): void
    {
        Storage::fake('public');

        $admin = $this->admin();

        $response = $this->actingAsStaff($admin)->postJson('/api/v1/admin/media', [
            'file' => UploadedFile::fake()->createWithContent('photo.png', base64_decode(self::PNG)),
        ])->assertCreated();

        $this->assertSame('image/png', $response->json('data.media.mime_type'));
        $this->assertTrue($response->json('data.media.is_public'));
        $this->assertNotEmpty($response->json('data.media.url'));

        $media = Media::query()->sole();
        Storage::disk('public')->assertExists($media->path);
        $this->assertDatabaseHas('audit_logs', ['event' => 'media.uploaded']);
    }

    public function test_a_file_that_is_not_an_allowed_type_is_refused(): void
    {
        Storage::fake('public');

        $admin = $this->admin();

        // Named like an image, but the bytes are PHP: the MIME check reads the content, not the name.
        $this->actingAsStaff($admin)->postJson('/api/v1/admin/media', [
            'file' => UploadedFile::fake()->createWithContent('shell.php', '<?php echo "pwned";'),
        ])->assertStatus(422)->assertJsonValidationErrors('file');

        $this->assertSame(0, Media::query()->count());
    }

    public function test_media_that_is_still_in_use_cannot_be_deleted(): void
    {
        $admin = $this->admin();
        $product = Product::factory()->create();
        $media = Media::factory()->create();

        ProductImage::query()->create([
            'product_id' => $product->getKey(),
            'media_id' => $media->getKey(),
            'position' => 1,
        ]);

        $this->actingAsStaff($admin)
            ->deleteJson("/api/v1/admin/media/{$media->getKey()}")
            ->assertStatus(422);

        $this->assertDatabaseHas('media', ['id' => $media->getKey()]);
    }

    public function test_a_category_with_children_or_products_is_not_deleted(): void
    {
        $admin = $this->admin();

        $parent = Category::factory()->create();
        Category::factory()->create(['parent_id' => $parent->getKey()]);

        $this->actingAsStaff($admin)
            ->deleteJson("/api/v1/admin/categories/{$parent->id}")
            ->assertStatus(422);

        $withProduct = Category::factory()->create();
        Product::factory()->create(['category_id' => $withProduct->getKey()]);

        $this->actingAsStaff($admin)
            ->deleteJson("/api/v1/admin/categories/{$withProduct->id}")
            ->assertStatus(422);

        $empty = Category::factory()->create();

        $this->actingAsStaff($admin)
            ->deleteJson("/api/v1/admin/categories/{$empty->id}")
            ->assertOk();

        $this->assertDatabaseMissing('categories', ['id' => $empty->getKey()]);
    }

    public function test_a_category_cannot_be_moved_under_its_own_descendant(): void
    {
        $admin = $this->admin();

        $parent = Category::factory()->create();
        $child = Category::factory()->create(['parent_id' => $parent->getKey()]);

        $this->actingAsStaff($admin)
            ->patchJson("/api/v1/admin/categories/{$parent->id}", ['parent_id' => $child->getKey()])
            ->assertStatus(422)
            ->assertJsonValidationErrors('parent_id');
    }
}
