/**
 * Central image helper. Unsplash serves `auto=format`, so browsers receive
 * AVIF/WebP when supported while the markup stays a single URL.
 */
const BASE = 'https://images.unsplash.com/photo-';

export const img = (id: string, w = 800, h = 1000): string =>
  `${BASE}${id}?auto=format&fit=crop&w=${w}&h=${h}&q=70`;

export const heroImg = (id: string): string =>
  `${BASE}${id}?auto=format&fit=crop&w=1600&h=1100&q=75`;

export const wideImg = (id: string, w = 1400, h = 700): string =>
  `${BASE}${id}?auto=format&fit=crop&w=${w}&h=${h}&q=72`;

export const avatarImg = (id: string): string =>
  `${BASE}${id}?auto=format&fit=facearea&facepad=3&w=160&h=160&q=70`;

/** The `w` an editorial URL asks its source for, or 0 when it is not a sized crop. */
const sourceWidth = (url: string): number => {
  const match = /[?&]w=(\d+)/.exec(url);
  return match ? Number(match[1]) : 0;
};

/**
 * A right-sized copy of an editorial Unsplash URL.
 *
 * Those URLs are parameters, and the `w`/`h` in them are the size the *source* asked for — never
 * the size the element is drawn at, which is the only thing a browser can act on. A category tile
 * drawn at 136px was downloading 800×1000, and a promo tile drawn at 343px was downloading
 * 1600×1100. Both dimensions are scaled by the same factor, so the crop the source chose survives
 * and only the resolution changes.
 *
 * `undefined` means "use the URL as it is": a URL that is already small enough, one that carries no
 * size parameters, and every local path (a packshot, an admin-uploaded photo) is left alone.
 */
export const unsplashAt = (url: string, width: number): string | undefined => {
  if (!url.startsWith(BASE)) return undefined;

  const source = sourceWidth(url);
  const height = /[?&]h=(\d+)/.exec(url);
  if (!source || !height || source <= width) return undefined;

  const scaled = Math.round((Number(height[1]) * width) / source);

  return url
    .replace(/([?&])w=\d+/, `$1w=${width}`)
    .replace(/([?&])h=\d+/, `$1h=${scaled}`);
};

/**
 * `srcset` for an editorial photo drawn around `width`: a crop at that width, one at twice it for
 * a high-density screen, and the source itself as the largest candidate — each labelled with its
 * real pixel width, so the browser picks per viewport and DPR instead of always taking the source.
 *
 * `undefined` when the URL carries no size parameters or the source is no larger than the first
 * candidate: there is then nothing to choose between.
 */
export const unsplashSrcSet = (url: string, width: number): string | undefined => {
  const source = sourceWidth(url);
  if (!source || source <= width) return undefined;

  const candidates = [width, width * 2]
    .filter((candidate) => candidate < source)
    .map((candidate) => `${unsplashAt(url, candidate)} ${candidate}w`);

  return [...candidates, `${url} ${source}w`].join(', ');
};
