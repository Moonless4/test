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
        $unknown = array_diff(array_keys($this->validationData()), self::ALLOWED);

        if ($unknown !== []) {
            throw ValidationException::withMessages([
                'payload' => ['بدنهٔ درخواست شامل فیلد ناشناخته است.'],
            ]);
        }
    }

    /**
     * Only the signed body is judged.
     *
     * The signature covers `timestamp.body` and nothing else, so the query string is unsigned data
     * a caller can add for free. `$this->all()` merges it into the payload, which silently turned
     * the strictness below into "refuse any delivery carrying a query parameter" — a gateway that
     * appends one (or a caller adding `?amount=1`) would have been answered 422 rather than ignored.
     */
    public function validationData(): array
    {
        return $this->isJson() ? (array) $this->json()->all() : $this->request->all();
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
