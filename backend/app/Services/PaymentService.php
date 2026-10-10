<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Events\PaymentSucceeded;
use App\Exceptions\PaymentGatewayException;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\Payment;
use App\Models\User;
use App\Services\Payments\PaymentGateway;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

/**
 * Owns the money path.
 *
 * Invariants:
 *
 *  - The amount is always read from the order or the payment row. A request payload, a query
 *    string or the gateway's own callback never supplies an amount.
 *  - The gateway is never asked twice for the same thing in a way that could double-charge:
 *    `start()` does nothing to an order that is not awaiting payment, and `settle()` is idempotent.
 *  - A failure is recorded on the payment row and returns the order untouched, so the shopper can
 *    try again without losing the basket.
 */
class PaymentService
{
    public function __construct(
        private readonly PaymentGateway $gateway,
        private readonly AuditLogger $audit,
    ) {}

    /**
     * Opens a transaction at the gateway and returns the payment row to redirect from.
     *
     * @throws PaymentGatewayException
     */
    public function start(Order $order, ?User $user = null): Payment
    {
        if ($order->status !== OrderStatus::PendingPayment) {
            throw new PaymentGatewayException('This order is not awaiting payment.');
        }

        if ($order->grand_total <= 0) {
            throw new PaymentGatewayException('A payment cannot be opened for a zero total.');
        }

        $payment = new Payment;

        $payment->order_id = $order->getKey();
        $payment->gateway = $this->gateway->name();
        $payment->amount = (int) $order->grand_total;
        $payment->currency = (string) $order->currency;
        $payment->status = PaymentStatus::Pending;
        $payment->save();

        $result = $this->gateway->request(
            amountToman: (int) $order->grand_total,
            description: 'سفارش '.$order->number,
            callbackUrl: (string) config('payments.callback_url'),
            mobile: $order->customer_phone !== '' ? $order->customer_phone : null,
            email: $order->customer_email,
        );

        if (! $result->ok || $result->authority === null) {
            $payment->status = PaymentStatus::Failed;
            $payment->failure_reason = $result->error ?? 'unknown';
            $payment->save();

            $this->audit->log('payment.request_failed', $order, ['payment_id' => $payment->getKey()], $user);

            throw new PaymentGatewayException('The payment gateway refused the request.');
        }

        $payment->authority = $result->authority;
        $payment->save();

        $this->audit->log('payment.requested', $order, [
            'payment_id' => $payment->getKey(),
            'amount' => $payment->amount,
        ], $user);

        return $payment;
    }

    public function redirectUrl(Payment $payment): string
    {
        return $this->gateway->redirectUrl((string) $payment->authority);
    }

    /**
     * Handles the gateway's return. Safe to call repeatedly for the same authority.
     *
     * @throws ModelNotFoundException
     */
    public function settle(string $authority, string $gatewayStatus): Order
    {
        return DB::transaction(function () use ($authority, $gatewayStatus): Order {
            $payment = Payment::query()->where('authority', $authority)->lockForUpdate()->first();

            if ($payment === null) {
                throw (new ModelNotFoundException)->setModel(Payment::class);
            }

            $order = Order::query()->whereKey($payment->order_id)->lockForUpdate()->firstOrFail();

            // Already settled: the shopper refreshed the return page, or the gateway called twice.
            if ($payment->status === PaymentStatus::Succeeded) {
                return $order;
            }

            if ($gatewayStatus !== 'OK') {
                $payment->status = PaymentStatus::Cancelled;
                $payment->failure_reason = 'cancelled_at_gateway';
                $payment->save();

                $this->audit->log('payment.cancelled', $order, ['payment_id' => $payment->getKey()]);

                return $order;
            }

            $result = $this->gateway->verify((int) $payment->amount, $authority);

            if (! $result->ok) {
                $payment->status = PaymentStatus::Failed;
                $payment->failure_reason = mb_substr((string) $result->error, 0, 255);
                $payment->save();

                $this->audit->log('payment.verification_failed', $order, ['payment_id' => $payment->getKey()]);

                return $order;
            }

            $previousStatus = $order->status;

            $payment->status = PaymentStatus::Succeeded;
            $payment->reference_id = $result->referenceId;
            $payment->card_mask = $result->cardMask;
            $payment->paid_at = now();
            $payment->save();

            $order->payment_status = PaymentStatus::Succeeded;
            $order->paid_at ??= now();

            if ($order->status === OrderStatus::PendingPayment) {
                $order->status = OrderStatus::Paid;
            }

            $order->save();

            $history = new OrderStatusHistory;

            $history->order_id = $order->getKey();
            $history->from_status = $previousStatus;
            $history->to_status = $order->status;
            $history->note = 'پرداخت تأیید شد'.($result->referenceId !== null ? ' — '.$result->referenceId : '');
            $history->created_at = now();
            $history->save();

            $this->audit->log('payment.succeeded', $order, [
                'payment_id' => $payment->getKey(),
                'amount' => $payment->amount,
                'reference' => $result->referenceId,
            ]);

            PaymentSucceeded::dispatch($order);

            return $order->load('items', 'payments');
        });
    }

    /**
     * A new authority for an order whose previous attempt failed or was abandoned. The order
     * number is never re-used, and the earlier payment rows stay for the record.
     */
    public function retry(Order $order, ?User $user = null): Payment
    {
        Payment::query()
            ->where('order_id', $order->getKey())
            ->where('status', PaymentStatus::Pending)
            ->update(['status' => PaymentStatus::Cancelled, 'failure_reason' => 'superseded']);

        return $this->start($order, $user);
    }

    /**
     * A stable, unguessable value the client can use to follow a payment without an account.
     */
    public function statusToken(): string
    {
        return Str::random(40);
    }
}
