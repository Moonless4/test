<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Raised when the payment gateway refuses a request, answers something unexpected, or cannot be
 * reached. The customer gets a neutral message and a 502; the gateway's own response body, the
 * authority and the merchant id stay in the log (never in the response).
 */
class PaymentGatewayException extends RuntimeException
{
    public function __construct(string $message, public readonly ?string $gatewayCode = null)
    {
        parent::__construct($message);
    }

    public function render(): JsonResponse
    {
        return response()->json([
            'message' => 'پرداخت در حال حاضر در دسترس نیست. لطفاً بعداً دوباره تلاش کنید.',
            'errors' => ['payment' => [$this->getMessage()]],
        ], 502);
    }
}
