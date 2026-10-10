<?php

namespace App\Http\Requests\Catalog;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Catalogue query string.
 *
 * Everything is optional, and everything a shopper can control is either a whitelisted sort key or
 * a bounded number — no client value ever reaches a column name or an unbounded LIMIT.
 */
class ProductIndexRequest extends FormRequest
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
            'category' => ['nullable', 'string', 'max:140'],
            'q' => ['nullable', 'string', 'min:2', 'max:80'],
            'min_price' => ['nullable', 'integer', 'min:0', 'max:1000000000'],
            'max_price' => ['nullable', 'integer', 'min:0', 'max:1000000000', 'gte:min_price'],
            'discounted' => ['nullable', 'boolean'],
            'featured' => ['nullable', 'boolean'],
            'sort' => ['nullable', 'string', 'in:newest,price_asc,price_desc,name,discount'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:48'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * @return array<string, mixed>
     */
    public function filters(): array
    {
        return $this->validated();
    }
}
