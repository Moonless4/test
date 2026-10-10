<?php

namespace App\Http\Requests\Cart;

use App\Http\Requests\Concerns\NormalizesInput;
use Illuminate\Foundation\Http\FormRequest;

class CartCouponRequest extends FormRequest
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
            'code' => ['required', 'string', 'max:40'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $code = $this->input('code');

        // Codes are stored upper-case; normalising here means a shopper can type either case, and
        // the database lookup stays an exact match on an indexed column.
        $this->merge([
            'code' => is_string($code) ? mb_strtoupper(trim($this->toLatinDigits($code) ?? $code)) : $code,
        ]);
    }
}
