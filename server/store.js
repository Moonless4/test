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
const SECURITY_FILE = path.join(DATA_DIR, 'security.json');
const CREDENTIALS_FILE = path.join(DATA_DIR, 'admin-credentials.json');
const MESSAGES_FILE = path.join(DATA_DIR, 'messages.json');
const MEDIA_FILE = path.join(DATA_DIR, 'media.json');
export const MEDIA_DIR = path.join(DATA_DIR, 'media');

const EMPTY_SECURITY = { enabled: false, secret: null, backupCodes: [], pending: null, enabledAt: null };

let cache = null;
let secret = null;
let security = null;
let credentials = null;
let messages = null;
let media = null;

async function ensureDir() {
  await mkdir(DATA_DIR, { recursive: true });
}

async function writeAtomic(file, value) {
  await ensureDir();
  const tmp = `${file}.tmp`;
  await writeFile(tmp, value);
  await rename(tmp, file);
}

// A document saved by an older version lacks the keys added since. Merge it
// over a fresh seed so the panel always opens with complete defaults and every
// saved value still wins. Arrays of objects merge item by item (the header menu
// gained submenus and icons that way); larger arrays are kept as saved.
function mergeDefaults(base, saved) {
  if (Array.isArray(base)) {
    if (!Array.isArray(saved)) return base;
    if (saved.length === base.length && base.every((item) => item && typeof item === 'object' && !Array.isArray(item))) {
      return saved.map((item, index) => mergeDefaults(base[index], item));
    }
    return saved;
  }
  if (base && typeof base === 'object') {
    if (!saved || typeof saved !== 'object') return base;
    const merged = { ...base };
    Object.keys(saved).forEach((key) => {
      merged[key] = key in base ? mergeDefaults(base[key], saved[key]) : saved[key];
    });
    return merged;
  }
  return saved === undefined ? base : saved;
}

export async function readSite() {
  if (cache) return cache;
  let saved = null;
  try {
    saved = JSON.parse(await readFile(SITE_FILE, 'utf8'));
  } catch {
    saved = null;
  }
  cache = saved ? mergeDefaults(buildSeed(), saved) : buildSeed();
  if (!saved) await writeAtomic(SITE_FILE, JSON.stringify(cache, null, 2));
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

// The 2FA state is one JSON document beside the content: the confirmed TOTP
// secret, the hashed backup codes and the pending (not yet confirmed) secret.
// It is never served as a whole — the API only reads the fields it needs.
export async function readSecurity() {
  if (security) return security;
  try {
    security = { ...EMPTY_SECURITY, ...JSON.parse(await readFile(SECURITY_FILE, 'utf8')) };
  } catch {
    security = { ...EMPTY_SECURITY };
  }
  return security;
}

export async function patchSecurity(partial) {
  const current = await readSecurity();
  security = { ...current, ...(partial || {}) };
  await writeAtomic(SECURITY_FILE, JSON.stringify(security, null, 2));
  return security;
}

// The admin credential record holds the username and a salted scrypt hash —
// never the password itself. It is rewritten only when the environment
// credentials change, so the login stays exactly the same.
export async function readCredentials() {
  if (credentials) return credentials;
  try {
    credentials = JSON.parse(await readFile(CREDENTIALS_FILE, 'utf8'));
  } catch {
    credentials = null;
  }
  return credentials;
}

export async function writeCredentials(record) {
  credentials = record;
  await writeAtomic(CREDENTIALS_FILE, JSON.stringify(record, null, 2));
  return credentials;
}

// Contact-form messages, newest first. One small JSON file is enough for a
// studio site and keeps the admin inbox readable outside the app.
export async function readMessages() {
  if (messages) return messages;
  try {
    const parsed = JSON.parse(await readFile(MESSAGES_FILE, 'utf8'));
    messages = Array.isArray(parsed) ? parsed : [];
  } catch {
    messages = [];
  }
  return messages;
}

export async function writeMessages(list) {
  messages = list;
  await writeAtomic(MESSAGES_FILE, JSON.stringify(list, null, 2));
  return messages;
}

// Uploaded media: the bytes live in `/data/media`, this manifest carries the
// human name, dimensions and size the library shows.
export async function readMedia() {
  if (media) return media;
  try {
    const parsed = JSON.parse(await readFile(MEDIA_FILE, 'utf8'));
    media = Array.isArray(parsed) ? parsed : [];
  } catch {
    media = [];
  }
  return media;
}

export async function writeMedia(list) {
  media = list;
  await writeAtomic(MEDIA_FILE, JSON.stringify(list, null, 2));
  return media;
}

export async function ensureMediaDir() {
  await mkdir(MEDIA_DIR, { recursive: true });
  return MEDIA_DIR;
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
