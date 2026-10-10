<?php

namespace App\Services\Payments;

use App\Support\Money;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

/**
 * Zarinpal REST v4.
 *
 * Two things this class is strict about:
 *
 *  - **The unit.** Zarinpal works in Rial; the application works in Toman. The conversion happens
 *    here and only here (`Money::toRial`), and an amount is never taken from a request payload.
 *  - **What leaves the process.** The merchant id is sent to Zarinpal and nowhere else: it is not
 *    logged, not returned to the client, and not included in any exception message. Errors are
 *    logged with the gateway's own code, and the caller gets a neutral exception.
 */
class ZarinpalGateway implements PaymentGateway
{
    private const SUCCESS = 100;

    private const ALREADY_VERIFIED = 101;

    private const SANDBOX_HOST = 'https://sandbox.zarinpal.com';

    private const LIVE_HOST = 'https://payment.zarinpal.com';

    public function name(): string
    {
        return 'zarinpal';
    }

    public function isConfigured(): bool
    {
        return $this->merchantId() !== null;
    }

    public function request(
        int $amountToman,
        string $description,
        string $callbackUrl,
        ?string $mobile = null,
        ?string $email = null,
    ): GatewayRequestResult {
        $this->assertConfigured();

        $payload = [
            'merchant_id' => $this->merchantId(),
            'amount' => Money::toRial($amountToman),
            'description' => mb_substr($description, 0, 255),
            'callback_url' => $callbackUrl,
        ];

        if ($mobile !== null || $email !== null) {
            $payload['metadata'] = array_filter([
                'mobile' => $mobile,
                'email' => $email,
            ]);
        }

        $response = Http::timeout($this->timeout())
            ->acceptJson()
            ->asJson()
            ->post($this->host().'/pg/v4/payment/request.json', $payload);

        if ($response->failed()) {
            Log::error('Zarinpal request failed.', ['status' => $response->status()]);

            return GatewayRequestResult::failure('gateway_unreachable');
        }

        $data = $response->json('data');
        $code = (int) ($data['code'] ?? 0);
        $authority = $data['authority'] ?? null;

        if ($code !== self::SUCCESS || ! is_string($authority) || $authority === '') {
            Log::warning('Zarinpal refused a payment request.', ['code' => $code]);

            return GatewayRequestResult::failure('gateway_rejected');
        }

        return GatewayRequestResult::success($authority);
    }

    public function verify(int $amountToman, string $authority): GatewayVerifyResult
    {
        $this->assertConfigured();

        $response = Http::timeout($this->timeout())
            ->acceptJson()
            ->asJson()
            ->post($this->host().'/pg/v4/payment/verify.json', [
                'merchant_id' => $this->merchantId(),
                // The amount is the one recorded on the payment row, never a value from the URL.
                'amount' => Money::toRial($amountToman),
                'authority' => $authority,
            ]);

        if ($response->failed()) {
            Log::error('Zarinpal verify failed.', ['status' => $response->status()]);

            return GatewayVerifyResult::failure('gateway_unreachable');
        }

        $data = $response->json('data');
        $code = (int) ($data['code'] ?? 0);
        $reference = isset($data['ref_id']) ? (string) $data['ref_id'] : null;
        // Only the masked card number the gateway returns is kept; a full PAN never reaches us.
        $cardMask = isset($data['card_pan']) ? mb_substr((string) $data['card_pan'], 0, 32) : null;

        return match ($code) {
            self::SUCCESS => GatewayVerifyResult::success($reference, $cardMask),
            self::ALREADY_VERIFIED => GatewayVerifyResult::alreadyDone($reference),
            default => GatewayVerifyResult::failure('gateway_rejected:'.$code),
        };
    }

    public function redirectUrl(string $authority): string
    {
        return $this->host().'/pg/StartPay/'.rawurlencode($authority);
    }

    private function assertConfigured(): void
    {
        if (! $this->isConfigured()) {
            throw new \App\Exceptions\PaymentGatewayException(
                'The payment gateway is not configured on this host.',
            );
        }
    }

    private function merchantId(): ?string
    {
        $id = config('payments.zarinpal.merchant_id');

        return is_string($id) && trim($id) !== '' ? trim($id) : null;
    }

    private function host(): string
    {
        $configured = config('payments.zarinpal.base_url');

        if (is_string($configured) && trim($configured) !== '') {
            return rtrim(trim($configured), '/');
        }

        return config('payments.zarinpal.sandbox') ? self::SANDBOX_HOST : self::LIVE_HOST;
    }

    private function timeout(): int
    {
        return max(3, (int) config('payments.http_timeout'));
    }
}
