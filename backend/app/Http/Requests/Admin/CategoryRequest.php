<?php

namespace App\Http\Requests\Admin;

use App\Models\Category;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Creating or editing a category.
 *
 * A category cannot be its own parent, and — because the tree is rendered by walking `parent_id` —
 * it cannot be moved under one of its own descendants either: that would produce a cycle no
 * traversal could terminate. Both are checked here rather than in the controller, so the rule is
 * visible next to the field it constrains.
 */
class CategoryRequest extends FormRequest
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
        $category = $this->route('category');
        $categoryId = $category instanceof Category ? $category->getKey() : null;
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'parent_id' => [
                'sometimes', 'nullable', 'integer',
                Rule::exists('categories', 'id'),
                Rule::notIn(array_filter([$categoryId])),
            ],
            'name' => [$required, 'string', 'max:140'],
            'slug' => [
                'sometimes', 'nullable', 'string', 'max:140',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique(Category::class, 'slug')->ignore($categoryId),
            ],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'image_media_id' => ['sometimes', 'nullable', 'integer', Rule::exists('media', 'id')],
            'position' => ['sometimes', 'integer', 'min:0', 'max:65535'],
            'is_active' => ['sometimes', 'boolean'],
        ];
    }

    /**
     * A parent that is a descendant of the category being edited would close a loop in the tree.
     */
    public function withValidator(\Illuminate\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Validation\Validator $validator): void {
            $category = $this->route('category');
            $parentId = $this->input('parent_id');

            if (! $category instanceof Category || $parentId === null || $category->getKey() === null) {
                return;
            }

            $ancestor = Category::query()->find((int) $parentId);

            while ($ancestor !== null) {
                if ($ancestor->getKey() === $category->getKey()) {
                    $validator->errors()->add('parent_id', 'دسته‌بندی نمی‌تواند زیرمجموعهٔ خودش قرار بگیرد.');

                    return;
                }

                $ancestor = $ancestor->parent_id !== null
                    ? Category::query()->find((int) $ancestor->parent_id)
                    : null;
            }
        });
    }
}
