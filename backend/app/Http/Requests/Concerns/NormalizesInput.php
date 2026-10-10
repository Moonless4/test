<?php

namespace App\Http\Requests\Concerns;

/**
 * Iranian users type phone numbers and postal codes with Persian (۰۹۱۲…) or Arabic (٠٩١٢…) digits,
 * and a numeric rule would reject them for no good reason.
 *
 * Conversion happens in `prepareForValidation()`, so every rule *and* every column sees Latin
 * digits — one normalisation point instead of a regex per field.
 */
trait NormalizesInput
{
    protected function toLatinDigits(?string $value): ?string
    {
        if ($value === null) {
            return null;
        }

        return strtr($value, [
            '۰' => '0', '۱' => '1', '۲' => '2', '۳' => '3', '۴' => '4',
            '۵' => '5', '۶' => '6', '۷' => '7', '۸' => '8', '۹' => '9',
            '٠' => '0', '١' => '1', '٢' => '2', '٣' => '3', '٤' => '4',
            '٥' => '5', '٦' => '6', '٧' => '7', '٨' => '8', '٩' => '9',
            // Arabic thousands separator and the Persian comma that sneak in when pasting.
            '٬' => '', '،' => '',
        ]);
    }
}
