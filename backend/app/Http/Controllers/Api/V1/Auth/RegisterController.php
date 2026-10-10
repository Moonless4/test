<?php

namespace App\Http\Controllers\Api\V1\Auth;

use App\Enums\UserStatus;
use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Auth\RegisterRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use App\Support\Tokens;
use Illuminate\Http\JsonResponse;

/**
 * Registration.
 *
 * The new account gets the `customer` role explicitly rather than "no role": a role that is granted
 * on purpose is easier to reason about than a missing one, and it means a later change to what
 * "customer" may do is one edit instead of a hunt through the codebase.
 *
 * The response carries a token so the shopper is signed in immediately — registration on a
 * storefront must not cost a second round trip — and an unverified account is allowed to shop;
 * email verification is available but not a gate (see docs/SECURITY.md, "Email verification").
 */
class RegisterController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function store(RegisterRequest $request): JsonResponse
    {
        $user = new User;

        $user->name = (string) $request->string('name');
        $user->email = (string) $request->string('email');
        $user->phone = $request->string('phone')->value() ?: null;
        // Hashed by the model's `hashed` cast — the plain value never touches the database layer.
        $user->password = (string) $request->string('password');
        $user->status = UserStatus::Active;
        $user->save();

        $user->assignRole('customer');

        $user->sendEmailVerificationNotification();

        $issued = Tokens::issue($user, (string) ($request->string('device_name')->value() ?: 'api'));

        $this->audit->log('auth.registered', $user, ['email' => $user->email], $user);

        return response()->json([
            'data' => [
                'user' => new UserResource($user->load('roles', 'permissions')),
                'token' => $issued['token'],
                'token_type' => 'Bearer',
                'expires_at' => $issued['expires_at'],
            ],
        ], 201);
    }
}
