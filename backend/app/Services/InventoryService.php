<?php

namespace App\Services;

use App\Exceptions\InsufficientStockException;
use App\Models\Order;
use App\Models\Product;
use App\Models\StockMovement;
use App\Models\User;
use Illuminate\Database\Eloquent\Collection;
use Illuminate\Support\Facades\DB;

/**
 * The only place `products.stock_quantity` is allowed to change.
 *
 * Every change is (a) made under a row lock, so two simultaneous checkouts cannot both sell the
 * last item, and (b) written to the stock_movements ledger in the same transaction, so the number
 * and its history can never disagree.
 */
class InventoryService
{
    /**
     * Takes stock for a checkout.
     *
     * @param  array<int, array{product: Product, quantity: int}>  $lines
     *
     * @throws InsufficientStockException
     */
    public function reserve(array $lines, ?Order $order = null, ?User $user = null): void
    {
        $shortages = [];

        // Lock every product first, in a deterministic order (by id): two checkouts that touch
        // the same two products then take their locks in the same sequence and cannot deadlock.
        $ids = array_map(static fn (array $line): int => (int) $line['product']->getKey(), $lines);
        sort($ids);

        $locked = Product::query()
            ->whereIn('id', $ids)
            ->orderBy('id')
            ->lockForUpdate()
            ->get()
            ->keyBy('id');

        foreach ($lines as $line) {
            /** @var Product $product */
            $product = $locked->get((int) $line['product']->getKey());
            $quantity = (int) $line['quantity'];

            if ($product === null || ! $product->is_active || $product->stock_quantity < $quantity) {
                $shortages[] = [
                    'product_id' => (int) $line['product']->getKey(),
                    'name' => (string) $line['product']->name,
                    'requested' => $quantity,
                    'available' => $product?->stock_quantity ?? 0,
                ];
            }
        }

        if ($shortages !== []) {
            throw new InsufficientStockException($shortages);
        }

        foreach ($lines as $line) {
            /** @var Product $product */
            $product = $locked->get((int) $line['product']->getKey());
            $quantity = (int) $line['quantity'];

            // A raw expression keeps the change atomic: two checkouts cannot read-modify-write the
            // same number and lose one of the sales.
            Product::query()->whereKey($product->getKey())->decrement('stock_quantity', $quantity);

            $this->record($product, -$quantity, StockMovement::REASON_SALE, $order, $user);
        }
    }

    /**
     * Puts stock back — a cancelled or refunded order, or a manual correction by an administrator.
     *
     * @param  Collection<int, \App\Models\OrderItem>|\Illuminate\Support\Collection<int, \App\Models\OrderItem>  $items
     */
    public function restore(iterable $items, string $reason, ?Order $order = null, ?User $user = null, ?string $note = null): void
    {
        foreach ($items as $item) {
            if ($item->product_id === null) {
                continue; // The product has since been deleted; there is nothing to restock.
            }

            $product = Product::query()->whereKey($item->product_id)->lockForUpdate()->first();

            if ($product === null) {
                continue;
            }

            Product::query()->whereKey($product->getKey())->increment('stock_quantity', $item->quantity);

            $this->record($product, (int) $item->quantity, $reason, $order, $user, $note);
        }
    }

    /**
     * An administrator's deliberate stock change. Always recorded, never silent.
     */
    public function adjust(Product $product, int $newQuantity, User $user, ?string $note = null): void
    {
        DB::transaction(function () use ($product, $newQuantity, $user, $note): void {
            $locked = Product::query()->whereKey($product->getKey())->lockForUpdate()->firstOrFail();
            $delta = $newQuantity - (int) $locked->stock_quantity;

            $locked->stock_quantity = $newQuantity;
            $locked->save();

            if ($delta !== 0) {
                $this->record($locked, $delta, StockMovement::REASON_CORRECTION, null, $user, $note);
            }
        });
    }

    private function record(
        Product $product,
        int $delta,
        string $reason,
        ?Order $order,
        ?User $user,
        ?string $note = null,
    ): void {
        $movement = new StockMovement;

        $movement->product_id = $product->getKey();
        $movement->delta = $delta;
        $movement->reason = $reason;
        $movement->user_id = $user?->getKey();
        $movement->note = $note;
        $movement->created_at = now();

        if ($order !== null) {
            $movement->reference_type = $order->getMorphClass();
            $movement->reference_id = $order->getKey();
        }

        $movement->save();
    }
}
