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
     * The panel is part of the storefront's own SPA, so the browser has to know the address before
     * the router draws — the one value that cannot wait for a sign-in, which is why it travels on
     * its own instead of in `content/settings`. That in turn is what lets `admin.path` be an
     * internal setting: the panel's address is not part of the shop's published configuration, and
     * it is an address and never a lock (see `Setting::adminPath()`).
     */
    public function adminPath(): JsonResponse
    {
        return response()->json(['data' => ['path' => Setting::adminPath()]]);
    }
}
