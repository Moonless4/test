<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * A deliberate stock correction.
 *
 * The request sends the **absolute** quantity the shelf should hold, not a delta: two operators
 * looking at the same screen then converge on the same number, instead of applying two increments
 * that add up to the wrong one. The service computes and records the delta.
 */
class ProductStockRequest extends FormRequest
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
        return [
            'stock_quantity' => ['required', 'integer', 'min:0', 'max:1000000'],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }
}
