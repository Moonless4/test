<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AgentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->slug,
            'name' => $this->name,
            'role' => $this->role,
            'photoId' => $this->photo_id,
            'phone' => $this->phone,
            'email' => $this->email,
            'specialty' => $this->specialty,
        ];
    }
}
