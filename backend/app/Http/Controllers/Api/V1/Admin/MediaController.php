<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\AdminIndexRequest;
use App\Http\Requests\Admin\MediaUploadRequest;
use App\Http\Resources\MediaResource;
use App\Models\Category;
use App\Models\Media;
use App\Models\Post;
use App\Models\ProductImage;
use App\Services\AuditLogger;
use App\Services\MediaService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * The media library.
 *
 * An upload is routed by what the file *is*: an image goes to the public disk, because a storefront
 * image is meant to be fetched by a browser; anything else (a receipt, a supplier list) is stored
 * privately, outside the document root, and is never reachable by URL. App\Services\MediaService
 * reads the type from the bytes with finfo and refuses anything not on the allowlist, so the choice
 * here is only about visibility, never about trust.
 *
 * Deleting is refused while the file is still in use. The database would not complain —
 * `product_images.media_id` cascades, and the category/post columns simply null out — but a silent
 * cascade would strip images off products with no warning, so this endpoint says no and names the
 * reason.
 */
class MediaController extends Controller
{
    public function __construct(
        private readonly MediaService $media,
        private readonly AuditLogger $audit,
    ) {}

    public function index(AdminIndexRequest $request): AnonymousResourceCollection
    {
        $query = Media::query()->with('uploader:id,name');

        if ($request->term() !== '') {
            $query->where('original_name', 'like', '%'.$request->escapedTerm().'%');
        }

        return MediaResource::collection($query->orderByDesc('id')->paginate($request->perPage(30)));
    }

    public function store(MediaUploadRequest $request): JsonResponse
    {
        $file = $request->file('file');
        $isImage = str_starts_with(mb_strtolower((string) $file->getMimeType()), 'image/');

        $media = $isImage
            ? $this->media->storeImage($file, $request->user())
            : $this->media->storeDocument($file, $request->user());

        $this->audit->log('media.uploaded', $media, [
            'mime' => $media->mime_type,
            'size' => $media->size_bytes,
            'public' => $media->is_public,
        ]);

        return response()->json([
            'data' => ['media' => new MediaResource($media)],
            'message' => 'فایل بارگذاری شد.',
        ], 201);
    }

    public function destroy(Media $media): JsonResponse
    {
        $usage = [];

        if (ProductImage::query()->where('media_id', $media->getKey())->exists()) {
            $usage[] = 'تصویر محصول';
        }

        if (Category::query()->where('image_media_id', $media->getKey())->exists()) {
            $usage[] = 'تصویر دسته‌بندی';
        }

        if (Post::query()->where('cover_media_id', $media->getKey())->exists()) {
            $usage[] = 'تصویر شاخص نوشته';
        }

        if ($usage !== []) {
            return response()->json([
                'message' => 'این فایل هنوز استفاده می‌شود ('.implode('، ', $usage).'). ابتدا ارجاع‌ها را حذف کنید.',
            ], 422);
        }

        $this->media->delete($media);

        $this->audit->log('media.deleted', null, ['media_id' => $media->getKey(), 'name' => $media->original_name]);

        return response()->json(['message' => 'فایل حذف شد.']);
    }
}
