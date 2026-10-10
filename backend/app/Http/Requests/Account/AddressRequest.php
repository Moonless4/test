<?php

namespace App\Http\Requests\Account;

use App\Http\Requests\Concerns\NormalizesInput;
use App\Models\Address;
use Illuminate\Foundation\Http\FormRequest;

/**
 * Creating or editing a saved address.
 *
 * On update, `authorize()` checks the policy against the *route model binding* — so an address id
 * belonging to somebody else is refused before validation even runs (IDOR/BOLA).
 */
class AddressRequest extends FormRequest
{
    use NormalizesInput;

    public function authorize(): bool
    {
        $address = $this->route('address');

        if ($address instanceof Address) {
            return $this->user()?->can('update', $address) ?? false;
        }

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
