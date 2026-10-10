<?php

namespace App\Http\Resources;

use App\Models\Order;
use Illuminate\Http\Request;

/**
 * An order as the *admin* panel needs it: the public payload plus the internal id.
 *
 * The panel links to an order it has not loaded yet, and the admin route binds on the primary key
 * (`orders/{order}`) exactly as the tests exercise it — while the public resource deliberately
 * keeps the internal id out of reach, because the number is what a shopper was given. The id is
 * added here and nowhere else, which is the same split AdminProductResource makes for `is_active`.
 *
 * @mixin Order
 */
class AdminOrderResource extends OrderResource
{
    public function toArray(Request $request): array
    {
        return array_merge(parent::toArray($request), [
            'id' => $this->id,
        ]);
    }
}
