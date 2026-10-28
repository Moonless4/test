// Password hashing for the admin credential record. The password only ever
// exists in memory (from the environment or a login request); what is written
// to disk is a salted scrypt hash — a memory-hard KDF from Node's own crypto,
// so the API still needs no dependency and no native build.
import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCallback);

// N=2^15, r=8, p=1 is a common interactive-login work factor (~50-100ms on the
// small compose container). The parameters travel with the hash, so a future
// increase does not invalidate the stored record.
const PARAMS = { algorithm: 'scrypt', N: 32768, r: 8, p: 1, keylen: 64 };
const MAX_MEM = 128 * 1024 * 1024;

export async function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  const derived = await scrypt(String(password), salt, PARAMS.keylen, {
    N: PARAMS.N,
    r: PARAMS.r,
    p: PARAMS.p,
    maxmem: MAX_MEM,
  });
  return {
    ...PARAMS,
    salt,
    hash: derived.toString('hex'),
    updatedAt: new Date().toISOString(),
  };
}

export async function verifyPassword(password, record) {
  if (!record || !record.salt || !record.hash) return false;
  const keylen = Number(record.keylen) || PARAMS.keylen;
  const derived = await scrypt(String(password ?? ''), record.salt, keylen, {
    N: Number(record.N) || PARAMS.N,
    r: Number(record.r) || PARAMS.r,
    p: Number(record.p) || PARAMS.p,
    maxmem: MAX_MEM,
  });
  const stored = Buffer.from(record.hash, 'hex');
  return stored.length === derived.length && timingSafeEqual(stored, derived);
}
