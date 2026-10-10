<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Creating or editing a FAQ entry.
 *
 * `group` is a free-form label the storefront groups by; `position` orders the entries inside a
 * group. Both are plain columns — nothing about them is derived, so an operator can rearrange the
 * accordion without a deployment.
 */
class FaqRequest extends FormRequest
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
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'group' => ['sometimes', 'required', 'string', 'max:64'],
            'question' => [$required, 'string', 'max:300'],
            'answer' => [$required, 'string', 'max:5000'],
            'position' => ['sometimes', 'integer', 'min:0', 'max:65535'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }
}
