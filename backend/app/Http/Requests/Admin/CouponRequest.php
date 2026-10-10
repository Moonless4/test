<?php

namespace App\Http\Requests\Admin;

use App\Enums\CouponType;
use App\Models\Coupon;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Creating or editing a discount code.
 *
 * `value` has two meanings, decided by `type`: a percentage for `percent`, Toman for `fixed`. A
 * percent code is capped at 90% so it can never be a give-away, and a percent code must carry a
 * `max_discount` ceiling — without one, 90% of an expensive basket is still a loss.
 */
class CouponRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    /**
     * @return array<string, mixed>
     */
    public function rules(): array
    {
        $coupon = $this->route('coupon');
        $couponId = $coupon instanceof Coupon ? $coupon->getKey() : null;
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'code' => [
                $required, 'string', 'max:40', 'regex:/^[A-Za-z0-9_-]+$/',
                Rule::unique(Coupon::class, 'code')->ignore($couponId),
            ],
            'type' => [$required, Rule::enum(CouponType::class)],
            'value' => [
                $required, 'integer', 'min:1', 'max:1000000000',
                function (string $attribute, mixed $value, Closure $fail): void {
                    if ($this->input('type') === CouponType::Percent->value && (int) $value > 90) {
                        $fail('درصد تخفیف نمی‌تواند بیشتر از ۹۰ باشد.');
                    }
                },
            ],
            'min_subtotal' => ['sometimes', 'integer', 'min:0', 'max:1000000000'],
            // `requiredIf` is implicit, so it fires on an absent field — a closure under
            // `sometimes`/`nullable` would never run and the ceiling could be skipped entirely.
            // A stored ceiling counts: a partial update must not be forced to resend it.
            'max_discount' => [
                Rule::requiredIf(
                    fn (): bool => $this->input('type') === CouponType::Percent->value
                        && ! $this->storedCeiling(),
                ),
                'nullable', 'integer', 'min:0', 'max:1000000000',
            ],
            'usage_limit' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:1000000'],
            'usage_limit_per_user' => ['sometimes', 'nullable', 'integer', 'min:1', 'max:1000'],
            'starts_at' => ['sometimes', 'nullable', 'date'],
            'ends_at' => ['sometimes', 'nullable', 'date', 'after:starts_at'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * The ceiling already on the coupon being edited, if any.
     */
    private function storedCeiling(): bool
    {
        $coupon = $this->route('coupon');

        return $coupon instanceof Coupon && (int) $coupon->max_discount > 0;
    }

    /**
     * Codes are stored uppercase so `SALE10` and `sale10` are the same coupon.
     */
    protected function prepareForValidation(): void
    {
        if (is_string($this->input('code'))) {
            $this->merge(['code' => mb_strtoupper(trim((string) $this->input('code')))]);
        }
    }
}
