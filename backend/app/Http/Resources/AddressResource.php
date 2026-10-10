<?php

namespace App\Http\Resources;

use App\Models\Address;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Address
 */
class AddressResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'label' => $this->label,
            'receiver_first_name' => $this->receiver_first_name,
            'receiver_last_name' => $this->receiver_last_name,
            'phone' => $this->phone,
            'province' => $this->province,
            'city' => $this->city,
            'postal_code' => $this->postal_code,
            'line1' => $this->line1,
            'line2' => $this->line2,
            'is_default' => $this->is_default,
        ];
    }
}
