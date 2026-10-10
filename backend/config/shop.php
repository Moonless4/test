<?php

/*
 * Storefront rules that the API owns. Kept in configuration rather than in the code so a host can
 * change the free-shipping threshold without a deployment — and so there is exactly one place
 * these numbers exist (the frontend must never compute a total of its own).
 */
return [

    // Shipping is a flat rate below the threshold and free at or above it.
    'shipping' => [
        'flat_rate' => (int) env('SHIPPING_FLAT_RATE', 45000),
        'free_threshold' => (int) env('SHIPPING_FREE_THRESHOLD', 2000000),
    ],

    // No VAT is charged by default; the column and the maths exist so turning it on is a config
    // change, not a migration.
    'tax' => [
        'rate_percent' => (int) env('TAX_RATE_PERCENT', 0),
    ],

    'cart' => [
        // One line cannot exceed this, whatever the stock says: it caps the damage of a scripted
        // order and keeps the order lines printable.
        'max_quantity_per_line' => (int) env('CART_MAX_QUANTITY_PER_LINE', 10),
        // Guest carts are purged after this many hours by the carts:purge command.
        'guest_ttl_hours' => (int) env('CART_GUEST_TTL_HOURS', 720),
    ],

    // How long a pending order waits for payment before the scheduler cancels it.
    'order' => [
        'payment_window_minutes' => (int) env('ORDER_PAYMENT_WINDOW_MINUTES', 30),
    ],

];
