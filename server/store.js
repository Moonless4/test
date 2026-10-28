// Persistent administrator record + in-memory session, challenge and lockout state.

import fs from 'node:fs';
import path from 'node:path';
import { hashPassword, randomKey } from './security.js';

const DATA_DIR = process.env.ADMIN_DATA_DIR || path.join(process.cwd(), 'data');
const RECORD_FILE = path.join(DATA_DIR, 'admin.json');

const SESSION_IDLE_MS = 30 * 60 * 1000;
const SESSION_MAX_MS = 8 * 60 * 60 * 1000;
const CHALLENGE_TTL_MS = 5 * 60 * 1000;
const REAUTH_TTL_MS = 5 * 60 * 1000;

export const MAX_FAILURES = 3;
export const LOCK_MS = 20 * 60 * 1000;

let cached = null;

const ensureDir = () => {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
};

const readFromDisk = () => {
  try {
    const raw = fs.readFileSync(RECORD_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

export const readAdmin = () => {
  if (cached) return cached;
  cached = readFromDisk();
  return cached;
};

export const writeAdmin = (record) => {
  ensureDir();
  const tmp = `${RECORD_FILE}.${process.pid}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(record, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, RECORD_FILE);
  cached = record;
  return record;
};

/* Provision the single administrator once, from server-side environment values. */
export const provisionAdmin = () => {
  if (readAdmin()) return readAdmin();
  const username = (process.env.ADMIN_USERNAME || '').trim();
  const password = process.env.ADMIN_PASSWORD || '';
  if (!username || !password) return null;

  const record = {
    username,
    password: hashPassword(password),
    totp: { secret: null, lastStep: 0, enrolledAt: null },
    backupCodes: [],
    backupKey: randomKey(),
    failures: 0,
    lockUntil: 0,
    sessionVersion: 1,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  writeAdmin(record);
  console.log('[auth] administrator account provisioned');
  return record;
};

/* ---------------- lockout ---------------- */

// Account-level lock is authoritative (one admin account). Per-IP lock stops
// rotating credentials from another browser; both are 3 attempts / 20 minutes.
const ipFailures = new Map();

export const lockRemaining = (record = readAdmin()) => {
  const now = Date.now();
  const account = Math.max(0, (record?.lockUntil || 0) - now);
  let ip = 0;
  for (const entry of ipFailures.values()) ip = Math.max(ip, entry.lockUntil - now);
  return Math.max(account, ip, 0);
};

export const registerFailure = (ip) => {
  const record = readAdmin();
  if (record) {
    const failures = (record.failures || 0) + 1;
    writeAdmin({
      ...record,
      failures,
      lockUntil: failures >= MAX_FAILURES ? Date.now() + LOCK_MS : record.lockUntil || 0,
      updatedAt: new Date().toISOString(),
    });
  }
  const entry = ipFailures.get(ip) || { failures: 0, lockUntil: 0 };
  const failures = entry.failures + 1;
  ipFailures.set(ip, {
    failures,
    lockUntil: failures >= MAX_FAILURES ? Date.now() + LOCK_MS : entry.lockUntil,
  });
  return lockRemaining();
};

export const clearFailures = () => {
  ipFailures.clear();
  const record = readAdmin();
  if (!record) return;
  if (record.failures || record.lockUntil) {
    writeAdmin({ ...record, failures: 0, lockUntil: 0, updatedAt: new Date().toISOString() });
  }
};

/* ---------------- sessions ---------------- */

const sessions = new Map();
const challenges = new Map();

const prune = () => {
  const now = Date.now();
  for (const [token, session] of sessions) {
    if (now - session.lastSeen > SESSION_IDLE_MS || now - session.createdAt > SESSION_MAX_MS) {
      sessions.delete(token);
    }
  }
  for (const [token, challenge] of challenges) {
    if (now - challenge.createdAt > CHALLENGE_TTL_MS) challenges.delete(token);
  }
};

export const createSession = (version) => {
  prune();
  const token = randomKey();
  sessions.set(token, {
    id: token,
    version,
    createdAt: Date.now(),
    lastSeen: Date.now(),
    reauth: null,
  });
  return token;
};

export const getSession = (token) => {
  prune();
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;
  const record = readAdmin();
  // A password change bumps sessionVersion and invalidates every existing session.
  if (!record || session.version !== record.sessionVersion) {
    sessions.delete(token);
    return null;
  }
  session.lastSeen = Date.now();
  return session;
};

export const destroySession = (token) => {
  if (token) sessions.delete(token);
};

export const destroyAllSessions = () => sessions.clear();

export const grantReauth = (token) => {
  const session = sessions.get(token);
  if (!session) return null;
  const reauthToken = randomKey();
  session.reauth = { id: reauthToken, expiresAt: Date.now() + REAUTH_TTL_MS };
  return { reauthToken, expiresIn: Math.floor(REAUTH_TTL_MS / 1000) };
};

export const consumeReauth = (token, reauthToken) => {
  const session = sessions.get(token);
  const reauth = session?.reauth;
  if (!reauth || !reauthToken) return false;
  if (reauth.id !== reauthToken || reauth.expiresAt < Date.now()) return false;
  session.reauth = null;
  return true;
};

/* ---------------- login challenge ---------------- */

export const createChallenge = (stage, username) => {
  prune();
  const token = randomKey();
  challenges.set(token, { stage, username, createdAt: Date.now() });
  return token;
};

export const getChallenge = (token) => {
  prune();
  if (!token) return null;
  return challenges.get(token) || null;
};

export const updateChallenge = (token, stage) => {
  const challenge = challenges.get(token);
  if (!challenge) return null;
  const next = { ...challenge, stage };
  challenges.set(token, next);
  return next;
};

export const clearChallenge = (token) => {
  if (token) challenges.delete(token);
};

export const backupCodesRemaining = (record = readAdmin()) =>
  (record?.backupCodes || []).filter((entry) => !entry.usedAt).length;
