<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Agent extends Model
{
    protected $fillable = ['slug', 'name', 'role', 'photo_id', 'phone', 'email', 'specialty'];

    public function properties()
    {
        return $this->hasMany(Property::class);
    }
}
