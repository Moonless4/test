<?php

namespace App\Http\Resources;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Post
 */
class PostResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'body' => $this->body,
            'tags' => $this->tags,
            'cover' => $this->cover !== null ? new MediaResource($this->cover) : null,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
