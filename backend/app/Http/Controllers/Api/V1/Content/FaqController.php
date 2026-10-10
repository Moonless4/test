<?php

namespace App\Http\Controllers\Api\V1\Content;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Content\ContentIndexRequest;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class FaqController extends Controller
{
    public function index(ContentIndexRequest $request): AnonymousResourceCollection
    {
        $query = Faq::query()->active()->ordered();

        if (($group = $request->string('group')->trim()->value()) !== '') {
            $query->where('group', $group);
        }

        return FaqResource::collection($query->get());
    }
}
