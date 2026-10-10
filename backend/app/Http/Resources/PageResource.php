<?php

namespace App\Http\Resources;

use App\Models\Page;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Page
 */
class PageResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'slug' => $this->slug,
            'title' => $this->title,
            // Plain text, never HTML: the API does not emit markup, so a page cannot become a
            // stored-XSS vector for the storefront.
            'body' => $this->body,
            'meta' => $this->meta,
            'published_at' => $this->published_at?->toIso8601String(),
        ];
    }
}
