// The site content lives in one JSON document on a mounted volume. A JSON file
// is enough for a single-writer CMS of this size, needs no native build in the
// `node:22` image, and stays readable (and diffable) outside the app.
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { buildSeed } from './seed.js';

const DATA_DIR = process.env.DATA_DIR || '/data';
const SITE_FILE = path.join(DATA_DIR, 'site.json');
const SECRET_FILE = path.join(DATA_DIR, 'session.secret');

let cache = null;
let secret = null;

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function writeAtomic(file, value) {
  await ensureDir();
  const tmp = `${file}.tmp`;
  await writeFile(tmp, value);
  await rename(tmp, file);
}

export async function readSite() {
  if (cache) return cache;
  try {
    cache = JSON.parse(await readFile(SITE_FILE, 'utf8'));
  } catch {
    cache = buildSeed();
    await writeAtomic(SITE_FILE, JSON.stringify(cache, null, 2));
  }
  return cache;
}

export async function patchSite(partial) {
  const current = await readSite();
  const next = { ...current };
  for (const [key, value] of Object.entries(partial || {})) {
    if (value === undefined) continue;
    next[key] = value;
  }
  cache = next;
  await writeAtomic(SITE_FILE, JSON.stringify(next, null, 2));
  return cache;
}

// The cookie signing key is generated once and kept next to the content, so a
// container restart does not sign every admin out.
export async function readSecret() {
  if (secret) return secret;
  try {
    secret = (await readFile(SECRET_FILE, 'utf8')).trim();
  } catch {
    secret = randomBytes(32).toString('hex');
    await writeAtomic(SECRET_FILE, secret);
  }
  return secret;
}
