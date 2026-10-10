<?php

namespace App\Exceptions;

use RuntimeException;

/**
 * Thrown by App\Support\SafeUrl when an outbound address would reach something other than the
 * public internet. Callers answer with a validation error, never with the reason verbatim.
 */
class UnsafeUrlException extends RuntimeException
{
}
