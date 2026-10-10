<?php

namespace App\Http\Requests\Admin;

use App\Models\Setting;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Creating or editing a site setting.
 *
 * A setting's value is stored as a string; `type` is what turns it back into a number, a boolean or
 * a JSON structure on the way out (`Setting::typedValue()`), so the storefront never has to guess.
 * A JSON setting may be posted already decoded and is encoded once, here in the controller.
 *
 * `key` is immutable on update: the storefront looks settings up *by key*, so silently renaming one
 * would break whatever reads it without a single error being raised. Create a new key, then retire
 * the old one.
 */
class SettingRequest extends FormRequest
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
        $setting = $this->route('setting');
        $isUpdate = $setting instanceof Setting;

        return [
            'key' => $isUpdate
                ? ['prohibited']
                : ['required', 'string', 'max:64', 'regex:/^[a-z0-9]+(?:[._-][a-z0-9]+)*$/', Rule::unique(Setting::class, 'key')],
            'value' => ['sometimes', 'nullable'],
            'type' => ['sometimes', Rule::in(['string', 'int', 'bool', 'json'])],
            'group' => ['sometimes', 'required', 'string', 'max:64'],
            'is_public' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * The value stored in the column, whatever shape it arrived in.
     */
    public function storedValue(): ?string
    {
        $value = $this->input('value');

        if ($value === null || $value === '') {
            return null;
        }

        if (is_bool($value)) {
            return $value ? '1' : '0';
        }

        if (is_array($value)) {
            return json_encode($value, JSON_UNESCAPED_UNICODE) ?: null;
        }

        return mb_substr((string) $value, 0, 2000);
    }
}
