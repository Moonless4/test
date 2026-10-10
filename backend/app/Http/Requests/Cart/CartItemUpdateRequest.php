<?php

namespace App\Http\Requests\Cart;

use Illuminate\Foundation\Http\FormRequest;

class CartItemUpdateRequest extends FormRequest
{
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
            // 0 is allowed and means "remove this line", which is how a minus button behaves.
            'quantity' => ['required', 'integer', 'min:0', 'max:'.(int) config('shop.cart.max_quantity_per_line')],
        ];
    }
}
