<?php

namespace App\Services;

use App\Exceptions\CouponNotApplicableException;
use App\Models\Cart;
use App\Models\Coupon;
use App\Models\Order;
use App\Models\User;

/**
 * Coupon validation and redemption.
 *
 * One message for every rejection ("This code is not valid.") so the endpoint cannot be used to
 * find out which codes exist, which have expired and which are simply not for this shopper.
 */
class CouponService
{
    private const REJECTION = 'این کد تخفیف معتبر نیست.';

    /**
     * Resolves a code to a coupon this cart may use right now.
     *
     * @throws CouponNotApplicableException
     */
    public function findUsable(string $code, int $subtotal, ?User $user): Coupon
    {
        $coupon = Coupon::query()
            ->where('code', mb_strtoupper(trim($code)))
            ->first();

        if ($coupon === null || ! $this->isUsable($coupon, $subtotal, $user)) {
            throw new CouponNotApplicableException(self::REJECTION);
        }

        return $coupon;
    }

    public function isUsable(Coupon $coupon, int $subtotal, ?User $user): bool
    {
        if (! $coupon->is_active || $coupon->isExhausted()) {
            return false;
        }

        if (! $coupon->hasStarted() || $coupon->hasExpired()) {
            return false;
        }

        if ($subtotal < $coupon->min_subtotal) {
            return false;
        }

        if ($coupon->usage_limit_per_user !== null) {
            if ($user === null) {
                // A per-user limit cannot be enforced for a guest: refusing is the safe answer.
                return false;
            }

            $used = $coupon->redemptions()->where('user_id', $user->getKey())->count();

            if ($used >= $coupon->usage_limit_per_user) {
                return false;
            }
        }

        return true;
    }

    /**
     * Marks a coupon as used by an order. Called inside the checkout transaction, with the coupon
     * row already locked, and made idempotent by the unique key on (coupon_id, order_id).
     */
    public function consume(Coupon $coupon, Order $order, int $amount, ?User $user): void
    {
        \App\Models\CouponRedemption::query()->firstOrCreate(
            ['coupon_id' => $coupon->getKey(), 'order_id' => $order->getKey()],
            ['user_id' => $user?->getKey(), 'amount' => $amount],
        );

        $coupon->increment('used_count');
    }

    /**
     * Locks the code for the duration of a checkout so two simultaneous orders cannot both spend
     * the last redemption.
     */
    public function lockForCheckout(Coupon $coupon): Coupon
    {
        return Coupon::query()->whereKey($coupon->getKey())->lockForUpdate()->firstOrFail();
    }

    public function detach(Cart $cart): void
    {
        $cart->coupon_id = null;
        $cart->save();
    }
}
