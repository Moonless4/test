<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\AdminIndexRequest;
use App\Http\Requests\Admin\PostRequest;
use App\Http\Resources\AdminPostResource;
use App\Models\Post;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;

/**
 * Blog administration.
 *
 * `author_id` defaults to the administrator who creates the post, so a byline never lands on a
 * colleague by accident. Otherwise this is the same draft/published model as pages: the public list
 * applies the `published` scope, this one does not.
 */
class PostController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(AdminIndexRequest $request): AnonymousResourceCollection
    {
        $query = Post::query()->with('cover');

        if ($request->term() !== '') {
            $term = $request->escapedTerm();
            $query->where(fn ($inner) => $inner
                ->where('title', 'like', '%'.$term.'%')
                ->orWhere('slug', 'like', '%'.$term.'%'));
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->string('status')->value());
        }

        return AdminPostResource::collection($query->orderByDesc('id')->paginate($request->perPage(20)));
    }

    public function show(Post $post): AdminPostResource
    {
        return new AdminPostResource($post->load('cover'));
    }

    public function store(PostRequest $request): JsonResponse
    {
        $data = $request->validated();

        $post = new Post;
        $post->fill($data);
        $post->author_id = $data['author_id'] ?? $request->user()?->getKey();
        $post->save();

        $this->audit->log('post.created', $post, ['slug' => $post->slug, 'status' => $post->status]);

        return response()->json([
            'data' => ['post' => new AdminPostResource($post->load('cover'))],
            'message' => 'نوشته ایجاد شد.',
        ], 201);
    }

    public function update(PostRequest $request, Post $post): JsonResponse
    {
        $data = $request->validated();

        // Like a page's slug, a post's slug is its public address; it only changes when the payload
        // carries a new one.
        if (! Arr::has($data, 'slug')) {
            unset($data['slug']);
        }

        $post->fill($data);
        $post->save();

        $this->audit->log('post.updated', $post, ['slug' => $post->slug, 'changed' => array_keys($data)]);

        return response()->json([
            'data' => ['post' => new AdminPostResource($post->load('cover'))],
            'message' => 'نوشته ذخیره شد.',
        ]);
    }

    public function destroy(Post $post): JsonResponse
    {
        $this->audit->log('post.deleted', null, ['slug' => $post->slug, 'title' => $post->title]);

        $post->delete();

        return response()->json(['message' => 'نوشته حذف شد.']);
    }
}
