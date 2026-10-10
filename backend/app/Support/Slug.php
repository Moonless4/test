<?php

namespace App\Support;

use Illuminate\Support\Str;

/**
 * Slug generation for the admin endpoints.
 *
 * Two realities it has to survive:
 *
 *  1. **Persian names have no ASCII form.** `Str::slug('شلوار جین')` is an empty string, which would
 *     violate the unique index on the second such row. An empty result therefore falls back to a
 *     `prefix-…` base instead of an empty slug.
 *  2. **Two records may share a name.** A taken slug gets a numeric suffix, so a create never fails
 *     with a database error the operator cannot act on.
 *
 * The slug columns are unique, and this is the only place that invents one.
 */
class Slug
{
    /**
     * @param  class-string<\Illuminate\Database\Eloquent\Model>  $modelClass
     */
    public static function unique(string $modelClass, string $name, string $fallbackPrefix = 'entry', ?int $ignoreKey = null): string
    {
        $base = mb_substr((string) Str::slug($name), 0, 150);

        if ($base === '') {
            $base = $fallbackPrefix.'-'.mb_strtolower(Str::random(8));
        }

        $candidate = $base;
        $suffix = 2;

        while ($modelClass::query()
            ->where('slug', $candidate)
            ->when($ignoreKey !== null, fn ($query) => $query->whereKeyNot($ignoreKey))
            ->exists()
        ) {
            $candidate = $base.'-'.$suffix;
            $suffix++;
        }

        return $candidate;
    }
}
