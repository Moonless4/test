# Horizon Properties — working notes

Single-page React app (no backend service) served by Vite in dev mode.

## Run it
```bash
docker compose -f docker-compose.base44.yml up -d --build   # web on http://localhost:3000
docker compose -f docker-compose.base44.yml logs -f web     # dev server output
```
The `web` service runs `npm ci` on start (lockfile-preserving) and binds Vite to `0.0.0.0:3000`.
Dependencies live in the `node_modules` Docker volume, not in the repo — after editing
`package.json`, regenerate `package-lock.json` and recreate the service.

## Verify
- `curl -s -o /dev/null -w '%{http_code}' http://localhost:3000/` → `200` and the page shell.
- `docker compose -f docker-compose.base44.yml exec -T web npx tsc --noEmit` → no output.
- Browser check: no `vite-error-overlay`, `#root` has children, no failed module requests.

## Localisation & RTL (Persian)
- The app is **Persian-only and RTL**. `index.html` sets `lang="fa" dir="rtl"`; Tailwind
  `fontFamily.sans` and the Google-Fonts link are Vazirmatn. Body copy uses generous leading
  (`line-height` > 1.7); Persian labels must not use `uppercase` or wide `tracking`.
- **Use logical properties** (`ps/pe/ms/me/start/end`) for anything positional. Physical
  `left/right` is reserved for places where mirroring would be wrong (carousel edge buttons).
- **Directional icons are mirrored on purpose** — do not "restore" them to the LTR glyphs:
  forward CTAs use `ArrowLeft`, breadcrumb separators are `ChevronLeft`, diagonal/external links
  are `ArrowUpLeft`, and the gallery & carousel prev/next arrows are swapped.
- **Numbers, prices and phones** live in `src/lib/format.ts`: prices are Toman, digits are
  Persian via `Intl('fa-IR')`, and `telHref()` converts Persian digits into a dial-safe `+98…`
  link (plain Persian digits in an `href` produce a dead `tel:`).
- **`PropertyCarousel` scroll maths is RTL-specific**: `scrollLeft` runs `0 → −max`, so it
  normalises with `Math.abs` and *adds* the drag delta. Any change there must keep both arrow
  buttons and the keyboard mapping mirrored.
- **Content is Iranian**: cities/regions, Toman prices, `area`/`land` in square metres, Jalali
  `year` (`سال ساخت`). The old `sqft` / `lotAcres` fields were renamed to `area` / `land`.
- **Quick RTL verification**: `document.documentElement.dir === 'rtl'`,
  `scrollWidth === clientWidth` (no horizontal overflow), and the first grid column renders on
  the right.

## Non-obvious things
- **Vite host/origin gating.** `vite.config.ts` sets `server.allowedHosts: true` plus
  `host: true`; the proxy hostname changes whenever the sandbox is recreated, so an exact-host
  allowlist would break the preview. File watching uses polling because the repo is bind-mounted.
- **Photography is remote.** All imagery comes from the Unsplash CDN through `src/lib/images.ts`
  using curated photo ids in `src/data/*`. There is no API key. If the sandbox loses outbound
  network access, images (not the layout) will fail — that is an environment issue, not a bug.
- **No database.** Property content is a typed module (`src/data/properties.ts`) read *only*
  through `src/lib/properties.ts`. Swapping that module for `fetch` calls is the whole migration
  path to a real backend; no component needs to change.
- **Client-side persistence.** Saved properties (`horizon.favorites`) and every form submission
  (`horizon.inquiries`) are stored in `localStorage` via `src/lib/favorites.ts` and
  `src/lib/inquiries.ts`. `submitInquiry` is the single seam where a CRM/API call belongs.
- **Filters are URL state.** The properties page keeps search/filter/sort in query params, so a
  filtered view can be shared or reloaded; `src/lib/filters.ts` owns the matching and sorting.
- Routes: `/`, `/properties`, `/properties/:slug`, `/about`, `/services`, `/team`, `/contact`,
  `/favorites`. The header is fixed and transparent only over the home hero; interior pages sit
  on a navy band, which is why page content starts at `pt-28`.
