<?php

namespace App\Http\Controllers\Api\V1\Content;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class SettingController extends Controller
{
    /**
     * Only keys marked public leave the building. A setting that is not public (an internal support
     * address, a backup path) simply does not exist as far as this endpoint is concerned.
     */
    public function index(): AnonymousResourceCollection
    {
        return SettingResource::collection(
            Setting::query()->public()->orderBy('group')->orderBy('key')->get(),
        );
    }

    /**
     * Where the storefront mounts the admin panel.
     *
     * **Why this one route is public.** The panel is part of the storefront's own SPA, so the panel's
     * *login* page lives under this prefix and is the first screen an operator sees — the address is
     * needed before anyone has a token, so requiring authentication here would not hide the panel, it
     * would make it unreachable (the SPA would fall back to `Setting::DEFAULT_ADMIN_PATH` and the
     * shop would answer the operator's own URL with a 404). It travels on its own instead of in
     * `content/settings`, which is what lets `admin.path` stay an internal setting: the panel's
     * address is not part of the shop's published configuration.
     *
     * **What it must never answer.** One URL segment, and nothing else — no key/value pair, no
     * token, no secret, no hint about which addresses are or are not the panel. The address is a
     * convenience and never a lock: every admin route is guarded on its own by `auth:sanctum`,
     * `full-auth`, `can:admin.access` and `two-factor` (see docs/SECURITY.md). Tests:
     * `tests/Feature/AdminPanelPathTest.php` asserts the payload is exactly `{data:{path}}`.
     */
    public function adminPath(): JsonResponse
    {
        return response()->json(['data' => ['path' => Setting::adminPath()]]);
    }
}
