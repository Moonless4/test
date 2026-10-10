<?php

namespace App\Http\Requests\Account;

use App\Http\Requests\Concerns\NormalizesInput;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Creating or editing a saved address.
 *
 * Only the account is checked here. *Ownership* is decided in one place —
 * `AddressController::addressFor()`, which every mutating method calls before its policy check —
 * because a foreign address id has to be answered 404, and a FormRequest that fails `authorize()`
 * can only answer 403. Keeping the rule in the controller also means the policy and the scoped
 * `user_id` queries are the second and third checks, not the only one.
 */
class AddressRequest extends FormRequest
{
    use NormalizesInput;

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
            'label' => ['nullable', 'string', 'max:60'],
            'receiver_first_name' => ['required', 'string', 'max:80'],
            'receiver_last_name' => ['required', 'string', 'max:80'],
            'phone' => ['required', 'string', 'regex:/^09\d{9}$/'],
            'province' => ['required', 'string', 'max:80'],
            'city' => ['required', 'string', 'max:80'],
            'postal_code' => ['required', 'string', 'regex:/^\d{10}$/'],
            'line1' => ['required', 'string', 'max:255'],
            'line2' => ['nullable', 'string', 'max:255'],
            'is_default' => ['nullable', 'boolean'],
        ];
    }

    protected function prepareForValidation(): void
    {
        $this->merge(array_filter([
            'phone' => $this->toLatinDigits($this->input('phone')),
            'postal_code' => $this->toLatinDigits($this->input('postal_code')),
        ], static fn ($value): bool => $value !== null));
    }
}
