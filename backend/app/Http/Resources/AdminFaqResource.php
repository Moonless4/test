<?php

namespace App\Http\Resources;

use App\Models\Faq;
use Illuminate\Http\Request;

/**
 * A FAQ entry as the *admin* panel needs it.
 *
 * The public endpoint serves `active()->ordered()`, so `is_active` never had to travel. The panel
 * lists retired questions too, and a toggle it cannot read is a toggle that lies — hence this
 * resource.
 *
 * @mixin Faq
 */
class AdminFaqResource extends FaqResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'is_active' => (bool) $this->is_active,
        ]);
    }
}
