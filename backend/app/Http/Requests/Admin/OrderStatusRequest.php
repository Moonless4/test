<?php

namespace App\Http\Requests\Admin;

use App\Enums\OrderStatus;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Moving an order to another status.
 *
 * The rule only says the value must be a real status; whether the *transition* is legal is decided
 * by OrderStatus::canTransitionTo() in the controller, so the lifecycle lives in one place (the
 * enum) and this request cannot disagree with it.
 */
class OrderStatusRequest extends FormRequest
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
            'status' => ['required', Rule::enum(OrderStatus::class)],
            'note' => ['nullable', 'string', 'max:255'],
        ];
    }
}
