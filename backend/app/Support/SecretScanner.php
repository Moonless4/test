<?php

namespace App\Support;

/**
 * Does this text contain a credential?
 *
 * Written after the obvious approach failed: grepping for `password` finds a thousand lines of
 * variable names and misses a key that was pasted without one. So the scanner looks for *shapes*
 * that only a real credential has — provider prefixes, PEM headers, a 40-character base64 blob —
 * and only then asks whether it sits in an assignment that looks like configuration. A line that
 * reads a value from `env()` is configuration; a line that *is* the value is a leak.
 *
 * Findings never carry the secret. A preview is masked to a few characters so an operator can find
 * it in the file, and no more: this class may be run in a CI log.
 */
final class SecretScanner
{
    /**
     * Shapes that are a credential regardless of context.
     *
     * @var array<string, string>
     */
    private const PATTERNS = [
        'private-key' => '/-----BEGIN (RSA |DSA |EC |OPENSSH |PGP )?PRIVATE KEY-----/',
        'aws-access-key' => '/\b(AKIA|ASIA)[0-9A-Z]{16}\b/',
        'google-api-key' => '/\bAIza[0-9A-Za-z\-_]{35}\b/',
        'github-token' => '/\bgh[pousr]_[A-Za-z0-9]{36,}\b/',
        'slack-token' => '/\bxox[abprs]-[0-9A-Za-z\-]{10,}\b/',
        'stripe-secret' => '/\b(sk|rk)_live_[0-9A-Za-z]{20,}\b/',
        'jwt' => '/\beyJ[A-Za-z0-9_\-]{10,}\.eyJ[A-Za-z0-9_\-]{10,}\.[A-Za-z0-9_\-]{10,}\b/',
        'zarinpal-merchant' => '/\b[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}\b/',
        'smtp-credentials' => '#\bsmtps?://[^\s:@/]+:[^\s:@/]{6,}@#',
        'database-uri' => '#\b(mysql|mariadb|postgres|postgresql|mongodb|redis)://[^\s:@/]+:[^\s:@/]{6,}@#',
    ];

    /**
     * Keys that mean "a credential is on this line", used to decide whether an unclassified
     * high-entropy string is worth reporting.
     */
    private const CREDENTIALISH_KEY = '/(pass|pwd|secret|token|api[_-]?key|private[_-]?key|credential|signature|salt|nonce|client[_-]?secret|merchant)/i';

    /** Values that are plainly a placeholder, a variable or documentation. */
    private const PLACEHOLDER = '/(env\(|config\(|\$\{|\$[A-Za-z_]|<[a-z_]+>|example|placeholder|changeme|change_me|your[_-]|redacted|dummy|sample|fake|testing|xxxx|\.\.\.|\*{3,})/i';

    private const MIN_SECRET_LENGTH = 16;

    /**
     * @return array<int, array{line: int, kind: string, preview: string}>
     */
    public function findings(string $contents): array
    {
        $findings = [];
        $lines = preg_split('/\R/', $contents) ?: [];

        foreach ($lines as $index => $line) {
            $lineNumber = $index + 1;

            // A comment that documents a shape (this very class, the docs) is not a leak.
            $trimmed = trim($line);
            $isComment = str_starts_with($trimmed, '//')
                || str_starts_with($trimmed, '#')
                || str_starts_with($trimmed, '*')
                || str_starts_with($trimmed, '/*');

            if ($isComment) {
                continue;
            }

            foreach (self::PATTERNS as $kind => $pattern) {
                if (preg_match($pattern, $line, $matches) === 1) {
                    // A UUID in a docs table is not automatically a merchant id; only report the
                    // pattern when the line also names it.
                    if ($kind === 'zarinpal-merchant' && preg_match('/merchant/i', $line) !== 1) {
                        continue;
                    }

                    if ($this->isPlaceholder($matches[0])) {
                        continue;
                    }

                    $findings[] = [
                        'line' => $lineNumber,
                        'kind' => $kind,
                        'preview' => $this->mask($matches[0]),
                    ];
                }
            }

            foreach ($this->assignedSecrets($line) as $match) {
                $findings[] = [
                    'line' => $lineNumber,
                    'kind' => 'assigned-secret',
                    'preview' => $this->mask($match),
                ];
            }
        }

        return $findings;
    }

    /**
     * `SOMETHING_SECRET = "a-long-high-entropy-value"` — the case a provider-prefix pattern cannot
     * catch because the value is opaque.
     *
     * @return array<int, string>
     */
    private function assignedSecrets(string $line): array
    {
        // `KEY=value`, `"key": "value"`, `'key' => 'value'` — the shapes configuration files use.
        if (preg_match_all('/([A-Za-z_][A-Za-z0-9_\-]{2,})\s*(?:=|:|=>)\s*[\'"]([^\'"]{16,})[\'"]/', $line, $matches, PREG_SET_ORDER) === 0) {
            return [];
        }

        $found = [];

        foreach ($matches as $match) {
            [$whole, $key, $value] = [$match[0], $match[1], $match[2]];

            if (preg_match(self::CREDENTIALISH_KEY, $key) !== 1) {
                continue;
            }

            if ($this->isPlaceholder($value) || ! $this->looksRandom($value)) {
                continue;
            }

            $found[] = $value;
        }

        return $found;
    }

    private function isPlaceholder(string $value): bool
    {
        return preg_match(self::PLACEHOLDER, $value) === 1;
    }

    /**
     * High entropy, in the crude but effective sense: a long string with a mix of character
     * classes. "correct horse battery staple" fails this and a base64 key passes.
     */
    private function looksRandom(string $value): bool
    {
        if (strlen($value) < self::MIN_SECRET_LENGTH) {
            return false;
        }

        $classes = 0;
        $classes += preg_match('/[a-z]/', $value) === 1 ? 1 : 0;
        $classes += preg_match('/[A-Z]/', $value) === 1 ? 1 : 0;
        $classes += preg_match('/\d/', $value) === 1 ? 1 : 0;
        $classes += preg_match('/[^A-Za-z0-9]/', $value) === 1 ? 1 : 0;

        if ($classes < 3) {
            return false;
        }

        // Shannon entropy over the string's own characters: a repeated word scores low even when
        // it is long.
        $length = strlen($value);
        $counts = count_chars($value, 1);
        $entropy = 0.0;

        foreach ($counts as $count) {
            $probability = $count / $length;
            $entropy -= $probability * log($probability, 2);
        }

        return $entropy >= 3.2;
    }

    private function mask(string $secret): string
    {
        $visible = mb_substr($secret, 0, 4);

        return $visible.'<'.mb_strlen($secret).' chars>';
    }
}
