/**
 * Package the STOREFRONT ONLY — the frontend the owner builds and deploys themselves.
 *
 * Writes public/styleon-frontend.zip with the site under a single top-level `styleon-frontend/`
 * folder: the app source, `public/` (hero art, catalogue packshots, fonts, logos), the built
 * `dist/` and the configuration the build reads (`package.json` + lockfile, Vite, TypeScript,
 * PostCSS, Tailwind). `server/` travels too: the payment and commerce routes the storefront calls
 * at `/api/*` are served by it, so the shop cannot take an order without it.
 *
 * Everything belonging to another application stays out:
 *
 *   - `backend/` — the Laravel API. It is a separate deployment, not part of the storefront.
 *   - the WordPress theme, the packaging scripts and the sandbox notes (`wp-theme/`, `tools/`,
 *     `AGENTS.md`, `docker-compose.base44.yml`, `.base44/`).
 *   - `node_modules/` (the lockfile travels), every `.env`, any other `.zip` already in `public/`,
 *     and build caches.
 *
 * Run from the repository root:
 *   npm run pack:frontend
 */
import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildZip } from './zip.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const archivePath = join(root, 'public', 'styleon-frontend.zip');

/** Everything in the archive sits under this folder, so extracting never scatters files. */
const EXPORT_ROOT = 'styleon-frontend';
const ARCHIVE_NAME = 'styleon-frontend.zip';

/** Top-level entries that belong to the backend, to tooling, or to this sandbox only. */
const SKIP_TOP = new Set([
  'backend',
  'wp-theme',
  'tools',
  'node_modules',
  '.git',
  '.base44',
  'dist-ssr',
]);
const SKIP_NAMES = new Set([
  '.DS_Store',
  'AGENTS.md',
  'DEPLOYMENT.md',
  'docker-compose.base44.yml',
  'base',
]);
const SKIP_SUFFIXES = ['.tsbuildinfo', '.sqlite', '.log', '.zip'];

const isSecret = (name) => name === '.env' || (name.startsWith('.env.') && name !== '.env.example');

const collect = (directory, base, top) => {
  const files = [];

  readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const full = join(directory, entry.name);
    const rel = relative(base, full).split('\\').join('/');

    if (entry.isSymbolicLink()) return;
    if (entry.name === ARCHIVE_NAME) return;
    if (top && SKIP_TOP.has(entry.name)) return;
    if (SKIP_NAMES.has(entry.name) || isSecret(entry.name)) return;
    if (SKIP_SUFFIXES.some((suffix) => entry.name.endsWith(suffix))) return;

    if (entry.isDirectory()) files.push(...collect(full, base, false));
    else files.push({ name: `${EXPORT_ROOT}/${rel}`, data: readFileSync(full), date: statSync(full).mtime });
  });

  return files;
};

if (!existsSync(join(root, 'src')) || !existsSync(join(root, 'dist'))) {
  console.error('Build the storefront first: `npm run build`, then `npm run pack:frontend`.');
  process.exit(1);
}

const files = collect(root, root, true);

const required = [
  'styleon-frontend/index.html',
  'styleon-frontend/package-lock.json',
  'styleon-frontend/vite.config.ts',
  'styleon-frontend/dist/index.html',
  'styleon-frontend/dist/.htaccess',
  'styleon-frontend/dist/hero/hoodie-wide.webp',
  'styleon-frontend/dist/hero/hoodie-wide.avif',
  'styleon-frontend/dist/hero/turkish-wide.webp',
  'styleon-frontend/dist/hero/turkish-wide.avif',
  'styleon-frontend/dist/hero/bornos-wide.webp',
  'styleon-frontend/dist/hero/bornos-wide.avif',
  'styleon-frontend/dist/hero/hoodie-phone.webp',
  'styleon-frontend/dist/hero/turkish-phone.webp',
  'styleon-frontend/dist/hero/bornos-phone.webp',
];
const names = new Set(files.map((file) => file.name));
const missing = required.filter((name) => !names.has(name));

if (missing.length > 0) {
  console.error(`The export is incomplete, missing: ${missing.join(', ')}`);
  process.exit(1);
}

const archive = buildZip(files);
rmSync(archivePath, { force: true });
writeFileSync(archivePath, archive);

console.log(`✔ ${archivePath} (${(archive.length / 1048576).toFixed(1)} MB, ${files.length} files)`);
console.log('  Download it from the preview at /styleon-frontend.zip');
console.log('  Build on the host: npm ci && npm run build');
