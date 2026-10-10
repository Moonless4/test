<?php

namespace App\Http\Requests\Admin;

use App\Models\Setting;
use Closure;
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
 *
 * One key is special: `admin.path` is the URL segment the storefront mounts the admin panel on, so
 * its value is validated as a path rather than as free text (see `adminPathRule()`).
 */
class SettingRequest extends FormRequest
{
    /** The setting that carries the admin panel's own URL segment. */
    public const ADMIN_PATH_KEY = 'admin.path';

    /**
     * Top-level paths the storefront's router already owns. The panel is mounted at an address the
     * shop chooses, so a value that collides with one of these would hide a page of the shop
     * instead of moving the panel.
     */
    private const RESERVED_PATHS = [
        'shop', 'product', 'search', 'cart', 'checkout', 'payment', 'wishlist', 'blog',
        'login', 'register', 'account', 'faq', 'api', 'assets', 'public',
    ];

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
            'value' => ['sometimes', 'nullable', $this->adminPathRule($setting)],
            'type' => ['sometimes', Rule::in(['string', 'int', 'bool', 'json'])],
            'group' => ['sometimes', 'required', 'string', 'max:64'],
            'is_public' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * `admin.path` moves the panel, so it is validated as one URL segment — and never onto a path
     * the shop's own pages already answer on. Every other key keeps the free-text behaviour.
     */
    private function adminPathRule(mixed $setting): Closure
    {
        return function (string $attribute, mixed $value, Closure $fail) use ($setting): void {
            $key = $setting instanceof Setting ? $setting->key : (string) $this->input('key');

            if ($key !== self::ADMIN_PATH_KEY) {
                return;
            }

            $path = is_string($value) ? mb_strtolower(trim($value)) : '';

            if (preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $path) !== 1) {
                $fail('مسیر پنل باید یک بخش ساده از آدرس باشد: فقط حروف کوچک انگلیسی، رقم و خط تیره — مثل manage.');

                return;
            }

            if (in_array($path, self::RESERVED_PATHS, true)) {
                $fail('این مسیر برای صفحه‌های خود فروشگاه استفاده می‌شود؛ نام دیگری انتخاب کنید.');
            }
        };
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
