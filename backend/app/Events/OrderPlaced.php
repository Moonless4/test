<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Raised inside the checkout transaction, after the order, its lines and the stock movements are
 * written. Listeners are queued, so nothing slow (mail, an external call) can run while the
 * transaction is still open.
 */
class OrderPlaced
{
    use Dispatchable;

    public function __construct(public readonly Order $order) {}
}
