/**
 * Package the COMPLETE project for self-hosting.
 *
 * 1. Builds the storefront (`npm run build`), so the archive never carries a stale bundle.
 * 2. Writes public/styleon-project.zip: the whole project — frontend source, the built site
 *    (`dist/`), the payment/commerce service (`server/`), the Laravel API (`backend/`, with
 *    `vendor/` and its migrations), both environment templates and `DEPLOYMENT.md` — under a
 *    single top-level `styleon/` folder.
 *
 *    The archive is the project as it runs here, minus what only the development environment
 *    needs. What deliberately does not travel:
 *
 *      - `node_modules/` — `npm ci` reinstalls it from the lockfile, which does travel.
 *      - any `.env` — the host writes its own, from the two `.env.example` templates.
 *      - runtime logs and caches (Laravel's `storage/logs`, `storage/framework`,
 *        `bootstrap/cache`): only the directories themselves are carried, as empty entries,
 *        because Laravel refuses to boot without them.
 *      - the Base44 development environment (`docker-compose.base44.yml`, `.base44/`,
 *        `AGENTS.md`) — it names the sandbox's own hosts and platform-managed env file.
 *      - the optional WordPress theme (`wp-theme/`, `tools/build-theme.mjs`, the `theme:*`
 *        scripts and the theme archives): it mirrors this design but is not part of the site,
 *        and the site is not WordPress. `package.json` is rewritten accordingly.
 *
 * The archive is written by hand with Node's own zlib (see tools/zip.mjs), so packaging needs no
 * `zip` binary and no extra dependency.
 *
 * Run from the repository root:
 *   npm run pack:project
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildZip } from './zip.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const publicZipPath = join(root, 'public', 'styleon-project.zip');

/** Everything in the archive sits under this folder, so extracting never scatters files. */
const EXPORT_ROOT = 'styleon';

/**
 * The archive itself: `public/` is copied into `dist/` by the build, so a second run would find
 * the previous archive inside the new one.
 */
const ARCHIVE_NAME = 'styleon-project.zip';
/** The optional WordPress theme, and the archives it produced. */
const THEME_FILES = new Set(['medora-theme.zip', 'build-theme.mjs']);
const THEME_SCRIPTS = ['theme:css', 'theme:build'];

const SKIP_DIRS = new Set([
  'node_modules',
  '.git',
  '.vite',
  'dist-ssr',
  '__pycache__',
  '.phpunit.cache',
  '.base44',
  'wp-theme',
]);
const SKIP_NAMES = new Set(['.DS_Store', '.phpunit.result.cache', 'docker-compose.base44.yml', 'AGENTS.md']);
const SKIP_SUFFIXES = ['.tsbuildinfo', '.sqlite', '.log'];
/** Inside backend/: the directories Laravel rebuilds. Only their `.gitignore` is carried. */
const REBUILT = ['storage/logs', 'storage/framework', 'bootstrap/cache'];

/** An `.env` of any kind stays behind — the host writes its own. */
const isSecret = (name) => name === '.env' || (name.startsWith('.env.') && name !== '.env.example');

const isSkipped = (rel, name, isDirectory) => {
  if (SKIP_DIRS.has(name) || SKIP_NAMES.has(name) || THEME_FILES.has(name)) return true;
  if (SKIP_SUFFIXES.some((suffix) => name.endsWith(suffix))) return true;
  if (isSecret(name)) return true;
  // The rebuilt directories themselves are carried — only their contents are dropped.
  if (isDirectory) return false;

  const rebuilt = REBUILT.some((dir) => rel === dir || rel.startsWith(dir + '/'));
  return rebuilt && name !== '.gitignore';
};

/** The theme tooling is not part of the export, so its scripts leave the manifest with it. */
const packageJsonForExport = (text) => {
  const pkg = JSON.parse(text);
  THEME_SCRIPTS.forEach((name) => delete pkg.scripts[name]);
  return `${JSON.stringify(pkg, null, 2)}\n`;
};

const collect = (directory, base) => {
  const files = [];

  readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const full = join(directory, entry.name);
    const rel = relative(base, full).split('\\').join('/');

    // `backend/public/storage` is a symlink to `storage/app/public`; the host recreates it with
    // `php artisan storage:link`, and reading it here would walk outside the tree.
    if (entry.isSymbolicLink()) return;
    if (entry.name === ARCHIVE_NAME) return;
    if (isSkipped(rel, entry.name, entry.isDirectory())) return;

    if (entry.isDirectory()) {
      const children = collect(full, base);

      // A directory whose every file was skipped — Laravel's `storage/framework/*`, `storage/logs`
      // and `bootstrap/cache` — must still exist on the host, so it is carried as its own entry.
      if (children.length === 0) {
        files.push({ name: `${EXPORT_ROOT}/${rel}/`, data: Buffer.alloc(0), date: statSync(full).mtime });
      } else {
        files.push(...children);
      }
    } else {
      const data =
        rel === 'package.json'
          ? Buffer.from(packageJsonForExport(readFileSync(full, 'utf8')), 'utf8')
          : readFileSync(full);

      files.push({ name: `${EXPORT_ROOT}/${rel}`, data, date: statSync(full).mtime });
    }
  });

  return files;
};

if (!existsSync(join(root, 'src')) || !existsSync(join(root, 'backend'))) {
  console.error('Run `npm run pack:project` from the repository root.');
  process.exit(1);
}

console.log('▸ Building the storefront…');
execFileSync('npm', ['run', 'build'], { stdio: 'inherit', cwd: root });

const files = collect(root, root);

const required = [
  'styleon/index.html',
  'styleon/dist/index.html',
  'styleon/dist/.htaccess',
  'styleon/package-lock.json',
  'styleon/.env.example',
  'styleon/DEPLOYMENT.md',
  'styleon/server/index.mjs',
  'styleon/backend/artisan',
  'styleon/backend/.env.example',
  'styleon/backend/vendor/autoload.php',
  'styleon/backend/docs/DEPLOYMENT-DIRECTADMIN.md',
];
const names = new Set(files.map((file) => file.name));
const missing = required.filter((name) => !names.has(name));

if (missing.length > 0) {
  console.error(`The export is incomplete, missing: ${missing.join(', ')}`);
  process.exit(1);
}

const archive = buildZip(files);

rmSync(publicZipPath, { force: true });
writeFileSync(publicZipPath, archive);

const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;
console.log(`✔ ${publicZipPath} (${mb(archive.length)}, ${files.length} files)`);
console.log('  Download it from the preview at /styleon-project.zip');
console.log('  Deployment guide inside the archive: styleon/DEPLOYMENT.md');
