<?php

namespace App\Http\Resources;

use App\Models\AuditLog;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * One audit row.
 *
 * The row is read-only by construction (the model refuses updates and deletes), and `metadata` has
 * already been scrubbed of credentials by App\Services\AuditLogger before it was written — this
 * resource only shapes what is already safe to show.
 *
 * @mixin AuditLog
 */
class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event' => $this->event,
            'description' => $this->description,
            'user' => $this->whenLoaded('user', fn () => $this->user !== null ? [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ] : null),
            'auditable' => $this->auditable_type !== null ? [
                'type' => $this->auditable_type,
                'id' => $this->auditable_id,
            ] : null,
            'ip_address' => $this->ip_address,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}
