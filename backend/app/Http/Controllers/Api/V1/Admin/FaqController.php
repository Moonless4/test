<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\AdminIndexRequest;
use App\Http\Requests\Admin\FaqRequest;
use App\Http\Resources\FaqResource;
use App\Models\Faq;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

/**
 * FAQ administration.
 *
 * The public endpoint serves `active()->ordered()`; here every entry is listed, including the
 * inactive ones, so a question can be retired without being deleted (and without losing the wording
 * that customers were answering against).
 */
class FaqController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(AdminIndexRequest $request): AnonymousResourceCollection
    {
        $query = Faq::query();

        if ($request->term() !== '') {
            $query->where('question', 'like', '%'.$request->escapedTerm().'%');
        }

        if ($request->filled('category')) {
            // The group label is what the panel filters by; the parameter is named `category` to
            // match the shared admin list query.
            $query->where('group', (string) $request->string('category')->value());
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->string('status')->value() === 'active');
        }

        return FaqResource::collection(
            $query->orderBy('group')->orderBy('position')->paginate($request->perPage(50)),
        );
    }

    public function store(FaqRequest $request): JsonResponse
    {
        $faq = new Faq;
        $faq->fill($request->validated());
        $faq->save();

        $this->audit->log('faq.created', $faq, ['group' => $faq->group]);

        return response()->json([
            'data' => ['faq' => new FaqResource($faq)],
            'message' => 'پرسش ایجاد شد.',
        ], 201);
    }

    public function update(FaqRequest $request, Faq $faq): JsonResponse
    {
        $data = $request->validated();

        $faq->fill($data);
        $faq->save();

        $this->audit->log('faq.updated', $faq, ['changed' => array_keys($data)]);

        return response()->json([
            'data' => ['faq' => new FaqResource($faq)],
            'message' => 'پرسش ذخیره شد.',
        ]);
    }

    public function destroy(Faq $faq): JsonResponse
    {
        $this->audit->log('faq.deleted', null, ['group' => $faq->group, 'question' => $faq->question]);

        $faq->delete();

        return response()->json(['message' => 'پرسش حذف شد.']);
    }
}
