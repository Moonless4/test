<?php

namespace App\Http\Requests\Checkout;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\ValidationException;

/**
 * A server-to-server payment notification.
 *
 * The body is validated strictly because it decides money: an authority of the shape the gateway
 * issues, a status from the small set the gateway can send, and nothing else — no amount, no order
 * status, no "paid" flag. There is no field here a caller could use to claim a payment the gateway
 * has not confirmed (the signature middleware already proved where the request came from).
 */
class PaymentWebhookRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    /** The only fields a delivery may carry for this endpoint. */
    private const ALLOWED = ['authority', 'status'];

    /**
     * Unknown fields are refused rather than ignored.
     *
     * On a route that decides money, an extra key is either a gateway version we do not understand
     * yet or an attempt to smuggle something past the validation rules — and "ignored" would answer
     * 200 to both, leaving an operator to believe a payment was understood when it was not.
     */
    protected function prepareForValidation(): void
    {
        $unknown = array_diff(array_keys($this->all()), self::ALLOWED);

        if ($unknown !== []) {
            throw ValidationException::withMessages([
                'payload' => ['بدنهٔ درخواست شامل فیلد ناشناخته است.'],
            ]);
        }
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            'authority' => ['required', 'string', 'max:64', 'regex:/^[A-Za-z0-9._-]+$/'],
            'status' => ['required', 'string', 'in:OK,NOK,FAILED,CANCELLED'],
        ];
    }
}
