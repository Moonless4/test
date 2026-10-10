<?php

namespace App\Http\Requests\Checkout;

use App\Http\Requests\Concerns\NormalizesInput;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * What the shopper supplies at checkout: who receives the order and where.
 *
 * There is deliberately **no amount, no price and no total** in this request. Totals are computed
 * server-side from locked catalogue rows, so a tampered payload cannot change what is charged.
 *
 * An email is required only for a guest: a signed-in shopper already has one on their account, and
 * asking for it again would be noise.
 */
class CheckoutRequest extends FormRequest
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
        // `user('sanctum')` rather than `user()`: checkout is reachable by guests, so the route
        // carries no auth middleware, and only the sanctum guard resolves a bearer token that was
        // sent anyway. Without this a signed-in shopper would be treated as a guest and their
        // order would not be attached to their account.
        $isGuest = $this->user('sanctum') === null;

        return [
            'customer_name' => ['required', 'string', 'max:160'],
            'customer_email' => [
                Rule::requiredIf($isGuest),
                'nullable', 'string', 'email:rfc', 'max:190',
            ],
            'customer_phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'shipping_province' => ['required', 'string', 'max:80'],
            'shipping_city' => ['required', 'string', 'max:80'],
            'shipping_postal_code' => ['required', 'string', 'regex:/^\d{10}$/'],
            'shipping_line1' => ['required', 'string', 'max:255'],
            'shipping_line2' => ['nullable', 'string', 'max:255'],
            'note' => ['nullable', 'string', 'max:500'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $email = $this->input('customer_email');

        $this->merge([
            'customer_phone' => $this->toLatinDigits($this->input('customer_phone')),
            'shipping_postal_code' => $this->toLatinDigits($this->input('shipping_postal_code')),
            'customer_email' => is_string($email) ? mb_strtolower(trim($email)) : $email,
        ]);
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'customer_phone.regex' => 'شماره تماس باید با ۰۹ شروع شود و ۱۱ رقم باشد.',
            'shipping_postal_code.regex' => 'کد پستی باید ۱۰ رقم باشد.',
            'customer_email.required' => 'برای ثبت سفارش مهمان، ایمیل الزامی است.',
        ];
    }
}
