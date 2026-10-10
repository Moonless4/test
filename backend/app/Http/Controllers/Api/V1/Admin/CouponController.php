<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\CouponType;
use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\AdminIndexRequest;
use App\Http\Requests\Admin\CouponRequest;
use App\Http\Resources\CouponResource;
use App\Models\Coupon;
use App\Services\AuditLogger;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Arr;

/**
 * Discount-code administration.
 *
 * A coupon that has already been redeemed is never deleted: `coupon_redemptions` cascades on delete,
 * so removing the row would erase who used the code and on which order. The endpoint refuses instead
 * and points at deactivation (`is_active = false`), which is what an operator usually means anyway.
 *
 * `used_count` is owned by the checkout transaction, not by this controller — a payload cannot set
 * it, and the fillable list on the model does not contain it.
 */
class CouponController extends Controller
{
    public function __construct(private readonly AuditLogger $audit) {}

    public function index(AdminIndexRequest $request): AnonymousResourceCollection
    {
        $query = Coupon::query();

        if ($request->term() !== '') {
            $query->where('code', 'like', '%'.mb_strtoupper($request->escapedTerm()).'%');
        }

        if ($request->filled('status')) {
            $query->where('is_active', $request->string('status')->value() === 'active');
        }

        return CouponResource::collection($query->orderByDesc('id')->paginate($request->perPage(20)));
    }

    public function show(Coupon $coupon): CouponResource
    {
        return new CouponResource($coupon);
    }

    public function store(CouponRequest $request): JsonResponse
    {
        $coupon = new Coupon;
        $coupon->fill($request->validated());
        $coupon->save();

        $this->audit->log('coupon.created', $coupon, [
            'code' => $coupon->code,
            'type' => $coupon->type->value,
            'value' => $coupon->value,
        ]);

        return response()->json([
            'data' => ['coupon' => new CouponResource($coupon)],
            'message' => 'کد تخفیف ایجاد شد.',
        ], 201);
    }

    public function update(CouponRequest $request, Coupon $coupon): JsonResponse
    {
        $data = $request->validated();

        $coupon->fill(Arr::except($data, ['type']));

        if (isset($data['type'])) {
            $coupon->type = CouponType::from((string) $data['type']);
        }

        $coupon->save();

        $this->audit->log('coupon.updated', $coupon, ['code' => $coupon->code, 'changed' => array_keys($data)]);

        return response()->json([
            'data' => ['coupon' => new CouponResource($coupon)],
            'message' => 'کد تخفیف ذخیره شد.',
        ]);
    }

    public function destroy(Coupon $coupon): JsonResponse
    {
        if ($coupon->redemptions()->exists()) {
            return response()->json([
                'message' => 'این کد استفاده شده است و حذف آن تاریخچهٔ استفاده را پاک می‌کند. به‌جای حذف، آن را غیرفعال کنید.',
            ], 422);
        }

        $this->audit->log('coupon.deleted', null, ['code' => $coupon->code]);

        $coupon->delete();

        return response()->json(['message' => 'کد تخفیف حذف شد.']);
    }
}
