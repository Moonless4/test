<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

/**
 * "Something about your account's security changed."
 *
 * Sent on a password change, a new device signing in, the second factor being turned on or off, and
 * the recovery codes being regenerated — the events where the account owner is the only person who
 * can tell the difference between themselves and an attacker.
 *
 * What it deliberately does **not** contain: any password, code, token, recovery code or link that
 * performs an action. A notification that carries a credential is a credential in an inbox; this
 * one tells the owner what happened and what to do about it, and nothing more.
 */
class SecurityAlertNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<string, mixed>  $context  Facts safe to mail: an address, a device label, a time.
     */
    public function __construct(
        private readonly string $message,
        private readonly array $context = [],
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $mail = (new MailMessage)
            ->subject('هشدار امنیتی حساب کاربری — مدورا')
            ->greeting('سلام')
            ->line($this->message);

        if (isset($this->context['device'])) {
            $mail->line('دستگاه: '.$this->context['device']);
        }

        if (isset($this->context['ip'])) {
            $mail->line('آدرس شبکه: '.$this->context['ip']);
        }

        if (isset($this->context['at'])) {
            $mail->line('زمان: '.$this->context['at']);
        }

        return $mail
            ->line('اگر این تغییر کار شما نبود، همین حالا رمز عبور خود را تغییر دهید و از همهٔ دستگاه‌ها خارج شوید.')
            ->salutation('مدورا');
    }
}
