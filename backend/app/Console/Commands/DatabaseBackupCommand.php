<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use Symfony\Component\Process\Exception\ProcessFailedException;
use Symfony\Component\Process\Process;

/**
 * Nightly database dump into the private disk (`storage/app/backups`), which is not reachable from
 * the browser.
 *
 * Safety notes:
 *
 *  - The command is built as an **argument array**, not a shell string, so there is nothing for the
 *    shell to interpret and no way for a value (a database name, a path) to become a command.
 *  - The password travels in the child process environment (`MYSQL_PWD`), never on the command line,
 *    so it cannot be read from `ps` output the way `-psecret` would allow.
 *  - Nothing prints the password.
 *
 * On a DirectAdmin account `mysqldump` normally exists; if the host removed it, set DB_BACKUP_BINARY
 * to its path or use the panel's own backup. `php artisan db:backup --keep-days=7` overrides
 * retention.
 */
class DatabaseBackupCommand extends Command
{
    protected $signature = 'db:backup
        {--keep-days= : How many days of dumps to keep}
        {--path= : Directory to write the dump to (defaults to storage/app/backups)}';

    protected $description = 'Write a compressed MySQL/MariaDB dump to the private disk';

    public function handle(): int
    {
        $connection = (string) config('database.default');
        $driver = (string) config("database.connections.{$connection}.driver");

        if (! in_array($driver, ['mysql', 'mariadb'], true)) {
            $this->error("The default connection uses the `{$driver}` driver; this command only supports MySQL/MariaDB.");

            return self::FAILURE;
        }

        $config = (array) config("database.connections.{$connection}");
        $binary = (string) env('DB_BACKUP_BINARY', 'mysqldump');
        $directory = (string) ($this->option('path') ?: storage_path('app/backups'));

        File::ensureDirectoryExists($directory, 0750);

        $database = (string) ($config['database'] ?? '');
        $file = $directory.'/'.$database.'-'.now()->format('Ymd-His').'.sql.gz';

        $process = new Process([
            $binary,
            '--host='.($config['host'] ?? '127.0.0.1'),
            '--port='.($config['port'] ?? '3306'),
            '--user='.($config['username'] ?? ''),
            '--single-transaction',
            '--quick',
            '--skip-lock-tables',
            '--default-character-set='.($config['charset'] ?? 'utf8mb4'),
            '--routines',
            '--events',
            $database,
        ], null, [
            // In the environment, not in argv: invisible to other processes.
            'MYSQL_PWD' => (string) ($config['password'] ?? ''),
        ]);

        $this->info('Writing '.$file);

        try {
            // The dump is piped through gzip so a full database does not fill the account's quota.
            $process->setTimeout(1800);
            $process->run();

            if (! $process->isSuccessful()) {
                throw new ProcessFailedException($process);
            }

            $dump = $process->getOutput();

            if ($dump === '') {
                $this->error('The database returned nothing; refusing to keep an empty backup.');

                return self::FAILURE;
            }

            $compressed = gzencode($dump, 6);

            if ($compressed === false) {
                $this->error('Could not compress the dump.');

                return self::FAILURE;
            }

            File::put($file, $compressed, true);
            @chmod($file, 0640);
        } catch (\Throwable $e) {
            // The exception message can contain the command line, which is why the password is not
            // there to begin with.
            $this->error('Backup failed: '.$e->getMessage());

            return self::FAILURE;
        }

        $removed = $this->prune($directory);
        $size = File::size($file);

        $this->info(sprintf('Backup written: %s (%s). %d old dump(s) removed.', basename($file), $this->human($size), $removed));

        return self::SUCCESS;
    }

    private function prune(string $directory): int
    {
        $keepDays = (int) ($this->option('keep-days') ?? config('media.backup_keep_days', env('BACKUP_KEEP_DAYS', 14)));
        $cutoff = now()->subDays(max(1, $keepDays))->getTimestamp();
        $removed = 0;

        foreach (File::glob($directory.'/*.sql.gz') ?: [] as $file) {
            if (File::lastModified($file) < $cutoff && File::delete($file)) {
                $removed++;
            }
        }

        return $removed;
    }

    private function human(int $bytes): string
    {
        return $bytes >= 1024 * 1024 ? round($bytes / 1024 / 1024, 1).' MB' : round($bytes / 1024).' KB';
    }
}
