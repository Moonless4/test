<?php

namespace App\Http\Controllers\Api\V1\Content;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Content\ContentIndexRequest;
use App\Http\Resources\PostResource;
use App\Models\Post;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PostController extends Controller
{
    public function index(ContentIndexRequest $request): AnonymousResourceCollection
    {
        $query = Post::query()->published()->orderByDesc('published_at');

        if (($term = $request->string('q')->trim()->value()) !== '') {
            // Escaped before LIKE: a crawler cannot turn a search into a wildcard scan.
            $escaped = addcslashes($term, '%_\\');
            $query->where(fn ($inner) => $inner->where('title', 'like', "%{$escaped}%"));
        }

        return PostResource::collection(
            $query->paginate(min(max((int) $request->integer('per_page', 10), 1), 24)),
        );
    }

    public function show(string $post): PostResource
    {
        return new PostResource(
            Post::query()->published()->where('slug', $post)->firstOrFail(),
        );
    }
}
