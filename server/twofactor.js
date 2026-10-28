// Google Authenticator compatible TOTP (RFC 6238) on Node's built-in crypto —
// no dependencies, so the `node:22` image runs it as-is. Only the state
// machine lives in `server/index.js`; this module is pure crypto + helpers.
import { createHmac, randomBytes, timingSafeEqual } from 'node:crypto';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const BACKUP_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const PERIOD = 30;

export function base32Encode(buffer) {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of buffer) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
  return output;
}

export function base32Decode(text) {
  const clean = String(text || '')
    .toUpperCase()
    .replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    const index = ALPHABET.indexOf(char);
    if (index < 0) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 255);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
}

export const generateSecret = () => base32Encode(randomBytes(20));

export const formatSecret = (secret) => (String(secret || '').match(/.{1,4}/g) || []).join(' ');

function totpAt(secret, step) {
  const key = base32Decode(secret);
  if (!key.length) return null;
  const counter = Buffer.alloc(8);
  counter.writeUInt32BE(Math.floor(step / 0x100000000), 0);
  counter.writeUInt32BE(step % 0x100000000, 4);
  const digest = createHmac('sha1', key).update(counter).digest();
  const offset = digest[digest.length - 1] & 0xf;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    (digest[offset + 1] << 16) |
    (digest[offset + 2] << 8) |
    digest[offset + 3];
  return String(binary % 1000000).padStart(6, '0');
}

// One time step of tolerance each way absorbs clock drift between the server
// and the phone without widening the brute-force window much.
export function verifyTotp(secret, code, window = 1) {
  const given = String(code || '').replace(/\s+/g, '');
  if (!/^\d{6}$/.test(given) || !secret) return false;
  const step = Math.floor(Date.now() / 1000 / PERIOD);
  let matched = false;
  for (let drift = -window; drift <= window; drift += 1) {
    const candidate = totpAt(secret, step + drift);
    if (!candidate) continue;
    if (timingSafeEqual(Buffer.from(candidate), Buffer.from(given))) matched = true;
  }
  return matched;
}

export function otpauthUri(secret, account, issuer = 'ARATAN') {
  const label = encodeURIComponent(`${issuer}:${account}`);
  const params = new URLSearchParams({
    secret,
    issuer,
    algorithm: 'SHA1',
    digits: '6',
    period: String(PERIOD),
  });
  return `otpauth://totp/${label}?${params.toString()}`;
}

export function normalizeBackupCode(code) {
  return String(code || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
}

// 10 characters from an alphabet without look-alikes (no 0/O, 1/I), shown as
// XXXXX-XXXXX. Randomness comes from `randomBytes`.
export function createBackupCodes(count = 10) {
  const codes = [];
  for (let index = 0; index < count; index += 1) {
    const bytes = randomBytes(10);
    let code = '';
    for (let i = 0; i < 10; i += 1) code += BACKUP_ALPHABET[bytes[i] % BACKUP_ALPHABET.length];
    codes.push(`${code.slice(0, 5)}-${code.slice(5)}`);
  }
  return codes;
}

export function hashBackupCode(code, key) {
  return createHmac('sha256', key).update(`backup:${normalizeBackupCode(code)}`).digest('hex');
}

export function matchesHash(hash, expected) {
  const left = Buffer.from(String(hash || ''), 'utf8');
  const right = Buffer.from(String(expected || ''), 'utf8');
  return left.length === right.length && left.length > 0 && timingSafeEqual(left, right);
}
