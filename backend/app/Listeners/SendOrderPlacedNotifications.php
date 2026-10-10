<?php

namespace App\Listeners;

use App\Events\OrderPlaced;
use App\Notifications\OrderPlacedNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

/**
 * Confirms the order to the shopper. Queued: the order is already committed when this runs, so a
 * mail failure can never roll back a sale.
 */
class SendOrderPlacedNotifications implements ShouldQueue
{
    public function handle(OrderPlaced $event): void
    {
        $order = $event->order;

        if ($order->user !== null) {
            $order->user->notify(new OrderPlacedNotification($order));

            return;
        }

        if ($order->customer_email === null || $order->customer_email === '') {
            Log::info('A guest order was placed without an email address.', ['order' => $order->number]);

            return;
        }

        Notification::route('mail', $order->customer_email)
            ->notify(new OrderPlacedNotification($order));
    }
}
