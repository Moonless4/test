<?php

namespace App\Services;

use App\Models\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Request;

/**
 * Writes the audit trail.
 *
 * Two rules hold everywhere in this class:
 *
 *  1. A credential never reaches the database. Keys that look like a password, a token, a secret,
 *     a card number or an API key are replaced by "[redacted]" — recursively, at any depth.
 *  2. Values are truncated, so a mistake cannot turn a log row into a copy of a request body.
 */
class AuditLogger
{
    private const REDACTED = '[redacted]';

    private const MAX_STRING_LENGTH = 500;

    private const MAX_DEPTH = 4;

    /**
     * Anything matching this pattern is never stored, whatever the caller passes in.
     */
    private const SENSITIVE_KEY_PATTERN = '/(pass|secret|token|authorization|api[_-]?key|signature|card|pan|cvv|cvc|otp|merchant)/i';

    /**
     * @param  array<string, mixed>  $metadata
     */
    public function log(
        string $event,
        ?Model $auditable = null,
        array $metadata = [],
        ?User $user = null,
        ?string $description = null,
    ): AuditLog {
        $log = new AuditLog;

        $log->user_id = ($user ?? Request::user())?->getKey();
        $log->event = $event;
        $log->description = $description !== null ? mb_substr($description, 0, 255) : null;
        $log->ip_address = Request::ip();
        $log->user_agent = mb_substr((string) Request::userAgent(), 0, 255) ?: null;
        $log->metadata = $this->scrub($metadata) ?: null;
        $log->created_at = now();

        if ($auditable !== null) {
            $log->auditable_type = $auditable->getMorphClass();
            $log->auditable_id = $auditable->getKey();
        }

        $log->save();

        return $log;
    }

    /**
     * @param  array<string, mixed>  $values
     * @return array<string, mixed>
     */
    private function scrub(array $values, int $depth = 0): array
    {
        if ($depth > self::MAX_DEPTH) {
            return [];
        }

        $clean = [];

        foreach ($values as $key => $value) {
            if (is_string($key) && preg_match(self::SENSITIVE_KEY_PATTERN, $key) === 1) {
                $clean[$key] = self::REDACTED;

                continue;
            }

            $clean[$key] = match (true) {
                is_array($value) => $this->scrub(Arr::isAssoc($value) ? $value : ['items' => array_values($value)], $depth + 1),
                is_bool($value), is_int($value), is_float($value), $value === null => $value,
                is_scalar($value) => mb_substr((string) $value, 0, self::MAX_STRING_LENGTH),
                default => '[unsupported]',
            };
        }

        return $clean;
    }
}
