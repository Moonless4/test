<?php

/*
 * Payment configuration. Only the merchant id is a secret, and it is read from the environment —
 * never from code, never from the client. Amounts are handled in Toman inside the application
 * and converted to Rial at the gateway boundary (Zarinpal works in Rial).
 */
return [

    'gateway' => env('PAYMENT_GATEWAY', 'zarinpal'),

    'currency' => 'IRT',

    'rial_multiplier' => 10,

    'callback_url' => env('PAYMENT_CALLBACK_URL'),

    // Where the browser is sent after the gateway finishes, with the order number appended.
    'frontend_return_url' => env('PAYMENT_FRONTEND_RETURN_URL'),

    'http_timeout' => (int) env('PAYMENT_HTTP_TIMEOUT', 15),

    'zarinpal' => [
        'merchant_id' => env('ZARINPAL_MERCHANT_ID'),
        'sandbox' => (bool) env('ZARINPAL_SANDBOX', true),
        'base_url' => env('ZARINPAL_BASE_URL'),
    ],

];
