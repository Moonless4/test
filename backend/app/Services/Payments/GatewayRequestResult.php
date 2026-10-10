<?php

namespace App\Services\Payments;

/**
 * Outcome of asking a gateway to open a transaction.
 */
final readonly class GatewayRequestResult
{
    public function __construct(
        public bool $ok,
        public ?string $authority = null,
        public ?string $error = null,
    ) {}

    public static function success(string $authority): self
    {
        return new self(ok: true, authority: $authority);
    }

    public static function failure(string $error): self
    {
        return new self(ok: false, error: $error);
    }
}
