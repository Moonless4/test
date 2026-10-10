<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\AdminIndexRequest;
use App\Http\Requests\Admin\SettingRequest;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * Site settings.
 *
 * Unlike the public endpoint — which serves only `is_public` rows — this one lists everything,
 * because an operator has to be able to see (and edit) the values the storefront must not read.
 *
 * Two invariants are enforced in the request rather than here: a setting's `key` cannot be renamed by
 * an update (the storefront looks settings up by key, so a silent rename would break a page without
 * raising an error), and its `value` is stored as a string whatever shape it arrived in.
 */
class SettingController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(AdminIndexRequest $request): AnonymousResourceCollection
    {
        $query = Setting::query();

        if ($request->term() !== '') {
            $term = $request->escapedTerm();
            $query->where(fn ($inner) => $inner
                ->where('key', 'like', '%'.$term.'%')
                ->orWhere('group', 'like', '%'.$term.'%'));
        }

        if ($request->filled('category')) {
            $query->where('group', (string) $request->string('category')->value());
        }

        return SettingResource::collection(
            $query->orderBy('group')->orderBy('key')->paginate($request->perPage(50)),
        );
    }

    public function store(SettingRequest $request): JsonResponse
    {
        $setting = new Setting;
        $setting->key = (string) $request->string('key')->value();
        $setting->value = $request->storedValue();
        $setting->type = (string) ($request->string('type')->value() ?: 'string');
        $setting->group = (string) ($request->string('group')->value() ?: 'general');
        $setting->is_public = $request->boolean('is_public');
        $setting->save();

        $this->audit->log('setting.created', $setting, ['key' => $setting->key, 'public' => $setting->is_public]);

        return response()->json([
            'data' => ['setting' => new SettingResource($setting)],
            'message' => 'تنظیم ایجاد شد.',
        ], 201);
    }

    public function update(SettingRequest $request, Setting $setting): JsonResponse
    {
        // The key is immutable (prohibited in the request); only the value, its type and visibility
        // move.
        if ($request->has('value')) {
            $setting->value = $request->storedValue();
        }

        if ($request->filled('type')) {
            $setting->type = (string) $request->string('type')->value();
        }

        if ($request->filled('group')) {
            $setting->group = (string) $request->string('group')->value();
        }

        if ($request->has('is_public')) {
            $setting->is_public = $request->boolean('is_public');
        }

        $setting->save();

        $this->audit->log('setting.updated', $setting, ['key' => $setting->key, 'public' => $setting->is_public]);

        return response()->json([
            'data' => ['setting' => new SettingResource($setting)],
            'message' => 'تنظیم ذخیره شد.',
        ]);
    }

    public function destroy(Setting $setting): JsonResponse
    {
        $this->audit->log('setting.deleted', null, ['key' => $setting->key]);

        $setting->delete();

        return response()->json(['message' => 'تنظیم حذف شد.']);
    }
}
