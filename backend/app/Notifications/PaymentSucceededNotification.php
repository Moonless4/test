<?php

namespace App\Notifications;

use App\Models\Order;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * The receipt, sent only after the gateway confirms the payment server-side.
 */
class PaymentSucceededNotification extends Notification implements ShouldQueue
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
            ->subject('پرداخت سفارش '.$this->order->number.' تأیید شد')
            ->greeting('سلام '.$this->order->customer_name)
            ->line('پرداخت سفارش '.$this->order->number.' با موفقیت تأیید شد.')
            ->line('مبلغ پرداخت‌شده: '.number_format($this->order->grand_total).' تومان')
            ->line('سفارش شما در حال آماده‌سازی است.')
            ->salutation('مدورا');
    }
}
