<?php

namespace App\Events;

use App\Models\Order;
use Illuminate\Foundation\Events\Dispatchable;

/**
 * Raised once per order, exactly when the money is confirmed — never when a payment is merely
 * requested. `settle()` is idempotent, so this cannot fire twice for one order.
 */
class PaymentSucceeded
{
    use Dispatchable;

    public function __construct(public readonly Order $order) {}
}
