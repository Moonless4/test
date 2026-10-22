/**
 * Package the WordPress theme.
 *
 * 1. Compiles the theme's stylesheet (the same Tailwind tokens the React app uses).
 * 2. Zips wp-theme/medora into wp-theme/dist/medora.zip, the archive WordPress expects when a
 *    theme is uploaded from Appearance → Themes → Add New → Upload Theme.
 * 3. Writes the same archive to public/medora-theme.zip, so the running app can hand it to a
 *    browser at /medora-theme.zip. wp-theme/dist/ is gitignored, public/ is not — the copy in
 *    public/ is what the owner actually downloads.
 *
 * The archive is written by hand with Node's own zlib (see tools/zip.mjs), so packaging needs no
 * `zip` binary and no extra dependency.
 *
 * Run from the repository root:
 *   npm run theme:build
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildZip } from './zip.mjs';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const themeDir = join(root, 'wp-theme', 'medora');
const distDir = join(root, 'wp-theme', 'dist');
const zipPath = join(distDir, 'medora.zip');
const publicZipPath = join(root, 'public', 'medora-theme.zip');

/** Build the source never ships with the theme. */
const EXCLUDED = [join('assets', 'src')];

/* ------------------------------------------------------------------ *
 * Collect the theme
 * ------------------------------------------------------------------ */

const collect = (directory, base = directory) => {
  const files = [];

  readdirSync(directory, { withFileTypes: true }).forEach((entry) => {
    const full = join(directory, entry.name);
    const rel = relative(base, full);

    if (EXCLUDED.some((skip) => rel === skip || rel.startsWith(skip + '/') )) return;
    if (entry.name === '.DS_Store') return;

    if (entry.isDirectory()) {
      files.push(...collect(full, base));
    } else {
      files.push({ name: rel.split('\\').join('/'), data: readFileSync(full), date: statSync(full).mtime });
    }
  });

  return files;
};

if (!existsSync(themeDir)) {
  console.error(`Theme directory not found: ${themeDir}`);
  process.exit(1);
}

console.log('▸ Compiling the theme stylesheet…');
execFileSync(
  'npx',
  ['tailwindcss', '-c', 'wp-theme/medora/tailwind.config.mjs', '-i', 'wp-theme/medora/assets/src/theme.css', '-o', 'wp-theme/medora/assets/css/medora.css', '--minify'],
  { stdio: 'inherit', cwd: root }
);

const files = collect(themeDir);

if (!files.some((file) => file.name === 'style.css')) {
  console.error('style.css is missing — WordPress would reject this archive.');
  process.exit(1);
}

const archive = buildZip(files);

mkdirSync(distDir, { recursive: true });
rmSync(zipPath, { force: true });
writeFileSync(zipPath, archive);

// The copy the running app serves, so the archive can be downloaded from the preview at
// /medora-theme.zip without digging into wp-theme/dist/.
writeFileSync(publicZipPath, archive);

console.log(`✔ ${zipPath} (${Math.round(statSync(zipPath).size / 1024)} KB, ${files.length} files)`);
console.log(`  Download: /medora-theme.zip  →  ${publicZipPath}`);
console.log('  Upload it at Appearance → Themes → Add New → Upload Theme.');
