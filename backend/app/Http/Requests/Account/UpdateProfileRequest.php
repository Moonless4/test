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
            /*
             * Changing the address is an account-takeover route — it is how a password reset finds
             * you — so it asks for the current password, which the controller then verifies. A
             * name or phone edit does not, so ordinary profile upkeep stays frictionless.
             */
            'current_password' => [
                'nullable',
                'string',
                'max:200',
                Rule::requiredIf(fn (): bool => $this->emailIsChanging()),
            ],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function messages(): array
    {
        return [
            'current_password.required' => 'برای تغییر ایمیل، رمز عبور فعلی را وارد کنید.',
        ];
    }

    public function emailIsChanging(): bool
    {
        $email = $this->input('email');

        return is_string($email)
            && $email !== ''
            && $email !== $this->user()?->email;
    }
}
