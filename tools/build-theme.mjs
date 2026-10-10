/**
 * Package the WordPress theme.
 *
 * 1. Compiles the theme's stylesheet (the same Tailwind tokens the React app uses).
 * 2. Zips wp-theme/medora into wp-theme/dist/medora.zip, the archive WordPress expects when a
 *    theme is uploaded from Appearance → Themes → Add New → Upload Theme.
 *
 * The archive is written by hand with Node's own zlib, so packaging needs no `zip` binary and no
 * extra dependency.
 *
 * Run from the repository root:
 *   npm run theme:build
 */
import { execFileSync } from 'node:child_process';
import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { deflateRawSync } from 'node:zlib';

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, '..');
const themeDir = join(root, 'wp-theme', 'medora');
const distDir = join(root, 'wp-theme', 'dist');
const zipPath = join(distDir, 'medora.zip');

/** Build the source never ships with the theme. */
const EXCLUDED = [join('assets', 'src')];

/* ------------------------------------------------------------------ *
 * A minimal ZIP writer (deflate, no dependencies)
 * ------------------------------------------------------------------ */

const CRC_TABLE = (() => {
  const table = new Int32Array(256);

  for (let n = 0; n < 256; n += 1) {
    let c = n;
    for (let k = 0; k < 8; k += 1) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c;
  }

  return table;
})();

const crc32 = (buffer) => {
  let crc = -1;
  for (let i = 0; i < buffer.length; i += 1) crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ buffer[i]) & 0xff];
  return (crc ^ -1) >>> 0;
};

const dosDateTime = (date) => {
  const time = (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2);
  const stamp = ((date.getFullYear() - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate();
  return { time, date: stamp };
};

const buildZip = (entries) => {
  const chunks = [];
  const central = [];
  let offset = 0;

  entries.forEach((entry) => {
    const name = Buffer.from(entry.name, 'utf8');
    const raw = entry.data;
    const compressed = deflateRawSync(raw);
    const { time, date } = dosDateTime(entry.date);
    const crc = crc32(raw);

    const local = Buffer.alloc(30);
    local.writeUInt32LE(0x04034b50, 0);
    local.writeUInt16LE(20, 4);
    local.writeUInt16LE(0x0800, 6); // UTF-8 file names
    local.writeUInt16LE(8, 8); // deflate
    local.writeUInt16LE(time, 10);
    local.writeUInt16LE(date, 12);
    local.writeUInt32LE(crc, 14);
    local.writeUInt32LE(compressed.length, 18);
    local.writeUInt32LE(raw.length, 22);
    local.writeUInt16LE(name.length, 26);
    local.writeUInt16LE(0, 28);

    chunks.push(local, name, compressed);

    const header = Buffer.alloc(46);
    header.writeUInt32LE(0x02014b50, 0);
    header.writeUInt16LE(20, 4);
    header.writeUInt16LE(20, 6);
    header.writeUInt16LE(0x0800, 8);
    header.writeUInt16LE(8, 10);
    header.writeUInt16LE(time, 12);
    header.writeUInt16LE(date, 14);
    header.writeUInt32LE(crc, 16);
    header.writeUInt32LE(compressed.length, 20);
    header.writeUInt32LE(raw.length, 24);
    header.writeUInt16LE(name.length, 28);
    header.writeUInt16LE(0, 30);
    header.writeUInt16LE(0, 32);
    header.writeUInt16LE(0, 34);
    header.writeUInt16LE(0, 36);
    header.writeUInt32LE((0o100644 << 16) >>> 0, 38);
    header.writeUInt32LE(offset, 42);

    central.push(header, name);
    offset += local.length + name.length + compressed.length;
  });

  const centralBuffer = Buffer.concat(central);
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralBuffer.length, 12);
  end.writeUInt32LE(offset, 16);
  end.writeUInt16LE(0, 20);

  return Buffer.concat([...chunks, centralBuffer, end]);
};

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

mkdirSync(distDir, { recursive: true });
rmSync(zipPath, { force: true });
writeFileSync(zipPath, buildZip(files));

console.log(`✔ ${zipPath} (${Math.round(statSync(zipPath).size / 1024)} KB, ${files.length} files)`);
console.log('  Upload it at Appearance → Themes → Add New → Upload Theme.');
