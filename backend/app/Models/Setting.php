<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

/**
 * A site setting. Only rows with `is_public = true` are ever serialised to the storefront, which
 * is what keeps an internal key (a backup path, an internal phone number) from leaking when
 * somebody adds it carelessly.
 *
 * One key is read on its own instead: the admin panel's address is what the storefront's router
 * needs *before* it renders, so it is served by `GET /content/admin-path` and may stay internal
 * (see `adminPath()`).
 */
#[Fillable(['key', 'value', 'type', 'group', 'is_public'])]
class Setting extends Model
{
    /** @use HasFactory<\Database\Factories\SettingFactory> */
    use HasFactory;

    /** The setting that carries the admin panel's own URL segment (`SettingRequest` validates it). */
    public const ADMIN_PATH_KEY = 'admin.path';

    /**
     * Used before that setting exists, and whenever its value is not one usable URL segment.
     *
     * `SettingSeeder` writes this same segment, and the storefront keeps its own copy of it
     * (`DEFAULT_ADMIN_PATH` in `src/admin/lib/basePath.ts`): the SPA draws the panel at that address
     * when this endpoint cannot be reached, so the two must stay equal — a shop whose API is briefly
     * unreachable must not answer its own panel's address with a 404.
     */
    public const DEFAULT_ADMIN_PATH = 'medora-panel';

    /**
     * Where the storefront mounts the admin panel.
     *
     * The panel is part of the storefront's own SPA, so the browser has to know the address before
     * the router draws — but that is the only reason it is served at all, and no reason to publish
     * it among the shop's settings. It is an address, never a lock: every admin route is guarded by
     * `can:admin.access` whatever the URL says.
     */
    public static function adminPath(): string
    {
        $value = mb_strtolower(trim((string) static::query()->where('key', self::ADMIN_PATH_KEY)->value('value')));

        return preg_match('/^[a-z0-9]+(?:-[a-z0-9]+)*$/', $value) === 1 ? $value : self::DEFAULT_ADMIN_PATH;
    }

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return ['is_public' => 'boolean'];
    }

    public function scopePublic(Builder $query): Builder
    {
        return $query->where('is_public', true);
    }

    /**
     * Value converted back from its stored string form.
     */
    public function typedValue(): string|int|bool|array|null
    {
        return match ($this->type) {
            'bool' => filter_var($this->value, FILTER_VALIDATE_BOOL),
            'int' => $this->value === null ? null : (int) $this->value,
            'json' => $this->value === null ? null : json_decode($this->value, true),
            default => $this->value,
        };
    }
}
