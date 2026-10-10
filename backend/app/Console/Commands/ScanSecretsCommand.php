<?php

namespace App\Console\Commands;

use App\Support\SecretScanner;
use Illuminate\Console\Command;
use Symfony\Component\Finder\Finder;
use Symfony\Component\Process\Process;
use Throwable;

/**
 * "Is a credential committed to this repository?"
 *
 * Run before every deployment:
 *
 *     php artisan security:scan-secrets
 *
 * Exit code 0 = clean, 1 = at least one finding. The scan covers the *tracked* files: an untracked
 * `.env` full of secrets is exactly where secrets are supposed to live, and reporting it would
 * train everyone to ignore this command. It also reports the two structural checks that matter as
 * much as a pattern match — that `.env` is ignored, and that no `.env` file is tracked.
 *
 * Nothing here prints a secret: App\Support\SecretScanner returns a masked preview only.
 */
class ScanSecretsCommand extends Command
{
    protected $signature = 'security:scan-secrets
        {--path= : Scan a directory instead of the tracked files}
        {--json : Machine-readable output}';

    protected $description = 'Scan the repository for committed credentials and unsafe files';

    /** Directories that never belong to the application's own source. */
    private const EXCLUDED_DIRECTORIES = [
        'vendor', 'node_modules', '.git', 'storage', 'public/build', 'dist', '.phpunit.cache',
    ];

    public function __construct(private readonly SecretScanner $scanner)
    {
        parent::__construct();
    }

    public function handle(): int
    {
        $root = base_path();

        $structural = $this->structuralChecks($root);
        $findings = [];

        foreach ($this->filesToScan($root) as $file) {
            $contents = @file_get_contents($file);

            if ($contents === false) {
                continue;
            }

            foreach ($this->scanner->findings($contents) as $finding) {
                $findings[] = [
                    'file' => $this->relative($root, $file),
                    'line' => $finding['line'],
                    'kind' => $finding['kind'],
                    'preview' => $finding['preview'],
                ];
            }
        }

        if ((bool) $this->option('json')) {
            $this->line(json_encode([
                'findings' => $findings,
                'structural' => $structural,
            ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            return $this->exitCode($findings, $structural);
        }

        foreach ($structural as $check) {
            $this->line(($check['ok'] ? '<fg=green>OK</>' : '<fg=red>FAIL</>').' '.$check['check']);
        }

        if ($findings === []) {
            $this->info('No credential pattern found in the scanned files.');
        } else {
            $this->newLine();
            $this->error(count($findings).' possible credential(s) found:');

            foreach ($findings as $finding) {
                $this->line(sprintf(
                    '  %s:%d  %s  %s',
                    $finding['file'],
                    $finding['line'],
                    $finding['kind'],
                    $finding['preview'],
                ));
            }

            $this->newLine();
            $this->line('Move each value into the environment, rotate it at the provider, and remove it from history.');
        }

        return $this->exitCode($findings, $structural);
    }

    /**
     * @param  array<int, array{file: string, line: int, kind: string, preview: string}>  $findings
     * @param  array<int, array{check: string, ok: bool}>  $structural
     */
    private function exitCode(array $findings, array $structural): int
    {
        foreach ($structural as $check) {
            if (! $check['ok']) {
                return self::FAILURE;
            }
        }

        return $findings === [] ? self::SUCCESS : self::FAILURE;
    }

    /**
     * @return array<int, array{check: string, ok: bool}>
     */
    private function structuralChecks(string $root): array
    {
        $ignored = $this->git($root, ['check-ignore', '.env']);
        $trackedEnv = $this->git($root, ['ls-files', '.env', '.env.backup', '.env.production', '.env.local']);

        return [
            [
                'check' => '.env is ignored by git',
                // `git check-ignore` prints the path when it IS ignored.
                'ok' => $ignored === null || trim($ignored) !== '',
            ],
            [
                'check' => 'no .env file is tracked by git',
                'ok' => $trackedEnv === null || trim($trackedEnv) === '',
            ],
        ];
    }

    /**
     * @return array<int, string>
     */
    private function filesToScan(string $root): array
    {
        $path = $this->option('path');

        if (is_string($path) && $path !== '') {
            return $this->walk(is_dir($path) ? $path : $root.'/'.$path);
        }

        $listed = $this->git($root, ['ls-files']);

        if ($listed !== null && trim($listed) !== '') {
            $files = [];

            foreach (preg_split('/\R/', trim($listed)) ?: [] as $relative) {
                $file = $root.'/'.trim($relative);

                if ($relative !== '' && is_file($file)) {
                    $files[] = $file;
                }
            }

            return $files;
        }

        return $this->walk($root);
    }

    /**
     * @return array<int, string>
     */
    private function walk(string $root): array
    {
        $finder = Finder::create()->files()->ignoreDotFiles(false)->ignoreVCS(true);

        foreach (self::EXCLUDED_DIRECTORIES as $directory) {
            $finder->notPath($directory);
        }

        $files = [];

        foreach ($finder->in($root) as $file) {
            $files[] = $file->getPathname();
        }

        return $files;
    }

    /**
     * A read-only git call. Symfony's Process is used rather than exec()/shell_exec(): the command
     * and its arguments are passed as a list, so no part of this can reach a shell.
     *
     * @param  array<int, string>  $arguments
     */
    private function git(string $root, array $arguments): ?string
    {
        try {
            $process = new Process(['git', ...$arguments], $root);
            $process->setTimeout(60);
            $process->run();

            if (! $process->isSuccessful()) {
                // `check-ignore` answers 1 when the path is *not* ignored, which is a valid answer.
                return $arguments[0] === 'check-ignore' && $process->getExitCode() === 1
                    ? ''
                    : null;
            }

            return $process->getOutput();
        } catch (Throwable) {
            return null;
        }
    }

    private function relative(string $root, string $file): string
    {
        return str_starts_with($file, $root.'/') ? mb_substr($file, mb_strlen($root) + 1) : $file;
    }
}
