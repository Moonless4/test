<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Replacing the role set of an account.
 *
 * The permission names are checked against the `web` guard explicitly: roles live on that guard, and
 * an unqualified `exists` would happily match a same-named role on another guard.
 *
 * Granting `super-admin` is decided in the controller, where the acting user is known.
 */
class UserRoleRequest extends FormRequest
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
            'roles' => ['present', 'array', 'max:4'],
            'roles.*' => [
                'string', 'distinct',
                Rule::exists('roles', 'name')->where('guard_name', 'web'),
            ],
        ];
    }
}
