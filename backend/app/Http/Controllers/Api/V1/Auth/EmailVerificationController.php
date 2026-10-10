<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Http\Controllers\Api\V1\Controller;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Auth\Events\Verified;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

/**
 * Email verification.
 *
 * The emailed link points straight at this endpoint and is **signed with a time-limited HMAC**
 * (`signed` middleware), so it cannot be replayed by hand-editing the id, cannot be forged, and
 * expires — which is what stops an old link from being used to prove an address that has since
 * changed hands.
 *
 * The `hash` in the URL is checked against the user's current email address as well, so changing
 * the address invalidates every link that was issued for the previous one.
 */
class EmailVerificationController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function verify(Request $request, int $id, string $hash): JsonResponse
    {
        /** @var User|null $user */
        $user = User::query()->find($id);

        if ($user === null) {
            // No detail about which id was wrong: the signature was valid, so this can only be an
            // old link for a deleted account.
            return response()->json(['message' => 'پیوند تأیید ایمیل معتبر نیست.'], 404);
        }

        if (! hash_equals($hash, sha1($user->getEmailForVerification()))) {
            return response()->json(['message' => 'پیوند تأیید ایمیل معتبر نیست.'], 403);
        }

        if (! $user->hasVerifiedEmail()) {
            $user->markEmailAsVerified();

            event(new Verified($user));

            $this->audit->log('auth.email_verified', $user, [], $user);
        }

        return response()->json(['message' => 'ایمیل شما تأیید شد.']);
    }

    /**
     * "Send the link again." Rate limited, and silent about whether the address exists or is
     * already verified, so it cannot be used to probe accounts.
     */
    public function resend(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user !== null && ! $user->hasVerifiedEmail()) {
            $user->sendEmailVerificationNotification();

            $this->audit->log('auth.email_verification_resent', $user, [], $user);
        }

        return response()->json([
            'message' => 'اگر ایمیل شما تأیید نشده باشد، پیوند تأیید ارسال می‌شود.',
        ]);
    }
}
