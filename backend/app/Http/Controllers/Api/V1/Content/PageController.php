<?php

namespace App\Http\Controllers\Api\V1\Content;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\PageResource;
use App\Models\Page;

class PageController extends Controller
{
    public function show(string $page): PageResource
    {
        // `published()` filters drafts *and* future-dated pages in the query, so a draft slug is
        // indistinguishable from a missing one.
        return new PageResource(
            Page::query()->published()->where('slug', $page)->firstOrFail(),
        );
    }
}
