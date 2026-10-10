<?php

namespace App\Http\Resources;

use App\Models\Page;
use Illuminate\Http\Request;

/**
 * A content page as the *admin* panel needs it: the public fields plus the editorial state.
 *
 * `status` is deliberately absent from the public resource — a visitor only ever reaches a page
 * through the `published` scope, so "is it a draft?" is not a question the storefront asks. The
 * panel is the one surface where a draft is visible, and it cannot show an editor what it is
 * about to publish without this field.
 *
 * @mixin Page
 */
class AdminPageResource extends PageResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            // The admin routes bind on the primary key (`pages/{page}`), so the panel cannot
            // address the row it is editing without it. The public resource stays slug-only.
            'id' => $this->id,
            'status' => $this->status,
        ]);
    }
}
