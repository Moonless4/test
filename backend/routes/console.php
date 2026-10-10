<?php

use Illuminate\Support\Facades\Schedule;

/*
 * Scheduled work.
 *
 * On DirectAdmin hosting there is no Supervisor and no long-running daemon: the panel owns one
 * cron entry, `php artisan schedule:run` every minute, and this file decides what actually runs.
 * The entries in backend/deploy/cron.example are what a host pastes into "Cron Jobs".
 *
 * Every task uses withoutOverlapping(), which takes a cache lock — the database cache store is
 * locked per task, so a slow run never stacks up behind itself.
 */

// Abandoned guest carts: keeps the carts table from growing forever.
Schedule::command('carts:purge')->hourly()->withoutOverlapping();

// Expired Sanctum tokens. The tokens are already refused once expired; this is housekeeping.
Schedule::command('sanctum:prune-expired --hours=48')->daily()->withoutOverlapping();

// Failed queue jobs: kept a week, long enough to diagnose, short enough not to bloat the DB.
Schedule::command('queue:prune-failed --hours=168')->daily()->withoutOverlapping();

// Nightly database dump into the private disk (see docs/DEPLOYMENT-DIRECTADMIN.md, "Backup").
Schedule::command('db:backup')->dailyAt('02:30')->withoutOverlapping();
