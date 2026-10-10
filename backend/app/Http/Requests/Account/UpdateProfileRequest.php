<?php

namespace App\Http\Requests\Account;

use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * A shopper editing their own profile.
 *
 * `status` and the role list are absent on purpose — that is the privilege-escalation guard. Even
 * if a client posts `status=...` or `roles=[...]`, neither the rules here nor the model's fillable
 * list will accept it, and the strict model mode would throw rather than discard it silently.
 *
 * Changing the email address is allowed, and the controller re-sets `email_verified_at` to null so
 * the new address has to be verified like any other.
 */
class UpdateProfileRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'email' => [
                'sometimes', 'required', 'string', 'email:rfc', 'max:190',
                Rule::unique(User::class, 'email')->ignore($this->user()?->getKey()),
            ],
            'phone' => ['sometimes', 'nullable', 'string', 'regex:/^09\d{9}$/'],
        ];
    }
}
