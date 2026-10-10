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
 */
#[Fillable(['key', 'value', 'type', 'group', 'is_public'])]
class Setting extends Model
{
    /** @use HasFactory<\Database\Factories\SettingFactory> */
    use HasFactory;

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
