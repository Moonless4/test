<?php

namespace App\Http\Resources;

use App\Models\Setting;
use Illuminate\Http\Request;

/**
 * A setting as the *admin* panel needs it: the public payload plus `is_public`.
 *
 * Visibility is the one property an operator must be able to see before typing a value: a key that
 * is not public never reaches the storefront, and the panel is the only place that is legible.
 *
 * @mixin Setting
 */
class AdminSettingResource extends SettingResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            // The key is the storefront's handle, but `settings/{setting}` binds on the primary key.
            'id' => $this->id,
            'is_public' => (bool) $this->is_public,
        ]);
    }
}
