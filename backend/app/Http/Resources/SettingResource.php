<?php

namespace App\Http\Resources;

use App\Models\Setting;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * @mixin Setting
 */
class SettingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'key' => $this->key,
            // The stored value is a string; `type` is what turns it back into a number or a boolean,
            // so the frontend never has to guess or parse.
            'value' => $this->typedValue(),
            'type' => $this->type,
            'group' => $this->group,
        ];
    }
}
