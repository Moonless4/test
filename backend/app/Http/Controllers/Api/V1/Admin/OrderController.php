<?php

namespace App\Http\Controllers\Api\V1\Admin;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Api\V1\Controller;
use App\Http\Requests\Admin\AdminIndexRequest;
use App\Http\Requests\Admin\OrderStatusRequest;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderStatusHistory;
use App\Models\StockMovement;
use App\Services\AuditLogger;
use App\Services\InventoryService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;

/**
 * Order administration.
 *
 * The only thing this controller changes is the **status**, and it changes it in exactly one way:
 * through OrderStatus::canTransitionTo(). An illegal move (a delivered order back to "pending
 * payment", a refund of a refund) is a 422, not a new row — which is what keeps the lifecycle
 * readable years later. Every accepted move is written to `order_status_histories` with who made it,
 * and to the audit trail.
 *
 * Stock: cancelling or refunding returns the reserved quantities to the shelf through
 * App\Services\InventoryService, so the ledger explains the number. That can never happen twice,
 * because neither `cancelled` nor `refunded` has an outgoing transition.
 *
 * Money: a refund is recorded on the order (`payment_status = refunded`) but the payment rows are
 * left as they are — they record what the gateway actually did, and rewriting them would destroy the
 * only evidence of the original charge.
 */
class OrderController extends Controller
{
    public function __construct(
        private readonly InventoryService $inventory,
        private readonly AuditLogger $audit,
    ) {}

    public function index(AdminIndexRequest $request): AnonymousResourceCollection
    {
        $query = Order::query()->with(['user:id,name,email']);

        if ($request->term() !== '') {
            $term = $request->escapedTerm();

            // A shop's support desk searches by order number, buyer or phone.
            $query->where(function ($inner) use ($term): void {
                $inner->where('number', 'like', '%'.$term.'%')
                    ->orWhere('customer_email', 'like', '%'.$term.'%')
                    ->orWhere('customer_phone', 'like', '%'.$term.'%')
                    ->orWhere('customer_name', 'like', '%'.$term.'%');
            });
        }

        if ($request->filled('status')) {
            $query->where('status', (string) $request->string('status')->value());
        }

        return OrderResource::collection(
            $query->orderByDesc('placed_at')->orderByDesc('id')
                ->paginate($request->perPage(20)),
        );
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource(
            $order->load(['items', 'payments', 'statusHistories', 'user:id,name,email']),
        );
    }

    public function updateStatus(OrderStatusRequest $request, Order $order): JsonResponse
    {
        $next = OrderStatus::from((string) $request->string('status')->value());
        $current = $order->status;

        if (! $current->canTransitionTo($next)) {
            return response()->json([
                'message' => "تغییر وضعیت از «{$current->value}» به «{$next->value}» مجاز نیست.",
                'allowed' => array_map(static fn (OrderStatus $status): string => $status->value, $current->allowedTransitions()),
            ], 422);
        }

        $order = DB::transaction(function () use ($order, $next, $current, $request): Order {
            if (in_array($next, [OrderStatus::Cancelled, OrderStatus::Refunded], true)) {
                // The order was cancelled or refunded: put what it reserved back on the shelf,
                // recorded in stock_movements under the order it belongs to.
                $itemCount = $order->items()->count();

                if ($itemCount > 0) {
                    $this->inventory->restore(
                        $order->items()->get(),
                        $next === OrderStatus::Refunded
                            ? StockMovement::REASON_RESTOCK
                            : StockMovement::REASON_CANCELLATION,
                        $order,
                        $request->user(),
                        'وضعیت سفارش: '.$next->value,
                    );
                }

                if ($next === OrderStatus::Refunded) {
                    $order->payment_status = PaymentStatus::Refunded;
                }
            }

            $order->status = $next;
            $order->save();

            $history = new OrderStatusHistory;
            $history->order_id = $order->getKey();
            $history->from_status = $current;
            $history->to_status = $next;
            $history->changed_by = $request->user()?->getKey();
            $history->note = $request->string('note')->value() ?: null;
            $history->created_at = now();
            $history->save();

            return $order;
        });

        $this->audit->log('order.status_changed', $order, [
            'number' => $order->number,
            'from' => $current->value,
            'to' => $next->value,
        ], $request->user(), $request->string('note')->value() ?: null);

        return response()->json([
            'data' => ['order' => new OrderResource($order->load(['items', 'payments', 'statusHistories']))],
            'message' => 'وضعیت سفارش به‌روزرسانی شد.',
        ]);
    }
}
