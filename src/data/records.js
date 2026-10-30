// Orders and newsletter sign-ups captured by the public site.
// There is no backend, so both lists live in localStorage and the admin panel
// reads the same keys.

import { isRegisteredAccount } from '../account/registration.js';

const ORDERS_KEY = 'atrin-orders-v1';
const SUBSCRIBERS_KEY = 'atrin-newsletter-v1';

const readList = (key) => {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const writeList = (key, list) => {
  try {
    localStorage.setItem(key, JSON.stringify(list));
  } catch {
    /* storage can be unavailable */
  }
  return list;
};

export const ORDER_STATUSES = [
  { id: 'new', label: 'جدید', tone: 'gold' },
  { id: 'preparing', label: 'در حال آماده‌سازی', tone: 'wine' },
  { id: 'sent', label: 'ارسال شده', tone: 'green' },
  { id: 'done', label: 'تحویل شده', tone: 'green' },
  { id: 'cancelled', label: 'لغو شده', tone: 'red' },
];

export const orderStatusLabel = (status) =>
  ORDER_STATUSES.find((item) => item.id === status)?.label || 'جدید';

const createId = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export const listOrders = () =>
  readList(ORDERS_KEY).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const addOrder = (order) => {
  /* Re-check at the write boundary as well: a stale checkout screen is not a session. */
  try {
    const key = localStorage.getItem('naval-account-session-v1');
    const accounts = JSON.parse(localStorage.getItem('naval-accounts-v1') || '{}');
    if (!isRegisteredAccount(key, accounts?.[key])) return null;
  } catch {
    return null;
  }
  const entry = {
    id: createId('ord'),
    status: 'new',
    createdAt: new Date().toISOString(),
    ...order,
  };
  writeList(ORDERS_KEY, [entry, ...readList(ORDERS_KEY)]);
  return entry;
};

export const updateOrderStatus = (id, status) =>
  writeList(
    ORDERS_KEY,
    readList(ORDERS_KEY).map((order) => (order.id === id ? { ...order, status } : order))
  );

export const deleteOrder = (id) =>
  writeList(ORDERS_KEY, readList(ORDERS_KEY).filter((order) => order.id !== id));

export const listSubscribers = () =>
  readList(SUBSCRIBERS_KEY).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

export const addSubscriber = (email) => {
  const value = (email || '').trim().toLowerCase();
  const exists = readList(SUBSCRIBERS_KEY).some((item) => item.email === value);
  if (exists) return { ok: false, duplicate: true };
  writeList(SUBSCRIBERS_KEY, [
    { id: createId('sub'), email: value, createdAt: new Date().toISOString() },
    ...readList(SUBSCRIBERS_KEY),
  ]);
  return { ok: true };
};

export const deleteSubscriber = (id) =>
  writeList(SUBSCRIBERS_KEY, readList(SUBSCRIBERS_KEY).filter((item) => item.id !== id));
