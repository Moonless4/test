<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

/**
 * Retention for the two security logs.
 *
 *     php artisan security:prune
 *
 * The audit trail is append-only *in the application* — App\Models\AuditLog refuses updates and
 * deletes — but a log that is never pruned becomes a liability of its own: it is personal data
 * (addresses, emails, IPs) and it grows without bound on shared hosting. Retention is therefore an
 * explicit policy, applied here and nowhere else, with the periods set in
 * `config/security.php` → `audit`.
 *
 * It runs as a query, not through the models, precisely because the model refuses to delete: the
 * rule this command exists to apply is "age", and nothing else in the application may remove a row.
 */
class SecurityPruneCommand extends Command
{
    protected $signature = 'security:prune
        {--audit-days= : Override the audit retention period}
        {--attempt-days= : Override the login-attempt retention period}
        {--dry-run : Report what would be removed without removing it}';

    protected $description = 'Apply the retention policy to the audit trail and login attempts';

    public function handle(): int
    {
        $auditDays = (int) ($this->option('audit-days') ?? config('security.audit.retention_days', 365));
        $attemptDays = (int) ($this->option('attempt-days') ?? config('security.audit.login_attempt_retention_days', 90));
        $dryRun = (bool) $this->option('dry-run');

        $auditBefore = now()->subDays(max(1, $auditDays));
        $attemptBefore = now()->subDays(max(1, $attemptDays));

        $auditQuery = DB::table('audit_logs')->where('created_at', '<', $auditBefore);
        $attemptQuery = DB::table('login_attempts')->where('created_at', '<', $attemptBefore);

        if ($dryRun) {
            $this->line(sprintf('Would remove %d audit row(s) older than %s.', $auditQuery->count(), $auditBefore->toDateString()));
            $this->line(sprintf('Would remove %d login attempt(s) older than %s.', $attemptQuery->count(), $attemptBefore->toDateString()));

            return self::SUCCESS;
        }

        $audit = $auditQuery->delete();
        $attempts = $attemptQuery->delete();

        $this->info(sprintf('Removed %d audit row(s) and %d login attempt(s).', $audit, $attempts));

        return self::SUCCESS;
    }
}
