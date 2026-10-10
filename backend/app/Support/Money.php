<?php

namespace App\Support;

use InvalidArgumentException;

/**
 * Money helper.
 *
 * Every amount in this application is an integer number of **Toman** (`IRT`), matching the
 * storefront. Zarinpal, however, works in Rial, so the conversion happens exactly once — at the
 * gateway boundary — and never in a controller or a resource. Floats are never used for money.
 */
final class Money
{
    public const CURRENCY = 'IRT';

    public static function toRial(int $toman): int
    {
        self::assertNonNegative($toman);

        return $toman * 10;
    }

    public static function fromRial(int $rial): int
    {
        self::assertNonNegative($rial);

        return intdiv($rial, 10);
    }

    public static function assertNonNegative(int $amount): void
    {
        if ($amount < 0) {
            throw new InvalidArgumentException('A money amount cannot be negative.');
        }
    }
}
