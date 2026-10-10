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

        $faqs = $query->get();

        // The FAQ page is built from one call, so the list is not paginated — but the response
        // still reports how many entries the filter matched, like every other public list.
        return FaqResource::collection($faqs)->additional(['meta' => ['total' => $faqs->count()]]);
    }
}
