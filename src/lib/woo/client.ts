/**
 * Transport for the storefront's own API layer.
 *
 * Every call goes to `/api/commerce/*` on this origin — the browser never learns the
 * WordPress URL and never holds a WooCommerce credential; the server-side proxy in
 * `server/commerce.mjs` is the only process that does.
 *
 * Three concerns live here and nowhere else:
 *
 *  - **Request de-duplication.** Several sections of one page ask for the same rail; the
 *    second caller joins the request already in flight instead of starting another.
 *  - **A short read cache.** A rail that has just been fetched is reused for `READ_TTL_MS`,
 *    which keeps navigating back to a page from re-downloading the catalog.
 *  - **The cart session.** The Store API identifies a cart with a `Cart-Token` header and
 *    signs mutations with a nonce; both are captured from every response and replayed on
 *    the next request, and survive a reload via `sessionStorage`.
 *
 * Failures surface as `CommerceError`. `unreachable` distinguishes "the store is down or
 * not connected" — the case the UI answers with a retry state — from "this request was
 * refused", which the UI shows as a message.
 */

const BASE = '/api/commerce';
const READ_TTL_MS = 30_000;
const SESSION_KEY = 'styleon.woo.session';

export class CommerceError extends Error {
  readonly status: number;
  readonly code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = 'CommerceError';
    this.status = status;
    this.code = code;
  }

  /** The store could not be reached at all: offline, not configured, or broken. */
  get unreachable(): boolean {
    return this.status === 0 || this.status === 502 || this.status === 503 || this.status === 504;
  }
}

/* --------------------------- cart session --------------------------- */

type CartSession = { token?: string; nonce?: string };

const loadSession = (): CartSession => {
  try {
    return JSON.parse(sessionStorage.getItem(SESSION_KEY) ?? '{}') as CartSession;
  } catch {
    return {};
  }
};

let session: CartSession = loadSession();

const rememberSession = (headers: Headers) => {
  const token = headers.get('cart-token');
  const nonce = headers.get('x-wc-store-api-nonce');
  if (!token && !nonce) return;
  session = { token: token ?? session.token, nonce: nonce ?? session.nonce };
  try {
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // Private mode or a full quota: the cart still works for this page view.
  }
};

/** Forgets the cart identity — used when the store rejects the session we held. */
export const resetCartSession = () => {
  session = {};
  try {
    sessionStorage.removeItem(SESSION_KEY);
  } catch {
    // Nothing to clear.
  }
};

/* ------------------------------ requests ---------------------------- */

export type Query = Record<string, string | number | boolean | undefined>;

const withQuery = (path: string, params?: Query) => {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params ?? {})) {
    if (value === undefined || value === '' || value === false) continue;
    search.set(key, String(value));
  }
  const qs = search.toString();
  return qs ? `${BASE}${path}?${qs}` : `${BASE}${path}`;
};

const requestHeaders = (body: unknown): Record<string, string> => {
  const headers: Record<string, string> = { accept: 'application/json' };
  if (session.token) headers['cart-token'] = session.token;
  if (session.nonce) headers['x-wc-store-api-nonce'] = session.nonce;
  if (body !== undefined) headers['content-type'] = 'application/json';
  return headers;
};

const perform = async (url: string, method: string, body: unknown, signal?: AbortSignal) => {
  let response: Response;
  try {
    response = await fetch(url, {
      method,
      signal,
      headers: requestHeaders(body),
      body: body === undefined ? undefined : JSON.stringify(body),
      credentials: 'same-origin',
    });
  } catch (error) {
    // An aborted request is the caller's own doing; never dress it up as an outage.
    if (error instanceof DOMException && error.name === 'AbortError') throw error;
    throw new CommerceError('ارتباط با فروشگاه برقرار نشد. اتصال خود را بررسی کنید.', 0);
  }

  rememberSession(response.headers);

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const detail = payload as { error?: unknown; code?: unknown } | null;
    throw new CommerceError(
      typeof detail?.error === 'string' ? detail.error : 'درخواست به فروشگاه ناموفق بود.',
      response.status,
      typeof detail?.code === 'string' ? detail.code : undefined,
    );
  }

  return { payload, response };
};

type ReadResult = { payload: unknown; total: number; totalPages: number };

/** url -> cached read, and url -> read already in flight. */
const cache = new Map<string, { expires: number; result: ReadResult }>();
const inflight = new Map<string, Promise<ReadResult>>();

const read = async (path: string, params?: Query, signal?: AbortSignal): Promise<ReadResult> => {
  const url = withQuery(path, params);

  const hit = cache.get(url);
  if (hit && hit.expires > Date.now()) return hit.result;

  const pending = inflight.get(url);
  if (pending) return pending;

  const promise = (async () => {
    const { payload, response } = await perform(url, 'GET', undefined, signal);
    return {
      payload,
      total: Number(response.headers.get('x-wp-total') ?? 0),
      totalPages: Number(response.headers.get('x-wp-totalpages') ?? 0),
    };
  })();

  inflight.set(url, promise);
  try {
    const result = await promise;
    cache.set(url, { expires: Date.now() + READ_TTL_MS, result });
    return result;
  } finally {
    inflight.delete(url);
  }
};

/** One resource. */
export const get = async <T>(path: string, params?: Query, signal?: AbortSignal): Promise<T> =>
  (await read(path, params, signal)).payload as T;

/** A collection, with the store's own pagination headers. */
export const getList = async <T>(
  path: string,
  params?: Query,
  signal?: AbortSignal,
): Promise<{ items: T[]; total: number; totalPages: number }> => {
  const { payload, total, totalPages } = await read(path, params, signal);
  return { items: (payload ?? []) as T[], total, totalPages };
};

/**
 * A write. Mutations never read from cache, and they empty it: the cart a page was showing
 * may no longer be what the store holds.
 */
export const mutate = async <T>(
  path: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> => {
  const { payload } = await perform(withQuery(path), method, body, signal);
  cache.clear();
  return payload as T;
};

/** Drops the read cache without touching the cart session — what a retry button asks for. */
export const invalidate = () => cache.clear();

export type StoreStatus = {
  ok: boolean;
  configured: boolean;
  admin: boolean;
  content: boolean;
};

/** Whether a WooCommerce store is wired up behind this app at all. */
export const storeStatus = async (): Promise<StoreStatus> => {
  const { payload } = await perform(withQuery('/health'), 'GET', undefined);
  return payload as StoreStatus;
};
