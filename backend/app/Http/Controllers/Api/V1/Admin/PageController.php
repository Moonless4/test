<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\AdminIndexRequest;
use App\Http\Requests\Admin\PageRequest;
use App\Http\Resources\AdminPageResource;
use App\Models\Page;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;

/**
 * Content pages (about, contact, terms…).
 *
 * Drafts are visible here and nowhere else: the public endpoint filters on the `published` scope, so
 * the only way to see an unfinished page is with the `content.manage` permission. Publishing is
 * therefore a data change (`status` + `published_at`), not a deployment.
 */
class PageController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(AdminIndexRequest $request): AnonymousResourceCollection
    {
        $query = Page::query();

        if ($request->term() !== '') {
            $term = $request->escapedTerm();
            $query->where(fn ($inner) => $inner
                ->where('title', 'like', '%'.$term.'%')
                ->orWhere('slug', 'like', '%'.$term.'%'));
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->string('status')->value());
        }

        return AdminPageResource::collection($query->orderByDesc('id')->paginate($request->perPage(20)));
    }

    public function show(Page $page): AdminPageResource
    {
        return new AdminPageResource($page);
    }

    public function store(PageRequest $request): JsonResponse
    {
        $page = new Page;
        $page->fill($request->validated());
        $page->save();

        $this->audit->log('page.created', $page, ['slug' => $page->slug, 'status' => $page->status]);

        return response()->json([
            'data' => ['page' => new AdminPageResource($page)],
            'message' => 'صفحه ایجاد شد.',
        ], 201);
    }

    public function update(PageRequest $request, Page $page): JsonResponse
    {
        $data = $request->validated();

        // The slug is the page's public address: changing it silently would break every link to it,
        // so it is only ever changed when the payload explicitly carries a new one.
        if (! Arr::has($data, 'slug')) {
            unset($data['slug']);
        }

        $page->fill($data);
        $page->save();

        $this->audit->log('page.updated', $page, ['slug' => $page->slug, 'changed' => array_keys($data)]);

        return response()->json([
            'data' => ['page' => new AdminPageResource($page)],
            'message' => 'صفحه ذخیره شد.',
        ]);
    }

    public function destroy(Page $page): JsonResponse
    {
        $this->audit->log('page.deleted', null, ['slug' => $page->slug, 'title' => $page->title]);

        $page->delete();

        return response()->json(['message' => 'صفحه حذف شد.']);
    }
}
