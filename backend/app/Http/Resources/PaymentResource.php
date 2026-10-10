<?php

namespace App\Http\Resources;

use App\Models\Payment;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * A payment attempt as the shopper may see it.
 *
 * `authority` is not exposed: it is the handle that proves a transaction to the gateway, and the
 * only place it is needed is the redirect URL, which the server builds itself.
 *
 * @mixin Payment
 */
class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'gateway' => $this->gateway,
            'status' => $this->status->value,
            'amount' => $this->amount,
            'currency' => $this->currency,
            'reference_id' => $this->reference_id,
            'card_mask' => $this->card_mask,
            'paid_at' => $this->paid_at?->toIso8601String(),
        ];
    }
}
