<?php

namespace App\Http\Resources;

use App\Models\Category;
use Illuminate\Http\Request;

/**
 * A category as the admin panel needs it. The public resource shows a category that is, by
 * definition, active; an editor also has to see the inactive ones — and which parent they hang
 * under, because that is what the tree in the panel is built from.
 *
 * @mixin Category
 */
class AdminCategoryResource extends CategoryResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'parent_id' => $this->parent_id,
            'image_media_id' => $this->image_media_id,
            'is_active' => (bool) $this->is_active,
            // How many of this category's products the storefront may actually show.
            'active_products_count' => $this->whenCounted('active_products_count'),
        ]);
    }
}
