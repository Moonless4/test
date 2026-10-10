<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Model;

/**
 * One authentication attempt. Written by App\Services\Security\LoginShield.
 *
 * Append-only like the audit trail, and deliberately free of anything a credential could hide in:
 * an address, a user agent, an optional country code, the outcome and why.
 */
#[Fillable(['email', 'ip', 'user_agent', 'country', 'device', 'successful', 'reason', 'created_at'])]
class LoginAttempt extends Model
{
    /** The table is a log: it has a creation time and nothing else. */
    public const UPDATED_AT = null;

    /**
     * @return array<string, string>
     */
    protected function casts(): array
    {
        return [
            'successful' => 'boolean',
            'created_at' => 'datetime',
        ];
    }
}
