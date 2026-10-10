<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Illuminate\Validation\Validator;

/**
 * Changing a password requires the current one: a stolen token alone must not be enough to lock the
 * real owner out of their account.
 *
 * The check is done here with Hash::check rather than with the `current_password` validation rule,
 * because that rule needs a guard able to validate credentials — and this API authenticates with a
 * Sanctum *token* guard, which cannot. Doing it against the authenticated user's own hash is both
 * simpler and correct for a token-based API.
 */
class UpdatePasswordRequest extends FormRequest
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
            'current_password' => ['required', 'string', 'max:200'],
            'password' => ['required', 'string', 'confirmed', 'different:current_password', Password::defaults()],
        ];
    }

    /**
     * @return array<int, callable>
     */
    public function after(): array
    {
        return [
            function (Validator $validator): void {
                $user = $this->user();

                if ($user === null) {
                    return;
                }

                if (! Hash::check((string) $this->input('current_password'), (string) $user->getAuthPassword())) {
                    $validator->errors()->add('current_password', 'رمز عبور فعلی درست نیست.');
                }
            },
        ];
    }
}
