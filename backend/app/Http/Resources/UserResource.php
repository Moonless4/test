<?php

namespace App\Http\Resources;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

/**
 * The account as the API exposes it.
 *
 * `password`, `remember_token` and every other credential column is hidden on the model itself, so
 * they cannot be exposed here even by accident; this resource only chooses which of the remaining
 * fields the client needs.
 *
 * @mixin User
 */
class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            // Null-safe: the column has a database default, so a null here means an object built
            // without a round trip to the database (a factory, an import) — it must not throw.
            'status' => $this->status?->value,
            'email_verified' => $this->email_verified_at !== null,
            'roles' => $this->whenLoaded('roles', fn () => $this->roles->pluck('name')->values()),
            'permissions' => $this->when(
                $this->relationLoaded('roles'),
                fn () => $this->getAllPermissions()->pluck('name')->values(),
            ),
            'created_at' => $this->created_at?->toIso8601String(),
            'last_login_at' => $this->last_login_at?->toIso8601String(),
            /*
             * Whether a second factor is armed — a status, never the secret. The panel needs it to
             * decide between "set up 2FA" and "enter your code"; the secret and the recovery codes
             * are in the model's hidden list and only ever leave the server once, from the
             * enrollment endpoints.
             */
            'two_factor_enabled' => $this->hasTwoFactorEnabled(),
        ];
    }
}
