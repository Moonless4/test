<?php

namespace App\Http\Requests\Admin;

use App\Enums\UserStatus;
use App\Http\Requests\Concerns\NormalizesInput;
use App\Models\User;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * An administrator editing somebody else's account.
 *
 * Email is deliberately absent: changing an address is the shopper's own decision (and re-triggers
 * verification) — an administrator who could silently re-point an address at a mailbox they control
 * would have a quiet way into an account. What an administrator *can* change is the display name,
 * the phone number, and whether the account is active or suspended.
 *
 * Roles are not here either: they are a separate endpoint, so "edit a person" and "grant a
 * privilege" can be logged, rate-limited and reasoned about apart.
 */
class UserUpdateRequest extends FormRequest
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
            'name' => ['sometimes', 'required', 'string', 'max:160'],
            'phone' => ['sometimes', 'nullable', 'string', 'regex:/^09\d{9}$/'],
            'status' => ['sometimes', Rule::enum(UserStatus::class)],
        ];
    }

    protected function prepareForValidation(): void
    {
        $phone = $this->toLatinDigits($this->input('phone'));

        if ($phone !== null) {
            $this->merge(['phone' => $phone]);
        }
    }

    /**
     * An administrator must not be able to lock themselves out — the last thing anybody wants from
     * a panel is a suspended sole owner.
     */
    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $validator): void {
            $target = $this->route('user');

            if (! $target instanceof User || $target->getKey() !== $this->user()?->getKey()) {
                return;
            }

            if ($this->input('status') === UserStatus::Suspended->value) {
                $validator->errors()->add('status', 'حساب خودتان را نمی‌توانید معلق کنید.');
            }
        });
    }
}
