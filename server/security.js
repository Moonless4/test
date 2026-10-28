// Password hashing, RFC 6238 TOTP and one-time backup codes.
// Runs only on the server; nothing here is importable from the browser bundle.

import crypto from 'node:crypto';

/* ---------------- passwords ---------------- */

const SCRYPT = { N: 16384, r: 8, p: 1 };
const KEY_LENGTH = 64;

export const hashPassword = (password, salt = crypto.randomBytes(16).toString('base64')) => {
  const hash = crypto.scryptSync(String(password), salt, KEY_LENGTH, SCRYPT).toString('base64');
  return { salt, hash };
};

export const verifyPassword = (password, stored) => {
  if (!stored?.salt || !stored?.hash) return false;
  const candidate = crypto.scryptSync(String(password ?? ''), stored.salt, KEY_LENGTH, SCRYPT);
  const expected = Buffer.from(stored.hash, 'base64');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
};

export const passwordProblem = (password) => {
  const value = String(password ?? '');
  if (value.length < 10) return 'رمز عبور باید حداقل ۱۰ کاراکتر باشد.';
  if (!/[a-z]/.test(value) || !/[A-Z]/.test(value)) return 'رمز عبور باید حروف بزرگ و کوچک داشته باشد.';
  if (!/\d/.test(value)) return 'رمز عبور باید حداقل یک رقم داشته باشد.';
  if (!/[^A-Za-z0-9]/.test(value)) return 'رمز عبور باید حداقل یک نماد داشته باشد.';
  return '';
};

/* ---------------- TOTP ---------------- */

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const PERIOD = 30;
const DIGITS = 6;
const WINDOW = 1;

const base32Encode = (bytes) => {
  let bits = 0;
  let value = 0;
  let output = '';
  for (const byte of bytes) {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  }
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
  return output;
};

const base32Decode = (input) => {
  const clean = String(input || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
  let bits = 0;
  let value = 0;
  const bytes = [];
  for (const char of clean) {
    const index = ALPHABET.indexOf(char);
    if (index === -1) continue;
    value = (value << 5) | index;
    bits += 5;
    if (bits >= 8) {
      bytes.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  return Buffer.from(bytes);
};

export const generateTotpSecret = () => base32Encode(crypto.randomBytes(20));

export const formatSecret = (secret) => String(secret).match(/.{1,4}/g)?.join(' ') || '';

export const otpauthUrl = (issuer, account, secret) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(account)}` +
  `?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${PERIOD}`;

const hotp = (secret, counter) => {
  const buffer = Buffer.alloc(8);
  buffer.writeUInt32BE(Math.floor(counter / 2 ** 32), 0);
  buffer.writeUInt32BE(counter >>> 0, 4);
  const digest = crypto.createHmac('sha1', base32Decode(secret)).update(buffer).digest();
  const offset = digest[digest.length - 1] & 0x0f;
  const binary =
    ((digest[offset] & 0x7f) << 24) |
    ((digest[offset + 1] & 0xff) << 16) |
    ((digest[offset + 2] & 0xff) << 8) |
    (digest[offset + 3] & 0xff);
  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
};

export const normalizeTotpCode = (value) =>
  String(value ?? '')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[\s-]/g, '');

// Returns the accepted time step, or null. A step already used (<= lastStep) is refused.
export const verifyTotp = (secret, code, lastStep = 0) => {
  if (!secret) return null;
  const normalized = normalizeTotpCode(code);
  if (!/^\d{6}$/.test(normalized)) return null;
  const current = Math.floor(Date.now() / 1000 / PERIOD);
  for (let delta = WINDOW; delta >= -WINDOW; delta -= 1) {
    const step = current + delta;
    if (hotp(secret, step) !== normalized) continue;
    if (lastStep && step <= lastStep) return null;
    return step;
  }
  return null;
};

/* ---------------- backup codes ---------------- */

const CODE_COUNT = 8;
const CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export const normalizeBackupCode = (value) =>
  String(value ?? '')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

export const hashBackupCode = (code, key) =>
  crypto.createHmac('sha256', key).update(normalizeBackupCode(code)).digest('hex');

export const createBackupCodes = (key) => {
  const codes = [];
  for (let index = 0; index < CODE_COUNT; index += 1) {
    let raw = '';
    while (raw.length < 8) {
      raw += CODE_ALPHABET[crypto.randomInt(CODE_ALPHABET.length)];
    }
    codes.push(`${raw.slice(0, 4)}-${raw.slice(4)}`);
  }
  return {
    // Plaintext exists only in this return value; only hashes are persisted.
    codes,
    entries: codes.map((code) => ({ hash: hashBackupCode(code, key), usedAt: null })),
  };
};

export const randomKey = () => crypto.randomBytes(32).toString('base64');

export const randomToken = () => crypto.randomBytes(32).toString('base64url');
