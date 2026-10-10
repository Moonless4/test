<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Support\Facades\Storage;

/**
 * A picture or document the store carries.
 *
 * An **uploaded** one is created by App\Services\MediaService *after* its bytes have been validated,
 * so the row always points at a real, checked file on the disk. An **imported** one (see
 * `source_url`) was never uploaded here: the catalogue it came from publishes the asset at its own
 * address, and `url()` hands that address out instead of a local path.
 */
#[Fillable(['disk', 'path', 'source_url', 'original_name', 'mime_type', 'size_bytes', 'width', 'height', 'checksum', 'is_public', 'uploaded_by'])]
class Media extends Model
{
    /** @use HasFactory<\Database\Factories\MediaFactory> */
    use HasFactory;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'size_bytes' => 'integer',
            'width' => 'integer',
            'height' => 'integer',
            'is_public' => 'boolean',
        ];
    }

    public function uploader(): BelongsTo
    {
        return $this->belongsTo(User::class, 'uploaded_by');
    }

    public function productImages(): HasMany
    {
        return $this->hasMany(ProductImage::class);
    }

    /**
     * Public URL for a public asset. Private files have no URL at all — they are streamed by
     * MediaController after an authorization check, so a guessed path is useless.
     *
     * An imported asset is published at its own `source_url` — the address the catalogue came from —
     * and has no file here; anything uploaded through the admin panel is served from the disk.
     */
    public function url(): ?string
    {
        if (! $this->is_public) {
            return null;
        }

        return $this->source_url ?: Storage::disk($this->disk)->url($this->path);
    }

    public function isImage(): bool
    {
        return str_starts_with($this->mime_type, 'image/');
    }
}
