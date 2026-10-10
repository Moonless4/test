<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;
use LogicException;

/**
 * Security and business audit trail — append only.
 *
 * Rows are written by App\Services\AuditLogger, which strips credentials before the row is saved.
 * The model refuses updates and deletes so an application bug cannot rewrite history; the real
 * guarantee is the database — see docs/DEPLOYMENT-DIRECTADMIN.md, which recommends a MySQL user
 * without DELETE on this table.
 */
#[Fillable([])]
class AuditLog extends Model
{
    /** @use HasFactory<\Database\Factories\AuditLogFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'metadata' => 'array',
            'created_at' => 'datetime',
        ];
    }

    protected static function booted(): void
    {
        static::updating(function (): never {
            throw new LogicException('Audit log rows are immutable.');
        });

        static::deleting(function (): never {
            throw new LogicException('Audit log rows cannot be deleted through the application.');
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function auditable(): MorphTo
    {
        return $this->morphTo();
    }
}
