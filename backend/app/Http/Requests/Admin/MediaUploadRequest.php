<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * Uploading a file into the media library.
 *
 * The payload carries no `is_public`: the *service* decides. An image goes to the public disk
 * because that is the only thing the storefront can show; anything else is stored privately, outside
 * the document root, so an uploaded PDF can never be fetched by guessing its path.
 *
 * The bytes are what count — App\Services\MediaService reads the MIME type with finfo and refuses
 * anything not on the allowlist, whatever the file is named.
 */
class MediaUploadRequest extends FormRequest
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
                'required', 'file',
                'max:'.(int) config('security.uploads.max_kb'),
            ],
        ];
    }
}
