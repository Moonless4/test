<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Auth\ForgotPasswordRequest;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Password;

/**
 * "I forgot my password."
 *
 * The answer is identical whether or not the address exists — otherwise this endpoint becomes a
 * free account-enumeration service. The reset request is still recorded, but with a hash of the
 * address rather than the address itself: an audit log is not a mailing list.
 */
class ForgotPasswordController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function store(ForgotPasswordRequest $request): JsonResponse
    {
        $email = (string) $request->string('email');

        Password::sendResetLink(['email' => $email]);

        $this->audit->log('auth.password_reset_requested', null, [
            'email_hash' => hash('sha256', $email),
        ]);

        return response()->json([
            'message' => 'اگر این ایمیل در فروشگاه ثبت شده باشد، پیوند بازیابی رمز برای شما ارسال می‌شود.',
        ]);
    }
}
