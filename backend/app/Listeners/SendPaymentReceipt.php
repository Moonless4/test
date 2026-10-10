<?php

namespace App\Listeners;

use App\Events\PaymentSucceeded;
use App\Notifications\PaymentSucceededNotification;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Notification;

/**
 * Emails the receipt. Queued so the shopper's browser is redirected immediately after the gateway
 * confirms, instead of waiting for the mail server.
 *
 * A guest order has no user to notify, so the address recorded on the order is used directly —
 * that address was supplied by whoever placed the order, and it is the only one we have.
 */
class SendPaymentReceipt implements ShouldQueue
{
    public function handle(PaymentSucceeded $event): void
    {
        $order = $event->order;

        if ($order->user !== null) {
            $order->user->notify(new PaymentSucceededNotification($order));

            return;
        }

        if ($order->customer_email === null || $order->customer_email === '') {
            Log::info('A paid guest order has no email address on file.', ['order' => $order->number]);

            return;
        }

        Notification::route('mail', $order->customer_email)
            ->notify(new PaymentSucceededNotification($order));
    }
}
