<?php

namespace App\Http\Requests\Checkout;

use App\Http\Requests\Concerns\NormalizesInput;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * A purchase the storefront's own basket has already completed.
 *
 * The basket, the coupon, the «مدورا کوین» balance and the gateway all live in the browser (see
 * `src/lib/payment.ts`), so this request *describes* a finished order instead of placing one: which
 * products were bought, who receives them, and what the shop's own checkout collected.
 *
 * Only the shipping and the discount are taken at face value; `CheckoutService::record()` prices the
 * lines from the catalogue itself, so a payload can name products and quantities but never prices.
 *
 * `payment.status` is a report, not an instruction: the service maps it onto the order's own
 * lifecycle (`OrderStatus`) and can never be asked for a status that lifecycle does not allow.
 */
class RecordOrderRequest extends FormRequest
{
    use NormalizesInput;

    public function authorize(): bool
    {
        return true;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        return [
            // The number the shopper was shown (`ST-…`). The API keeps it when it is free and mints
            // one of its own otherwise, so a collision can never cost the shop the order.
            'number' => ['nullable', 'string', 'max:32', 'regex:/^[A-Za-z0-9-]+$/'],

            'items' => ['required', 'array', 'min:1', 'max:50'],
            // Products travel by slug: the storefront's own catalogue ids *are* the slugs.
            'items.*.slug' => ['required', 'string', 'max:190'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:99'],
            'items.*.attributes' => ['nullable', 'array'],
            'items.*.attributes.*' => ['nullable', 'string', 'max:120'],

            'customer.name' => ['required', 'string', 'max:160'],
            'customer.phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'customer.email' => ['nullable', 'string', 'email:rfc', 'max:190'],
            'customer.province' => ['required', 'string', 'max:80'],
            'customer.city' => ['required', 'string', 'max:80'],
            'customer.postal_code' => ['required', 'string', 'regex:/^\d{10}$/'],
            'customer.line1' => ['required', 'string', 'max:255'],
            'customer.note' => ['nullable', 'string', 'max:500'],

            'shipping.title' => ['required', 'string', 'max:80'],
            'shipping.cost' => ['required', 'integer', 'min:0', 'max:100000000'],

            'discount_total' => ['nullable', 'integer', 'min:0', 'max:100000000'],

            'payment.method' => ['required', Rule::in(['online', 'wallet', 'installment', 'cod'])],
            'payment.status' => ['required', Rule::in(['paid', 'pending', 'failed', 'cancelled'])],
            'payment.reference' => ['nullable', 'string', 'max:128'],
            'payment.paid_at' => ['nullable', 'date'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $email = $this->input('customer.email');

        $this->merge([
            'number' => is_string($this->input('number'))
                ? mb_strtoupper(trim($this->input('number')))
                : $this->input('number'),
            'customer' => array_merge((array) $this->input('customer'), [
                'phone' => $this->toLatinDigits($this->input('customer.phone')),
                'postal_code' => $this->toLatinDigits($this->input('customer.postal_code')),
                'email' => is_string($email) ? mb_strtolower(trim($email)) : $email,
            ]),
            // An order with no discount at all is the common case; the service expects a number.
            'discount_total' => $this->input('discount_total', 0),
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'items.required' => 'سبد خرید خالی است.',
            'customer.phone.regex' => 'شماره تماس باید با ۰۹ شروع شود و ۱۱ رقم باشد.',
            'customer.postal_code.regex' => 'کد پستی باید ۱۰ رقم باشد.',
        ];
    }
}
