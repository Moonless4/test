<?php

namespace App\Http\Requests\Admin;

use App\Models\Product;
use Closure;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Creating or editing a product.
 *
 * Two deliberate omissions:
 *
 *  - **`stock_quantity` is not here.** Stock is written through App\Services\InventoryService so
 *    every change is recorded in `stock_movements`; letting a payload set the column directly
 *    would be the one way to change stock without a trace.
 *  - **`id` and `created_at` are not here** — and could not be, because the model's fillable list
 *    refuses them and the strict model mode throws rather than discarding silently.
 *
 * `compare_at_price` is the pre-discount price, so when it is present it must be *higher* than the
 * price actually charged; a lower "original" price would render as a discount that gives nothing
 * away and confuse both the storefront and the checkout.
 */
class ProductRequest extends FormRequest
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
        $product = $this->route('product');
        $productId = $product instanceof Product ? $product->getKey() : null;
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'name' => [$required, 'string', 'max:200'],
            'slug' => [
                'sometimes', 'nullable', 'string', 'max:220',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique(Product::class, 'slug')->ignore($productId),
            ],
            'sku' => [
                $required, 'string', 'max:64',
                Rule::unique(Product::class, 'sku')->ignore($productId),
            ],
            'brand' => ['sometimes', 'nullable', 'string', 'max:100'],
            'category_id' => ['sometimes', 'nullable', 'integer', Rule::exists('categories', 'id')],
            'short_description' => ['sometimes', 'nullable', 'string', 'max:500'],
            'description' => ['sometimes', 'nullable', 'string', 'max:20000'],
            'price' => [$required, 'integer', 'min:0', 'max:1000000000'],
            // The rail's «امتیاز» group reads this, so it is a 0–5 score and nothing else.
            'rating' => ['sometimes', 'nullable', 'numeric', 'min:0', 'max:5'],
            'compare_at_price' => [
                'sometimes', 'nullable', 'integer', 'min:1', 'max:1000000000',
                function (string $attribute, mixed $value, Closure $fail) use ($product): void {
                    if ($value === null) {
                        return;
                    }

                    // The effective price is the one being sent, or the stored one on a PATCH that
                    // leaves price alone.
                    $price = (int) ($this->input('price') ?? ($product instanceof Product ? $product->price : 0));

                    if ((int) $value <= $price) {
                        $fail('قیمت پیش از تخفیف باید بیشتر از قیمت فروش باشد.');
                    }
                },
            ],
            'low_stock_threshold' => ['sometimes', 'integer', 'min:0', 'max:100000'],
            'is_active' => ['sometimes', 'boolean'],
            'is_featured' => ['sometimes', 'boolean'],
            'published_at' => ['sometimes', 'nullable', 'date'],
            'attributes' => ['sometimes', 'nullable', 'array', 'max:20'],
            'attributes.*' => ['array', 'max:20'],
            'attributes.*.*' => ['string', 'max:100'],
        ];
    }
}
