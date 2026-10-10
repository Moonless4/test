<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\MorphTo;

/**
 * Append-only stock ledger. Written by App\Services\InventoryService inside the same transaction
 * as the stock change it records, so the ledger and `products.stock_quantity` cannot disagree.
 */
#[Fillable(['product_id', 'delta', 'reason', 'user_id', 'note'])]
class StockMovement extends Model
{
    /** @use HasFactory<\Database\Factories\StockMovementFactory> */
    use HasFactory;

    public const UPDATED_AT = null;

    public const REASON_SALE = 'sale';

    public const REASON_CANCELLATION = 'cancellation';

    public const REASON_RESTOCK = 'restock';

    public const REASON_CORRECTION = 'correction';

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'delta' => 'integer',
            'created_at' => 'datetime',
        ];
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reference(): MorphTo
    {
        return $this->morphTo();
    }
}
