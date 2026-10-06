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
