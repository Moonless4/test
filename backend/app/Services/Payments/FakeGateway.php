<?php

namespace App\Services\Payments;

use Illuminate\Support\Str;

/**
 * A gateway that never talks to the network.
 *
 * It exists for two reasons: the sandbox cannot reach zarinpal.com (the network is restricted), and
 * the test suite must not depend on a third party. `PAYMENT_GATEWAY=fake` selects it.
 *
 * An authority containing "fail" verifies as a failure, which is how the failure path is tested.
 */
class FakeGateway implements PaymentGateway
{
    private const FAILURE_MARKER = 'fail';

    public function name(): string
    {
        return 'fake';
    }

    public function isConfigured(): bool
    {
        return true;
    }

    public function request(
        int $amountToman,
        string $description,
        string $callbackUrl,
        ?string $mobile = null,
        ?string $email = null,
    ): GatewayRequestResult {
        return GatewayRequestResult::success('FAKE-'.Str::uuid()->toString());
    }

    public function verify(int $amountToman, string $authority): GatewayVerifyResult
    {
        if (str_contains(mb_strtolower($authority), self::FAILURE_MARKER)) {
            return GatewayVerifyResult::failure('fake_failure');
        }

        return GatewayVerifyResult::success('FAKE-REF-'.Str::upper(Str::random(10)), '6037-****-****-1234');
    }

    public function redirectUrl(string $authority): string
    {
        return 'https://fake-gateway.invalid/pay/'.rawurlencode($authority);
    }
}
