<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Inquiry extends Model
{
    protected $fillable = [
        'kind', 'name', 'email', 'phone', 'message',
        'property_id', 'preferred_date', 'preferred_time', 'status',
    ];

    protected $casts = [
        'preferred_date' => 'date',
    ];

    public function property(): BelongsTo
    {
        return $this->belongsTo(Property::class);
    }
}
