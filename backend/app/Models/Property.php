<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Property extends Model
{
    protected $fillable = [
        'slug', 'name', 'city', 'region', 'country', 'price', 'type', 'status',
        'beds', 'baths', 'area', 'land', 'year', 'featured', 'summary',
        'description', 'features', 'amenities', 'image_id', 'agent_id',
    ];

    protected $casts = [
        'description' => 'array',
        'features' => 'array',
        'amenities' => 'array',
        'featured' => 'boolean',
        'price' => 'integer',
        'beds' => 'integer',
        'baths' => 'integer',
        'area' => 'integer',
        'land' => 'integer',
        'year' => 'integer',
    ];

    public function agent(): BelongsTo
    {
        return $this->belongsTo(Agent::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(PropertyImage::class)->orderBy('sort_order');
    }

    public function inquiries(): HasMany
    {
        return $this->hasMany(Inquiry::class);
    }

    public function favoritedBy()
    {
        return $this->belongsToMany(User::class, 'favorites')->withTimestamps();
    }
}
