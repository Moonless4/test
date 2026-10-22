/**
 * Package the deployable site.
 *
 * 1. Builds the storefront (`npm run build`), so the archive never carries a stale bundle.
 * 2. Zips the build plus the Laravel API into public/styleon-site.zip:
 *
 *      frontend/   the contents of dist/ — what goes in the shop domain's document root
 *      backend/    the Laravel application — goes ABOVE the web root, never inside it
 *
 *    plus README-DEPLOY.txt, the two-destination summary the owner reads first.
 *
 * The archive is written by hand with Node's own zlib (see tools/zip.mjs), so packaging needs no
 * `zip` binary and no extra dependency.
 *
 * What deliberately does NOT travel: `.env` (the host creates its own, with its own key), the
 * installed dependencies of the storefront, runtime logs and caches (Laravel rebuilds them — only
 * the `.gitignore` that keeps each of those directories is carried, so the tree survives
 * extraction), and any SQLite file. `backend/vendor/` IS carried: shared hosts often cap the memory
 * Composer needs, so uploading it is the deployment guide's own preference.
 *
 * Run from the repository root:
 *   npm run pack:site
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildZip } from './zip.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const distDir = join(root, 'dist');
const backendDir = join(root, 'backend');
const publicZipPath = join(root, 'public', 'styleon-site.zip');

const SKIP_DIRS = new Set(['node_modules', '.git', '.vite', '__pycache__', '.phpunit.cache', 'wp-theme']);
const SKIP_NAMES = new Set(['.DS_Store', '.phpunit.result.cache']);
const SKIP_SUFFIXES = ['.tsbuildinfo', '.sqlite', '.log'];
/** Inside backend/: the directories Laravel rebuilds. Only their `.gitignore` is carried. */
const REBUILT = ['storage/logs', 'storage/framework', 'bootstrap/cache'];

/** An `.env` of any kind stays behind — the host writes its own. */
const isSecret = (name) => name === '.env' || (name.startsWith('.env.') && name !== '.env.example');

const isSkipped = (rel, name, isDirectory) => {
  if (SKIP_DIRS.has(name) || SKIP_NAMES.has(name)) return true;
  if (SKIP_SUFFIXES.some((suffix) => name.endsWith(suffix))) return true;
  if (isSecret(name)) return true;
  // The rebuilt directories themselves are carried — only their contents are dropped.
  if (isDirectory) return false;

  const rebuilt = REBUILT.some((dir) => rel === dir || rel.startsWith(dir + '/'));
  return rebuilt && name !== '.gitignore';
};

/** The archive itself: `public/` is copied into `dist/` by the build, so a second run would find
 * the previous archive inside the new one. */
const ARCHIVE_NAME = 'styleon-site.zip';

const collect = (directory, base, prefix) => {
  const files = [];

  readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const full = join(directory, entry.name);
    const rel = relative(base, full).split('\\').join('/');

    // `public/storage` is a symlink to `storage/app/public`; the host recreates it with
    // `php artisan storage:link`, and reading it here would walk outside the tree.
    if (entry.isSymbolicLink()) return;
    if (entry.name === ARCHIVE_NAME) return;
    if (isSkipped(rel, entry.name, entry.isDirectory())) return;

    if (entry.isDirectory()) {
      const children = collect(full, base, prefix);

      // A directory whose every file was skipped — Laravel's `storage/framework/*`, `storage/logs`
      // and `bootstrap/cache` — must still exist on the host, so it is carried as its own entry.
      if (children.length === 0) {
        files.push({ name: `${prefix}/${rel}/`, data: Buffer.alloc(0), date: statSync(full).mtime });
      } else {
        files.push(...children);
      }
    } else {
      files.push({ name: `${prefix}/${rel}`, data: readFileSync(full), date: statSync(full).mtime });
    }
  });

  return files;
};

const README = `STYLEON — بستهٔ آپلود روی هاست (DirectAdmin)
=============================================

این زیپ دو بخش دارد:

۱) frontend/
   بیلد تولیدی سایت (خروجی dist/).
   کل «محتویات» این پوشه را در ریشهٔ وب دامنهٔ فروشگاه بریزید (public_html).
   دقت کنید محتویات، نه خودِ پوشهٔ frontend: باید index.html در ریشهٔ public_html باشد.
   فایل .htaccess همراه آن است و مسیردهی SPA و فشرده‌سازی را انجام می‌دهد.

۲) backend/
   اپلیکیشن لاراول (API و پنل مدیریت) همراه با vendor/.
   این پوشه هرگز داخل public_html نرود. آن را بالای ریشهٔ وب بگذارید و
   Document Root دامنهٔ api را روی پوشهٔ public آن تنظیم کنید:
       /home/USER/styleon-api/public

مراحل سمت سرور (بک‌اند):
   cp .env.example .env
   php artisan key:generate
   php artisan migrate --seed
   php artisan admin:create
   php artisan app:preflight

در .env این‌ها را مقدار بدهید:
   APP_URL، APP_KEY، DB_*، PAYMENT_GATEWAY=zarinpal و ZARINPAL_MERCHANT_ID

راهنمای کامل: backend/docs/DEPLOYMENT-DIRECTADMIN.md
ورودی cron:  backend/deploy/cron.example

نکته: فایل .env عمداً در این بسته نیست؛ روی سرور ساخته می‌شود.
`;

if (!existsSync(distDir) || !existsSync(backendDir)) {
  console.error('dist/ or backend/ is missing — run `npm run pack:site` from the repository root.');
  process.exit(1);
}

console.log('▸ Building the storefront…');
execFileSync('npm', ['run', 'build'], { stdio: 'inherit', cwd: root });

const files = [
  ...collect(distDir, distDir, 'frontend'),
  ...collect(backendDir, backendDir, 'backend'),
  { name: 'README-DEPLOY.txt', data: Buffer.from(README, 'utf8'), date: new Date() },
];

if (!files.some((file) => file.name === 'frontend/index.html')) {
  console.error('frontend/index.html is missing — the archive would not be a usable build.');
  process.exit(1);
}

const archive = buildZip(files);

rmSync(publicZipPath, { force: true });
writeFileSync(publicZipPath, archive);

const mb = (bytes) => `${(bytes / 1048576).toFixed(1)} MB`;
const frontendCount = files.filter((file) => file.name.startsWith('frontend/')).length;

console.log(`✔ ${publicZipPath} (${mb(archive.length)}, ${files.length} files)`);
console.log(`  frontend: ${frontendCount} files — extract its contents into the shop's public_html`);
console.log(`  backend:  ${files.length - frontendCount - 1} files — keep it above the web root`);
console.log('  Download it from the preview at /styleon-site.zip');
