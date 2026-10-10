/**
 * Where the admin panel is mounted.
 *
 * The panel is part of the storefront's own SPA, so its address has to be known *before* the router
 * renders: `main.tsx` reads it once and every link inside the panel is built from it. That is what
 * lets the shop move the panel to another address from its own settings screen, without a
 * deployment.
 *
 * It is read from its own endpoint (`GET /content/admin-path`) rather than out of the public
 * settings, which is what lets `admin.path` stay an internal setting — the panel's URL is not part
 * of the shop's published configuration.
 *
 * The address is a convenience and never a lock: every admin route is guarded by the API's own
 * `can:admin.access`, and the panel's data is only ever readable with a staff token.
 */
import { get } from '../../lib/api/client';
import type { ApiAdminPath } from '../../lib/api/types';

/**
 * Used before the address has been read, and whenever it is missing or unusable.
 *
 * It must equal the API's own fallback (`Setting::DEFAULT_ADMIN_PATH` and the seeded `admin.path`):
 * if the lookup fails, the panel is drawn at the address the API would have served, so the shop
 * never answers its own panel with a 404. The segment is the brand's, not the word `admin` every
 * scanner tries first — and it stays an address, never a lock.
 */
export const DEFAULT_ADMIN_PATH = 'medora-panel';

/** The setting that carries the address (see `Setting::ADMIN_PATH_KEY`). */
export const ADMIN_PATH_KEY = 'admin.path';

/**
 * How long the address may delay the first render. The storefront must never be held up by its own
 * panel: past this the shop is drawn at the default address and the setting is simply not applied.
 */
const LOOKUP_TIMEOUT_MS = 2000;

let base = DEFAULT_ADMIN_PATH;

/**
 * One URL segment, or the default. A value with a slash, a dot or an uppercase letter is not an
 * address the router can mount, so it is refused rather than half-applied.
 */
export const normalizeAdminPath = (value: unknown): string => {
  const cleaned = String(value ?? '').trim().toLowerCase().replace(/^\/+|\/+$/g, '');

  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(cleaned) ? cleaned : DEFAULT_ADMIN_PATH;
};

/** The configured segment, without slashes. */
export const adminBase = (): string => base;

/** `/orders` → `/<base>/orders`; no argument → the panel's own root. */
export const adminHref = (path = ''): string => {
  const suffix = path.replace(/^\/+/, '');

  return suffix ? `/${base}/${suffix}` : `/${base}`;
};

/** Whether a location belongs to the panel — its root or anything under it. */
export const isAdminPath = (pathname: string): boolean =>
  pathname === `/${base}` || pathname.startsWith(`/${base}/`);

/**
 * Reads the configured address. Called once from `main.tsx`, before the first render: a router that
 * did not yet know the panel's prefix would answer the panel's own URL with the shop's 404.
 */
export const initAdminBase = async (): Promise<void> => {
  try {
    const mounted = await Promise.race([
      get<ApiAdminPath>('/content/admin-path'),
      new Promise<never>((_, reject) => {
        window.setTimeout(() => reject(new Error('timeout')), LOOKUP_TIMEOUT_MS);
      }),
    ]);

    base = normalizeAdminPath(mounted?.path);
  } catch {
    // The shop still works without its panel's address; the default is what it was before.
    base = DEFAULT_ADMIN_PATH;
  }
};
