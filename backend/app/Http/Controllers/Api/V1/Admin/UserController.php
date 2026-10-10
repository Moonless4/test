<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\UserStatus;
use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\AdminIndexRequest;
use App\Http\Requests\Admin\UserRoleRequest;
use App\Http\Requests\Admin\UserUpdateRequest;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

/**
 * Account administration.
 *
 * Roles are a separate endpoint from the profile fields on purpose: "rename this person" and "make
 * this person an administrator" are different decisions, with different permissions
 * (`users.update` vs `users.roles`), and the audit trail should say which one happened.
 *
 * Two guards the permission alone cannot express:
 *
 *  - Only a super-admin may grant or revoke `super-admin`. `users.roles` lets an administrator manage
 *    roles — it must not let them mint a peer with more power than themselves.
 *  - Nobody may suspend their own account, which would otherwise be a way to lock the shop's owner
 *    out of the panel (checked in UserUpdateRequest).
 */
class UserController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(AdminIndexRequest $request): AnonymousResourceCollection
    {
        // `permissions` and `roles.permissions` are eager loaded because UserResource reports the
        // effective permission set; without them the list would run a query per row (and, in
        // development, trip the lazy-loading guard).
        $query = User::query()->with(['roles:id,name', 'roles.permissions:id,name', 'permissions:id,name']);

        if ($request->term() !== '') {
            $term = $request->escapedTerm();

            $query->where(function ($inner) use ($term): void {
                $inner->where('name', 'like', '%'.$term.'%')
                    ->orWhere('email', 'like', '%'.$term.'%')
                    ->orWhere('phone', 'like', '%'.$term.'%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->string('status')->value());
        }

        return UserResource::collection($query->orderByDesc('id')->paginate($request->perPage(20)));
    }

    public function show(User $user): UserResource
    {
        return new UserResource($user->load('roles', 'permissions'));
    }

    public function update(UserUpdateRequest $request, User $user): JsonResponse
    {
        $data = $request->validated();

        if (array_key_exists('name', $data)) {
            $user->name = $data['name'];
        }

        if (array_key_exists('phone', $data)) {
            $user->phone = $data['phone'];
        }

        if (array_key_exists('status', $data)) {
            $user->status = UserStatus::from((string) $data['status']);
        }

        $user->save();

        $this->audit->log('user.updated', $user, ['changed' => array_keys($data)]);

        return response()->json([
            'data' => ['user' => new UserResource($user->load('roles', 'permissions'))],
            'message' => 'حساب کاربری ذخیره شد.',
        ]);
    }

    public function updateRoles(UserRoleRequest $request, User $user): JsonResponse
    {
        /** @var array<int, string> $roles */
        $roles = $request->validated('roles');

        $actor = $request->user();

        if (! $actor instanceof User) {
            abort(403);
        }

        // A non-super-admin may not touch a super-admin, and may not create one.
        $protectsSuperAdmin = $user->hasRole('super-admin') || in_array('super-admin', $roles, true);

        if ($protectsSuperAdmin && ! $actor->hasRole('super-admin')) {
            return response()->json([
                'message' => 'فقط مدیر کل می‌تواند نقش «super-admin» را تغییر دهد.',
            ], 403);
        }

        $before = $user->getRoleNames()->all();

        DB::transaction(function () use ($user, $roles): void {
            $user->syncRoles($roles);
        });

        $this->audit->log('user.roles_updated', $user, [
            'before' => $before,
            'after' => $roles,
        ]);

        return response()->json([
            'data' => ['user' => new UserResource($user->refresh()->load('roles', 'permissions'))],
            'message' => 'نقش‌های کاربر به‌روزرسانی شد.',
        ]);
    }
}
