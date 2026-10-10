<?php

namespace App\Services\Payments;

/**
 * What a gateway must be able to do. Swapping providers (Zarinpal today, something else later)
 * must not touch a controller or a model: the rest of the application only knows this interface.
 */
interface PaymentGateway
{
    /**
     * Asks the gateway to open a transaction.
     *
     * @param  int  $amountToman  The order total in Toman; the gateway converts to its own unit.
     */
    public function request(
        int $amountToman,
        string $description,
        string $callbackUrl,
        ?string $mobile = null,
        ?string $email = null,
    ): GatewayRequestResult;

    /**
     * Confirms a transaction. Must be safe to call twice for the same authority: the shopper can
     * refresh the return URL, and the answer for an already-verified payment is a success.
     */
    public function verify(int $amountToman, string $authority): GatewayVerifyResult;

    /** Where the shopper's browser is sent to pay. */
    public function redirectUrl(string $authority): string;

    /** Identifier stored on the payment row. */
    public function name(): string;

    /** Whether the gateway is configured well enough to be used at all. */
    public function isConfigured(): bool;
}
