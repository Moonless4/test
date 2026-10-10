<?php

namespace App\Http\Requests\Admin;

use App\Models\Post;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

/**
 * Creating or editing a blog post.
 *
 * `author_id` is optional in the payload but never trusted blindly: the controller defaults it to
 * the acting administrator, and the request only accepts a real user id when one is sent. `body` is
 * plain text/markdown — the API never emits raw HTML.
 */
class PostRequest extends FormRequest
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
        $post = $this->route('post');
        $postId = $post instanceof Post ? $post->getKey() : null;
        $required = $this->isMethod('post') ? 'required' : 'sometimes';

        return [
            'slug' => [
                $required, 'string', 'max:160',
                'regex:/^[a-z0-9]+(?:-[a-z0-9]+)*$/',
                Rule::unique(Post::class, 'slug')->ignore($postId),
            ],
            'title' => [$required, 'string', 'max:200'],
            'excerpt' => ['sometimes', 'nullable', 'string', 'max:500'],
            'body' => [$required, 'string', 'max:200000'],
            'status' => ['sometimes', Rule::in([Post::STATUS_DRAFT, Post::STATUS_PUBLISHED])],
            'published_at' => ['sometimes', 'nullable', 'date'],
            'tags' => ['sometimes', 'nullable', 'array', 'max:20'],
            'tags.*' => ['string', 'max:60'],
            'cover_media_id' => ['sometimes', 'nullable', 'integer', Rule::exists('media', 'id')],
            'author_id' => ['sometimes', 'nullable', 'integer', Rule::exists('users', 'id')],
        ];
    }
}
