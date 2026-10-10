<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

/**
 * Checks that this host can actually run the application.
 *
 * Written for the DirectAdmin reality: PHP version and extensions vary per account, `display_errors`
 * is sometimes left on, and ionCube Loader may or may not be installed for the selected PHP
 * version. Run it after uploading and before pointing the domain at public/:
 *
 *     php artisan app:preflight
 *
 * Exit code 0 = no blocking problem. Exit code 1 = at least one FAIL to fix first.
 * Nothing here prints a credential: values are only ever reported as set/unset.
 */
class PreflightCommand extends Command
{
    protected $signature = 'app:preflight {--json : Machine-readable output}';

    protected $description = 'Verify PHP, extensions, permissions and production settings for this host';

    /** Extensions Laravel itself requires. */
    private const REQUIRED_EXTENSIONS = [
        'ctype', 'curl', 'dom', 'fileinfo', 'filter', 'hash', 'mbstring',
        'openssl', 'pcre', 'pdo', 'pdo_mysql', 'session', 'tokenizer', 'xml',
    ];

    /** Nice to have: checked, reported, but never blocking. */
    private const OPTIONAL_EXTENSIONS = ['bcmath', 'gd', 'imagick', 'intl', 'zip', 'sodium'];

    public function handle(): int
    {
        $results = [];

        $this->checkPhp($results);
        $this->checkExtensions($results);
        $this->checkIoncube($results);
        $this->checkPhpIni($results);
        $this->checkApplication($results);
        $this->checkPermissions($results);
        $this->checkDatabase($results);
        $this->checkRuntime($results);

        if ($this->option('json')) {
            $this->line(json_encode($results, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
        } else {
            $this->render($results);
        }

        return collect($results)->contains(fn (array $row): bool => $row['status'] === 'FAIL') ? self::FAILURE : self::SUCCESS;
    }

    /**
     * @param  array<int, array{area: string, check: string, status: string, detail: string}>  $results
     */
    private function add(array &$results, string $area, string $check, string $status, string $detail = ''): void
    {
        $results[] = compact('area', 'check', 'status', 'detail');
    }

    private function checkPhp(array &$results): void
    {
        $version = PHP_VERSION;
        $ok = version_compare($version, '8.3.0', '>=');

        $this->add(
            $results,
            'PHP',
            'Version >= 8.3',
            $ok ? 'PASS' : 'FAIL',
            $ok ? $version : "{$version} — Laravel 13 needs PHP 8.3 or newer; select it in DirectAdmin → PHP Selector.",
        );

        $this->add($results, 'PHP', 'SAPI', 'INFO', PHP_SAPI);
    }

    private function checkExtensions(array &$results): void
    {
        foreach (self::REQUIRED_EXTENSIONS as $extension) {
            $loaded = extension_loaded($extension);

            $this->add(
                $results,
                'Extensions',
                $extension,
                $loaded ? 'PASS' : 'FAIL',
                $loaded ? '' : 'Missing — enable it in DirectAdmin → PHP Selector → Extensions.',
            );
        }

        foreach (self::OPTIONAL_EXTENSIONS as $extension) {
            if (extension_loaded($extension)) {
                $this->add($results, 'Extensions', $extension, 'PASS', 'optional, loaded');
            }
        }
    }

    private function checkIoncube(array &$results): void
    {
        $loaded = extension_loaded('ionCube Loader');

        // Only informational: an un-encoded deployment runs fine without the loader, and an
        // encoded one cannot run without it.
        $this->add(
            $results,
            'ionCube',
            'Loader installed',
            $loaded ? 'PASS' : 'INFO',
            $loaded
                ? 'ionCube Loader is available for this PHP version.'
                : 'Not loaded. Fine for readable source; encoded files will NOT run. See docs/IONCUBE.md.',
        );

        if ($loaded && function_exists('ioncube_loader_version')) {
            $this->add($results, 'ionCube', 'Loader version', 'INFO', (string) ioncube_loader_version());
        }
    }

    private function checkPhpIni(array &$results): void
    {
        $displayErrors = filter_var(ini_get('display_errors'), FILTER_VALIDATE_BOOL);

        $this->add(
            $results,
            'php.ini',
            'display_errors off',
            $displayErrors ? 'FAIL' : 'PASS',
            $displayErrors
                ? 'On — PHP would print paths and errors to the browser. Set display_errors = Off for the account.'
                : '',
        );

        $urlInclude = filter_var(ini_get('allow_url_include'), FILTER_VALIDATE_BOOL);

        $this->add($results, 'php.ini', 'allow_url_include off', $urlInclude ? 'FAIL' : 'PASS');

        $expose = filter_var(ini_get('expose_php'), FILTER_VALIDATE_BOOL);

        $this->add($results, 'php.ini', 'expose_php off', $expose ? 'WARN' : 'PASS');

        $uploadMax = $this->iniBytes('upload_max_filesize');
        $required = ((int) config('security.uploads.max_kb') * 1024);

        $this->add(
            $results,
            'php.ini',
            'upload_max_filesize',
            $uploadMax >= $required ? 'PASS' : 'WARN',
            'limit '.$this->human($uploadMax).', application limit '.$this->human($required),
        );

        $postMax = $this->iniBytes('post_max_size');

        $this->add(
            $results,
            'php.ini',
            'post_max_size',
            $postMax >= $required ? 'PASS' : 'WARN',
            'limit '.$this->human($postMax),
        );
    }

    private function checkApplication(array &$results): void
    {
        $this->add($results, 'Application', 'APP_KEY set', config('app.key') ? 'PASS' : 'FAIL', config('app.key') ? '' : 'Run: php artisan key:generate');

        $debug = (bool) config('app.debug');

        $this->add(
            $results,
            'Application',
            'APP_DEBUG=false',
            $debug ? 'FAIL' : 'PASS',
            $debug ? 'Set APP_DEBUG=false; a stack trace would leak paths and configuration.' : '',
        );

        $this->add(
            $results,
            'Application',
            'APP_ENV=production',
            config('app.env') === 'production' ? 'PASS' : 'WARN',
            'currently: '.config('app.env'),
        );

        $this->add($results, 'Application', 'APP_URL https', str_starts_with((string) config('app.url'), 'https://') ? 'PASS' : 'WARN', (string) config('app.url'));

        $origins = (array) config('security.allowed_origins');

        $this->add(
            $results,
            'Application',
            'CORS_ALLOWED_ORIGINS',
            $origins === [] ? 'WARN' : 'PASS',
            $origins === [] ? 'Empty — browsers on the storefront domain will be refused.' : implode(', ', $origins),
        );

        $hosts = (array) config('security.trusted_hosts');

        $this->add(
            $results,
            'Application',
            'TRUSTED_HOSTS',
            $hosts === [] ? 'WARN' : 'PASS',
            $hosts === [] ? 'Empty — host header checking is disabled.' : implode(', ', $hosts),
        );

        $this->add(
            $results,
            'Application',
            'Session driver not file?',
            config('session.driver') === 'database' ? 'PASS' : 'INFO',
            'currently: '.config('session.driver'),
        );

        $logLevel = $this->resolvedLogLevel();

        $this->add(
            $results,
            'Application',
            'LOG_LEVEL not debug',
            mb_strtolower($logLevel) === 'debug' ? 'WARN' : 'PASS',
            'currently: '.$logLevel,
        );

        $gatewayConfigured = app(\App\Services\Payments\PaymentGateway::class)->isConfigured();

        $this->add(
            $results,
            'Application',
            'Payment gateway configured',
            $gatewayConfigured ? 'PASS' : 'WARN',
            $gatewayConfigured ? '' : 'ZARINPAL_MERCHANT_ID is empty — checkout will answer 502 until it is set.',
        );
    }

    private function checkPermissions(array &$results): void
    {
        foreach (['storage', 'storage/app', 'storage/framework', 'storage/logs', 'bootstrap/cache'] as $path) {
            $full = base_path($path);
            $writable = is_dir($full) && is_writable($full);

            $this->add(
                $results,
                'Permissions',
                $path.' writable',
                $writable ? 'PASS' : 'FAIL',
                $writable ? '' : 'Set 775 (and the same group as the web server user).'
            );
        }

        $publicStorage = public_path('storage');

        $this->add(
            $results,
            'Permissions',
            'public/storage symlink',
            is_link($publicStorage) ? 'PASS' : 'INFO',
            is_link($publicStorage) ? '' : 'Run `php artisan storage:link` if you store public media (product images).',
        );

        $this->add(
            $results,
            'Permissions',
            'Document root is /public',
            'INFO',
            'Confirm in DirectAdmin that the domain points at public/; .htaccess in the project root is a fallback, not a substitute.',
        );
    }

    private function checkDatabase(array &$results): void
    {
        $driver = config('database.default');

        $this->add($results, 'Database', 'Driver', in_array($driver, ['mysql', 'mariadb'], true) ? 'PASS' : 'FAIL', $driver);

        try {
            $version = DB::selectOne('select version() as version')?->version;

            $this->add($results, 'Database', 'Connection', 'PASS', (string) $version);

            $this->add(
                $results,
                'Database',
                'Migrations table',
                Schema::hasTable('migrations') ? 'PASS' : 'WARN',
                Schema::hasTable('migrations') ? '' : 'Run: php artisan migrate --force',
            );
        } catch (\Throwable $e) {
            $this->add($results, 'Database', 'Connection', 'FAIL', 'Could not connect; check DB_* in .env (never use the MySQL root account).');
        }
    }

    private function checkRuntime(array &$results): void
    {
        $queue = (string) config('queue.default');

        $this->add(
            $results,
            'Runtime',
            'Queue',
            $queue === 'database' ? 'PASS' : 'WARN',
            $queue === 'sync'
                ? 'sync — mail is sent during the request. Use the database queue plus the cron entry.'
                : $queue,
        );

        $cache = (string) config('cache.default');

        $this->add(
            $results,
            'Runtime',
            'Cache',
            $cache === 'array' ? 'WARN' : 'PASS',
            $cache === 'array' ? 'array — rate limits and locks do not survive between requests.' : $cache,
        );

        $this->add($results, 'Runtime', 'Timezone', 'INFO', (string) config('app.timezone'));
    }

    /**
     * @param  array<int, array{area: string, check: string, status: string, detail: string}>  $results
     */
    private function render(array $results): void
    {
        $this->table(
            ['Area', 'Check', 'Status', 'Detail'],
            array_map(fn (array $row): array => [
                $row['area'], $row['check'], $row['status'], $row['detail'],
            ], $results),
        );

        $failures = collect($results)->where('status', 'FAIL')->count();
        $warnings = collect($results)->where('status', 'WARN')->count();

        $this->newLine();
        $this->line($failures === 0
            ? "<info>No blocking problems found.</info> {$warnings} warning(s)."
            : "<error>{$failures} blocking problem(s) must be fixed before deployment.</error>");
    }

    /**
     * The level Laravel will actually use: the default channel's own level, or — when that channel
     * is a `stack` — the level of its first member. Reporting an empty string (as reading
     * `logging.channels.stack.level` would) hides a debug level that is really in effect.
     */
    private function resolvedLogLevel(): string
    {
        $channel = (string) config('logging.default', 'stack');
        $level = (string) config("logging.channels.{$channel}.level", '');

        if ($level === '') {
            $members = (array) config("logging.channels.{$channel}.channels", []);

            foreach ($members as $member) {
                $level = (string) config("logging.channels.{$member}.level", '');

                if ($level !== '') {
                    break;
                }
            }
        }

        return $level !== '' ? $level : 'unset (monolog default: debug)';
    }

    private function iniBytes(string $key): int
    {
        return match (true) {
            default => (function () use ($key): int {
                $value = trim((string) ini_get($key));

                if ($value === '' || $value === '-1') {
                    return PHP_INT_MAX;
                }

                $unit = mb_strtolower(mb_substr($value, -1));
                $number = (int) $value;

                return match ($unit) {
                    'g' => $number * 1024 * 1024 * 1024,
                    'm' => $number * 1024 * 1024,
                    'k' => $number * 1024,
                    default => $number,
                };
            })(),
        };
    }

    private function human(int $bytes): string
    {
        return $bytes >= 1024 * 1024 ? round($bytes / 1024 / 1024, 1).'M' : round($bytes / 1024).'K';
    }
}
