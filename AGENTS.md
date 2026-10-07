# STYLEON — Base44 dev environment notes

Persian (RTL) fashion storefront. Single-page **React 18 + TypeScript + Vite + Tailwind** app.
There is no backend, database, queue or external credential — everything renders from local
mock data, so the stack is a single container.

## Running it

```bash
docker compose -f docker-compose.base44.yml up -d --build
curl -I http://localhost:3000/
```

- Dev server listens on **host port 3000** (`vite`, `host: 0.0.0.0`, `strictPort`).
- `npm ci` runs at container start, then `npm run dev`. `node_modules/` lives in the bind
  mounted repo (gitignored) — do not delete it while the container is running.
- Source is bind mounted, so edits hot-reload. If HMR ever stops firing, the dev server polls
  the filesystem (`server.watch.usePolling`) already.
- Host/origin checks: `server.allowedHosts = true` in `vite.config.ts` plus the platform's
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` env var. The preview proxy host is environment
  specific, so never hardcode it.

## Things that are easy to get wrong

- **RTL**: `<html dir="rtl">`. Use logical Tailwind utilities (`start-*`, `end-*`, `ms-*`, `me-*`,
  `ps-*`, `pe-*`) instead of `left-*`/`right-*`, otherwise the layout flips incorrectly.
- **Persian digits**: never print raw JS numbers into the UI. Use `toFa` / `formatNumber` /
  `formatPrice` from `src/lib/format.ts`.
- **Discounted products must always show the original price with a strikethrough above the
  discounted price.** That rule lives in `src/components/ui/PriceDisplay.tsx`; the red badge is
  `DiscountBadge`. Both are driven by `price` / `originalPrice` in `src/lib/data.ts`.
- **Images** are hotlinked from `images.unsplash.com` and need network access in the browser.
  Always build URLs through `src/lib/images.ts` (`img`, `heroImg`, `wideImg`, `avatarImg`) so the
  crop size and `auto=format` (AVIF/WebP) parameters stay consistent. Product cards assume a 4:5
  image area.
- **Layout must not scroll horizontally.** `body` uses `overflow-x: clip` (not `hidden`, which
  breaks the sticky header).
- `tsconfig` has `noUnusedLocals`; `npm run typecheck` is the quick sanity check.

## Where things live

- `src/lib/data.ts` — the whole catalog (28 products), categories, hero slides, testimonials,
  blog posts. Prices are plain Toman integers.
- `src/context/StoreContext.tsx` — cart + wishlist state, persisted to `localStorage`
  (`styleon.cart`, `styleon.wishlist`). Adding to the cart opens the drawer. Wishlist is added from
  the product page only; product cards carry no heart button.
- `src/context/AuthContext.tsx` — demo accounts. Users, session, addresses and orders are kept in
  `localStorage` (`styleon.users`, `styleon.session`, `styleon.addresses`, `styleon.orders`) because
  the app ships without a server. Replace these helpers with real API calls when a backend exists.
- `src/lib/filters.ts` + `src/components/shop/FilterLayout.tsx` — one filter model and layout shared
  by `/shop` and `/search`. Filter groups are collapsible and start closed; their state resets when
  the category, discount flag or search query changes.
- `src/components/home/*` — the homepage sections in `src/pages/HomePage.tsx` order:
  Hero, CategoryCards, DiscountSection, PromoBanners, NewArrivals, Benefits, PromoCollection,
  Testimonials, Newsletter.
- Other routes: `/shop`, `/shop/:category`, `/product/:id`, `/search?q=`, `/cart`, `/checkout`,
  `/wishlist`, `/blog`, `/blog/:id`, `/login`, `/register`, `/account`.

## Verifying a change

1. `curl -s http://localhost:3000/ | head` — dev server serves the live HTML shell.
2. `docker compose -f docker-compose.base44.yml ps` — web service must be `healthy`.
3. Drive the real UI in the preview: add to cart, wishlist, search, filters, checkout steps.
