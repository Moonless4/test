<?php

namespace App\Policies;

use App\Models\Order;
use App\Models\User;

/**
 * Who may read an order.
 *
 * Two ways in, and no third: the account that placed it, or — for a guest order — the one-time
 * access token handed out at checkout. Staff read orders through the admin endpoint, which requires
 * the `orders.view` permission and uses its own controller, so this policy stays about the shopper.
 */
class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $order->user_id !== null && $order->user_id === $user->getKey();
    }

    public function viewAny(User $user): bool
    {
        return true;
    }
}
