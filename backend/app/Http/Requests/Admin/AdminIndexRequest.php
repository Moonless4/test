<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

/**
 * The query string shared by every admin list.
 *
 * One request for all of them, because the rules are the same and they must not drift: `q` is
 * escaped before it reaches a LIKE, `sort` is a whitelisted keyword (a client can never name a
 * column), and `per_page` is bounded so a panel page cannot ask for the whole table. A controller
 * only reads the keys that exist.
 */
class AdminIndexRequest extends FormRequest
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
            'q' => ['nullable', 'string', 'min:1', 'max:80'],
            'status' => ['nullable', 'string', 'max:24'],
            'category' => ['nullable', 'string', 'max:64'],
            // Only the audit list reads this: "what did this account do?".
            'user_id' => ['nullable', 'integer', 'min:1'],
            'sort' => ['nullable', 'string', 'in:newest,oldest,name,price_asc,price_desc'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
            'page' => ['nullable', 'integer', 'min:1'],
        ];
    }

    /**
     * The search term, already escaped for LIKE: a term containing `%` or `_` is matched literally
     * instead of turning into a wildcard scan.
     */
    public function term(): string
    {
        return trim((string) $this->string('q')->value());
    }

    public function escapedTerm(): string
    {
        return addcslashes($this->term(), '%_\\');
    }

    public function perPage(int $default = 20, int $max = 100): int
    {
        return min(max((int) $this->integer('per_page', $default), 1), $max);
    }
}
