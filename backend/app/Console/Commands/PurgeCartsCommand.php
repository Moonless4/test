<?php

namespace App\Console\Commands;

use App\Models\Cart;
use Illuminate\Console\Command;

/**
 * Drops abandoned guest carts. Runs hourly from the scheduler (which DirectAdmin triggers through
 * a single cron entry). Signed-in carts are kept: the shopper will come back to them.
 */
class PurgeCartsCommand extends Command
{
    protected $signature = 'carts:purge {--hours= : Override the guest cart TTL in hours}';

    protected $description = 'Delete expired guest carts';

    public function handle(): int
    {
        $hours = (int) ($this->option('hours') ?? config('shop.cart.guest_ttl_hours'));
        $cutoff = now()->subHours(max(1, $hours));

        $deleted = Cart::query()
            ->whereNull('user_id')
            ->where('status', Cart::STATUS_ACTIVE)
            ->where(function ($query) use ($cutoff): void {
                $query->where('expires_at', '<', now())
                    ->orWhere('updated_at', '<', $cutoff);
            })
            ->delete();

        $this->info("Purged {$deleted} abandoned guest cart(s).");

        return self::SUCCESS;
    }
}
