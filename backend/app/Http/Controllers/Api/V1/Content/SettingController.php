<?php

namespace App\Http\Controllers\Api\V1\Content;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Resources\SettingResource;
use App\Models\Setting;
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
}
