// RFC 6238 TOTP (Google Authenticator compatible) using the browser Web Crypto API.
// Nothing leaves the browser: the secret lives next to the hashed admin password.

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
const PERIOD = 30;
const DIGITS = 6;

const base32Encode = (bytes) => {
  let bits = 0;
  let value = 0;
  let output = '';
  bytes.forEach((byte) => {
    value = (value << 8) | byte;
    bits += 8;
    while (bits >= 5) {
      output += ALPHABET[(value >>> (bits - 5)) & 31];
      bits -= 5;
    }
  });
  if (bits > 0) output += ALPHABET[(value << (5 - bits)) & 31];
  return output;
};

const base32Decode = (input) => {
  const clean = (input || '').toUpperCase().replace(/[^A-Z2-7]/g, '');
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
  return new Uint8Array(bytes);
};

const counterBytes = (step) => {
  const buffer = new ArrayBuffer(8);
  const view = new DataView(buffer);
  view.setUint32(0, Math.floor(step / 0x100000000));
  view.setUint32(4, step >>> 0);
  return new Uint8Array(buffer);
};

export const generateSecret = (length = 20) => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return base32Encode(bytes);
};

export const formatSecret = (secret) => (secret.match(/.{1,4}/g) || []).join(' ');

export const otpauthUrl = (issuer, account, secret) =>
  `otpauth://totp/${encodeURIComponent(issuer)}:${encodeURIComponent(
    account
  )}?secret=${secret}&issuer=${encodeURIComponent(issuer)}&algorithm=SHA1&digits=${DIGITS}&period=${PERIOD}`;

const codeForStep = async (secret, step) => {
  const key = await crypto.subtle.importKey(
    'raw',
    base32Decode(secret),
    { name: 'HMAC', hash: 'SHA-1' },
    false,
    ['sign']
  );
  const signature = new Uint8Array(await crypto.subtle.sign('HMAC', key, counterBytes(step)));
  const offset = signature[signature.length - 1] & 0x0f;
  const binary =
    ((signature[offset] & 0x7f) << 24) |
    ((signature[offset + 1] & 0xff) << 16) |
    ((signature[offset + 2] & 0xff) << 8) |
    (signature[offset + 3] & 0xff);
  return String(binary % 10 ** DIGITS).padStart(DIGITS, '0');
};

export const normalizeCode = (value) =>
  String(value || '')
    .replace(/[۰-۹]/g, (digit) => String('۰۱۲۳۴۵۶۷۸۹'.indexOf(digit)))
    .replace(/[٠-٩]/g, (digit) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(digit)))
    .replace(/[\s-]/g, '');

// Returns the matched time step so the caller can refuse a replayed code.
export const matchTotpStep = async (secret, code) => {
  const normalized = normalizeCode(code);
  if (!/^\d{6}$/.test(normalized)) return null;
  const now = Math.floor(Date.now() / 1000 / PERIOD);
  for (const delta of [-1, 0, 1]) {
    const step = now + delta;
    if ((await codeForStep(secret, step)) === normalized) return step;
  }
  return null;
};
