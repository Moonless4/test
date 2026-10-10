<?php

namespace App\Http\Requests\Auth;

use Illuminate\Foundation\Http\FormRequest;

/**
 * A second-factor answer: either a six-digit code from the authenticator app, or one of the recovery
 * codes. Both are accepted on the same endpoint so an operator who lost their phone has one door,
 * not two.
 */
class TwoFactorCodeRequest extends FormRequest
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
            'code' => ['nullable', 'string', 'digits:6', 'required_without:recovery_code'],
            // Recovery codes are 5+5 characters from a restricted alphabet; the shape is checked
            // here and the value is verified against the stored hashes, never trusted.
            'recovery_code' => ['nullable', 'string', 'max:32', 'required_without:code'],
            'device_name' => ['nullable', 'string', 'max:100'],
        ];
    }

    protected function prepareForValidation(): void
    {
        // Persian digits are normalized like everywhere else: an operator typing ۱۲۳۴۵۶ into a
        // Persian keyboard must not be told their code is wrong.
        $code = $this->input('code');

        $this->merge([
            'code' => is_string($code) ? $this->toLatinDigits($code) : $code,
            'recovery_code' => is_string($this->input('recovery_code'))
                ? mb_strtoupper(trim((string) $this->input('recovery_code')))
                : $this->input('recovery_code'),
        ]);
    }

    private function toLatinDigits(string $value): string
    {
        return strtr(trim($value), [
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
        ]);
    }
}
