<?php

namespace App\Services\Payments;

/**
 * Outcome of verifying a transaction.
 *
 * `alreadyVerified` exists because gateways answer a repeated verification with a distinct code
 * that still means "this payment is good": treating it as a failure would mark a paid order as
 * unpaid whenever a shopper refreshed the return page.
 */
final readonly class GatewayVerifyResult
{
    public function __construct(
        public bool $ok,
        public ?string $referenceId = null,
        public ?string $cardMask = null,
        public ?string $error = null,
        public bool $alreadyVerified = false,
    ) {}

    public static function success(?string $referenceId, ?string $cardMask = null): self
    {
        return new self(ok: true, referenceId: $referenceId, cardMask: $cardMask);
    }

    public static function alreadyDone(?string $referenceId = null): self
    {
        return new self(ok: true, referenceId: $referenceId, alreadyVerified: true);
    }

    public static function failure(string $error): self
    {
        return new self(ok: false, error: $error);
    }
}
