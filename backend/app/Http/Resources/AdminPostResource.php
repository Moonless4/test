<?php

namespace App\Http\Resources;

use App\Models\Post;
use Illuminate\Http\Request;

/**
 * A blog post as the *admin* panel needs it. Same reasoning as AdminPageResource: the storefront
 * only reads published posts, so only the panel has a use for the draft/published flag.
 *
 * @mixin Post
 */
class AdminPostResource extends PostResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            // Same reason as AdminPageResource: `posts/{post}` binds on the primary key.
            'id' => $this->id,
            'status' => $this->status,
        ]);
    }
}
