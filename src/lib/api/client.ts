/**
 * The storefront's transport to the Laravel API (`/api/v1`).
 *
 * Everything the shop reads or writes goes through here, so no component ever builds a URL,
 * calls `fetch` or knows a Laravel resource shape. Three things live in this file and nowhere
 * else:
 *
 *  - the base URL — `/api/v1` behind the dev server's proxy, or `VITE_API_BASE_URL` on a host,
 *  - the two identities the API hands out: the Sanctum bearer token of a signed-in account and
 *    the `X-Cart-Token` of a guest's basket, both kept in `localStorage`,
 *  - the two ways a call can fail: the store answered and refused (`ApiError` with a status), or
 *    the store could not be reached at all (`unreachable`).
 *
 * Money is never touched here: the API already answers in Toman integers.
 */

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api/v1';

const AUTH_TOKEN_KEY = 'styleon.api.token';
const CART_TOKEN_KEY = 'styleon.api.cart';

/** Reads are held briefly so one page load does not ask the same question three times. */
const CACHE_TTL_MS = 30_000;

const readToken = (key: string): string | null => {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
};

const writeToken = (key: string, value: string | null) => {
  try {
    if (value) window.localStorage.setItem(key, value);
    else window.localStorage.removeItem(key);
  } catch {
    /* storage unavailable — the identity simply does not survive this page */
  }
};

/** The bearer token of the signed-in account, or null for a guest. */
export const authToken = () => readToken(AUTH_TOKEN_KEY);
export const setAuthToken = (token: string | null) => writeToken(AUTH_TOKEN_KEY, token);

/** The basket identity a guest got from the first cart call. */
export const cartToken = () => readToken(CART_TOKEN_KEY);
export const setCartToken = (token: string | null) => writeToken(CART_TOKEN_KEY, token);

/**
 * A refused request, or a store that answered nothing at all.
 *
 * `unreachable` separates "the API is down" from "the API said no", because the two need
 * different words on screen. `errors` carries a 422's field errors verbatim, so a form can show
 * the server's own Persian message instead of inventing one.
 */
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly options: {
      errors?: Record<string, string[]>;
      unreachable?: boolean;
      retryAfter?: number;
    } = {},
  ) {
    super(message);
    this.name = 'ApiError';
  }

  get unreachable(): boolean {
    return this.options.unreachable === true;
  }

  get errors(): Record<string, string[]> {
    return this.options.errors ?? {};
  }

  /** The first message for one field, for a form that shows a line per input. */
  fieldError(field: string): string | undefined {
    return this.errors[field]?.[0];
  }
}

const FALLBACK_MESSAGE: Record<number, string> = {
  0: 'ارتباط با فروشگاه برقرار نشد.',
  401: 'برای این کار باید وارد حساب کاربری شوید.',
  403: 'دسترسی به این بخش برای شما مجاز نیست.',
  404: 'موردی که خواستید پیدا نشد.',
  405: 'این درخواست پذیرفته نمی‌شود.',
  422: 'اطلاعات ارسالی درست نیست.',
  429: 'درخواست‌های شما زیاد شده است؛ کمی بعد دوباره تلاش کنید.',
  500: 'خطایی در سرور فروشگاه رخ داد.',
  502: 'سرور فروشگاه پاسخ نداد.',
  503: 'فروشگاه موقتاً در دسترس نیست.',
  504: 'پاسخ فروشگاه بیش از حد طول کشید.',
};

export type Query = Record<string, string | number | boolean | undefined | null>;

const buildUrl = (path: string, query?: Query): string => {
  const url = `${BASE_URL}${path}`;
  if (!query) return url;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === '') continue;
    params.set(key, String(value));
  }
  const qs = params.toString();
  return qs ? `${url}?${qs}` : url;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  query?: Query;
  body?: unknown;
  signal?: AbortSignal;
};

/**
 * Only a completed read is cached — never a request still in flight.
 *
 * Sharing an unresolved request between callers looked like a saving, but a caller that unmounts
 * aborts the shared fetch, and every other caller waiting on the same promise is aborted with it:
 * the screen then stays on its loading state forever. A short-lived cache of the answers is the
 * saving that costs nothing, and two identical requests at once are cheap enough to allow.
 */
const cache = new Map<string, { at: number; value: unknown }>();

/** Drops every cached read. Every write calls it, so a change is visible on the next read. */
export const clearCache = () => cache.clear();

/**
 * One request, resolved with the response body exactly as the API sent it — the caller decides
 * whether it wants `data`, the paginator's `meta` or both.
 */
export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const url = buildUrl(path, options.query);
  // A session-bound read (the basket) must never be served from a shared cache.
  const cacheable = method === 'GET' && !path.startsWith('/cart') && authToken() === null;

  if (cacheable) {
    const hit = cache.get(url);
    if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.value as T;
  }

  const send = async (): Promise<T> => {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (options.body !== undefined) headers['Content-Type'] = 'application/json';

    const token = authToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const cart = cartToken();
    if (cart) headers['X-Cart-Token'] = cart;

    let response: Response;
    try {
      response = await fetch(url, {
        method,
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: options.signal,
        credentials: 'same-origin',
      });
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error;
      throw new ApiError(FALLBACK_MESSAGE[0], 0, { unreachable: true });
    }

    // A guest's basket identity arrives on every cart response and is the only way to find that
    // basket again, so it is kept before the body is even parsed.
    const issuedCartToken = response.headers.get('X-Cart-Token');
    if (issuedCartToken) setCartToken(issuedCartToken);

    const text = await response.text();
    let payload: unknown;
    if (text) {
      try {
        payload = JSON.parse(text);
      } catch {
        payload = undefined;
      }
    }

    if (!response.ok) {
      const body = (payload ?? {}) as { message?: string; errors?: Record<string, string[]> };
      const retryAfter = Number(response.headers.get('Retry-After') ?? 0);
      throw new ApiError(
        body.message || FALLBACK_MESSAGE[response.status] || `خطای ${response.status}`,
        response.status,
        { errors: body.errors, retryAfter: retryAfter || undefined },
      );
    }

    if (cacheable) cache.set(url, { at: Date.now(), value: payload });
    return payload as T;
  };

  return send();
}

/** A read whose body is `{ "data": … }`. */
export const get = async <T>(path: string, query?: Query, signal?: AbortSignal): Promise<T> => {
  const body = await request<{ data?: T }>(path, { query, signal });
  if (!body || typeof body !== 'object' || body.data === undefined) {
    throw new ApiError(`پاسخ نامعتبر از سرور فروشگاه (${path}).`, 0);
  }
  return body.data;
};

export type Page<T> = {
  items: T[];
  page: number;
  total: number;
  totalPages: number;
};

/**
 * A paginated read — the same `{ "data": … }` body plus the paginator's `meta`, reduced to the
 * four numbers a list surface pages with. `content/faqs` is the one list that is not paginated
 * (it carries `meta.total` only), which is why every field falls back.
 */
export const getPage = async <T>(
  path: string,
  query?: Query,
  signal?: AbortSignal,
): Promise<Page<T>> => {
  const body = await request<{ data?: T[]; meta?: Record<string, number> }>(path, {
    query,
    signal,
  });
  const items = body?.data ?? [];
  return {
    items,
    page: body?.meta?.current_page ?? 1,
    total: body?.meta?.total ?? items.length,
    totalPages: body?.meta?.last_page ?? 1,
  };
};

export type Mutation = 'POST' | 'PATCH' | 'PUT' | 'DELETE';

/**
 * A write. Laravel answers with the resource it changed, wrapped the same way a read is, so the
 * caller gets the new state back and never has to guess what the server did.
 */
export const mutate = async <T>(
  path: string,
  method: Mutation,
  body?: unknown,
  signal?: AbortSignal,
): Promise<T> => {
  const payload = await request<{ data?: T }>(path, { method, body, signal });
  clearCache();
  return (payload && typeof payload === 'object' && 'data' in payload
    ? payload.data
    : (payload as unknown)) as T;
};

/** A write that answers with a message and no resource of its own. */
export const mutateVoid = async (
  path: string,
  method: Mutation,
  body?: unknown,
  signal?: AbortSignal,
): Promise<void> => {
  await request(path, { method, body, signal });
  clearCache();
};
