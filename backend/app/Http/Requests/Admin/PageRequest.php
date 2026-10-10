<?php

namespace App\Http\Requests\Admin;

use App\Models\Page;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Creating or editing a content page.
 *
 * `body` is plain text/markdown: the API never emits raw HTML, so a page cannot become a
 * stored-XSS vector for the storefront. `status` and `published_at` are independent — a page can be
 * marked published with a future date and simply starts being served when that moment arrives
 * (the `published` scope reads both).
 */
class PageRequest extends FormRequest
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
        $page = $this->route('page');
        $pageId = $page instanceof Page ? $page->getKey() : null;
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'slug' => [
                $required, 'string', 'max:160',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique(Page::class, 'slug')->ignore($pageId),
            ],
            'title' => [$required, 'string', 'max:200'],
            'body' => [$required, 'string', 'max:200000'],
            'status' => ['sometimes', Rule::in([Page::STATUS_DRAFT, Page::STATUS_PUBLISHED])],
            'published_at' => ['sometimes', 'nullable', 'date'],
            'meta' => ['sometimes', 'nullable', 'array', 'max:20'],
            'meta.*' => ['nullable', 'string', 'max:500'],
        ];
    }
}
