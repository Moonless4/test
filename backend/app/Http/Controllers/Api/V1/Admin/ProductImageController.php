<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\ProductImageRequest;
use App\Http\Resources\ProductImageResource;
use App\Models\Media;
use App\Models\Product;
use App\Models\ProductImage;
use App\Services\AuditLogger;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;

/**
 * Product gallery.
 *
 * An image is either a fresh upload (validated from its own bytes by App\Services\MediaService) or an
 * existing media row, so one photo can be attached to several products without being stored twice.
 * The position defaults to "after the last one" and is what orders the gallery on the product page.
 *
 * Removing a gallery entry deletes the **link**, not the file: the media library is shared, and a
 * photo that is still used elsewhere must not vanish because it was detached from one product.
 * Deleting the file itself is a deliberate action on the media endpoint.
 */
class ProductImageController extends Controller
{
    public function __construct(
        private readonly MediaService $media,
        private readonly AuditLogger $audit,
    ) {}

    public function store(ProductImageRequest $request, Product $product): JsonResponse
    {
        $media = $request->hasFile('file')
            ? $this->media->storeImage($request->file('file'), $request->user())
            : Media::query()->findOrFail($request->integer('media_id'));

        $image = new ProductImage;
        $image->product_id = $product->getKey();
        $image->media_id = $media->getKey();
        $image->alt = $request->string('alt')->value() ?: null;
        $image->position = $request->filled('position')
            ? (int) $request->integer('position')
            : (int) ProductImage::query()->where('product_id', $product->getKey())->max('position') + 1;
        $image->save();

        $this->audit->log('product.image_added', $product, ['media_id' => $media->getKey()]);

        return response()->json([
            'data' => ['image' => new ProductImageResource($image->load('media'))],
            'message' => 'تصویر افزوده شد.',
        ], 201);
    }

    public function destroy(Product $product, ProductImage $image): JsonResponse
    {
        // The route is nested, so the image must belong to the product in the path — otherwise the
        // id in the URL would be enough to detach an image from somebody else's product.
        abort_unless((int) $image->product_id === (int) $product->getKey(), 404);

        $image->delete();

        $this->audit->log('product.image_removed', $product, ['media_id' => $image->media_id]);

        return response()->json(['message' => 'تصویر حذف شد.']);
    }
}
