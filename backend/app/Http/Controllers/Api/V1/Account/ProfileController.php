<?php

namespace App\Http\Controllers\Api\V1\Account;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Account\UpdateProfileRequest;
use App\Http\Resources\UserResource;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function show(Request $request): UserResource
    {
        return new UserResource($request->user()->load('roles', 'permissions'));
    }

    /**
     * Updates the caller's *own* profile. The request cannot carry a role or a status, so this can
     * never escalate privileges — and the model's fillable list would refuse such a field anyway.
     *
     * A changed email address loses its verification: the new address has to be proved like any
     * other, otherwise changing the address would be a way to inherit a verified state.
     */
    public function update(UpdateProfileRequest $request): JsonResponse
    {
        $user = $request->user();
        $data = $request->validated();

        $emailChanged = isset($data['email']) && $data['email'] !== $user->email;

        $user->name = $data['name'] ?? $user->name;
        $user->phone = array_key_exists('phone', $data) ? $data['phone'] : $user->phone;

        if ($emailChanged) {
            $user->email = $data['email'];
            $user->email_verified_at = null;
        }

        $user->save();

        if ($emailChanged) {
            $user->sendEmailVerificationNotification();
        }

        $this->audit->log('account.profile_updated', $user, [
            'email_changed' => $emailChanged,
            'phone_changed' => array_key_exists('phone', $data),
        ], $user);

        return response()->json([
            'data' => ['user' => new UserResource($user->load('roles', 'permissions'))],
            'message' => $emailChanged
                ? 'مشخصات ذخیره شد. برای تأیید ایمیل جدید، پیوند ارسال‌شده را باز کنید.'
                : 'مشخصات ذخیره شد.',
        ]);
    }
}
