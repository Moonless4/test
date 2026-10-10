<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Attaching an image to a product.
 *
 * Exactly one source: either a freshly uploaded `file` or the id of a media row that already exists
 * (so the same photo can be re-used across products without uploading it twice). The file's type is
 * decided by App\Services\MediaService from the bytes themselves — never from a filename or the
 * client's Content-Type.
 *
 * Which product the image belongs to is never in the payload: it is the route's product.
 */
class ProductImageRequest extends FormRequest
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
            'file' => [
                'nullable', 'file',
                'max:'.(int) config('security.uploads.max_kb'),
                'required_without:media_id',
            ],
            'media_id' => [
                'nullable', 'integer',
                Rule::exists('media', 'id'),
                'required_without:file',
            ],
            'alt' => ['nullable', 'string', 'max:200'],
            'position' => ['sometimes', 'integer', 'min:0', 'max:65535'],
        ];
    }

    /**
     * @return array<string, string>
     */
    public function attributes(): array
    {
        return [
            'file' => 'فایل تصویر',
            'media_id' => 'تصویر',
        ];
    }
}
