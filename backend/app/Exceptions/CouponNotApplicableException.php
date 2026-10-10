<?php

namespace App\Exceptions;

use Illuminate\Http\JsonResponse;
use RuntimeException;

/**
 * Raised when a coupon cannot be used (expired, exhausted, below its minimum, not for this user).
 *
 * The message is intentionally about the state of the code, never about why it did *not* match
 * something else the customer typed: a wrong code and an exhausted code give the same 422 so the
 * response cannot be used to enumerate valid codes.
 */
class CouponNotApplicableException extends RuntimeException
{
    public function render(): JsonResponse
    {
        return response()->json([
            'message' => $this->getMessage(),
            'errors' => ['code' => [$this->getMessage()]],
        ], 422);
    }
}
