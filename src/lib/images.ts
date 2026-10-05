const BASE = 'https://images.unsplash.com/'

/**
 * Builds a responsive Unsplash URL for a curated photo id.
 * Keeping photography behind one helper makes it trivial to swap in a CDN
 * or self-hosted assets later.
 */
export const photo = (id: string, width = 1600, quality = 78): string =>
  `${BASE}${id}?auto=format&fit=crop&w=${width}&q=${quality}`

export const photoSrcSet = (
  id: string,
  widths: number[] = [640, 960, 1280, 1600, 2000],
  quality = 78,
): string => widths.map((w) => `${photo(id, w, quality)} ${w}w`).join(', ')

/** Portrait crops need a taller aspect ratio than landscape architecture shots. */
export const portraitSrcSet = (
  id: string,
  widths: number[] = [320, 480, 640, 900],
  quality = 78,
): string => widths.map((w) => `${photo(id, w, quality)} ${w}w`).join(', ')
