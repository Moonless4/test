<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\AdminIndexRequest;
use App\Http\Resources\AuditLogResource;
use App\Models\AuditLog;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;

/**
 * Read-only view of the audit trail.
 *
 * There is no write, update or delete route here, and there could not be a working one: the model
 * itself throws on update and delete. What is exposed is exactly what App\Services\AuditLogger
 * stored, credentials already redacted.
 */
class AuditLogController extends Controller
{
    public function index(AdminIndexRequest $request): AnonymousResourceCollection
    {
        $query = AuditLog::query()->with('user:id,name,email');

        if ($request->term() !== '') {
            $query->where('event', 'like', '%'.$request->escapedTerm().'%');
        }

        if ($request->filled('user_id')) {
            $query->where('user_id', $request->integer('user_id'));
        }

        return AuditLogResource::collection($query->orderByDesc('id')->paginate($request->perPage(30)));
    }

    public function show(Request $request, AuditLog $auditLog): AuditLogResource
    {
        return new AuditLogResource($auditLog->load('user:id,name,email'));
    }
}
