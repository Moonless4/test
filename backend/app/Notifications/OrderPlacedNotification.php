<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * "Your order was received."
 *
 * Queued, because shared hosting should never make a shopper wait for an SMTP handshake — the
 * queue is drained by a cron entry, not by a daemon.
 *
 * The mail carries the order number and the total. It never carries the access token, and there is
 * no link that would let anyone but the shopper open the order.
 */
class OrderPlacedNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Order $order) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('سفارش شما ثبت شد — '.$this->order->number)
            ->greeting('سلام '.$this->order->customer_name)
            ->line('سفارش شما با شماره '.$this->order->number.' ثبت شد.')
            ->line('مبلغ قابل پرداخت: '.number_format($this->order->grand_total).' تومان')
            ->line('برای نهایی شدن، پرداخت را کامل کنید. اگر پرداخت را انجام داده‌اید، این ایمیل را نادیده بگیرید.')
            ->salutation('مدورا');
    }
}
