# MEDORA («مدورا») — Base44 dev environment notes

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
- **Persian digits**: never print raw JS numbers into the UI. Use `toFa` / `formatNumber` from
  `src/lib/format.ts`.
- **Prices**: render every amount with `<Price value={…} />` (`src/components/ui/Price.tsx`) —
  Persian digits followed by the Toman glyph (`TomanIcon`, also used for the accessible name).
  Never print the word «تومان» as text.
- **Discounted products must always show the original price with a strikethrough above the
  discounted price.** That rule lives in `src/components/ui/PriceDisplay.tsx`; the red badge is
  `DiscountBadge`. Both are driven by `price` / `originalPrice` in `src/lib/data.ts`.
- **Images** are hotlinked from `images.unsplash.com` and need network access in the browser.
  Always build URLs through `src/lib/images.ts` (`img`, `heroImg`, `wideImg`, `avatarImg`) so the
  crop size and `auto=format` (AVIF/WebP) parameters stay consistent. Product cards assume a 4:5
  image area.
- **Layout must not scroll horizontally.** `body` uses `overflow-x: clip` (not `hidden`, which
  breaks the sticky header).
- **Bottom-bar cutoff is 769px** (`min-[769px]:`, deliberately 1px above Tailwind's `md`, so a 768px
  tablet keeps the phone chrome). The bottom tab bar, the product action bar, the category drawer,
  the footer's reserved strip and the header's main menu + wishlist/account icons all switch there.
  Keep them in step: up to 768px the bottom bar is the only place for the wishlist, the account and
  the category drawer, so the header hides its menu row and those two icons; from 769px the header
  takes over and the bar goes away. The header's search pill stays at `lg` (1024px) — it needs the
  room next to the logo — so 769–1023px keeps the search icon instead.
- **The bottom tab bar is `fixed`** — it is anchored to the viewport, not to a document slot — and
  the footer reserves the strip it needs with `pb-[69px] xl:pb-0`. Keep that number equal to the
  bar's height (62px row + 6px padding + border): if they drift, the bar either sits in a strip of
  its own under the footer or covers the footer's copyright row. `sticky bottom-0` looked right in
  the sandbox preview but on a real tablet the bar stayed at the end of the document until the user
  scrolled, so do not go back to it.
- **Bottom bars need the `visualViewport` nudge**: `MobileTabBar` lifts itself with a `translateY`
  equal to the strip a dynamic-toolbar browser hides below the layout viewport, otherwise the bar
  starts off-screen and only appears after the first scroll on iPad Safari. The offset is 0 wherever
  the two viewports agree, so it is a no-op in the sandbox preview and on desktop.
- **Brand**: the store is MEDORA / «مدورا». Two lockups, both in `public/`: `medora-logo.png` (black
  on white) for the header, and `medora-logo-white.png` (white ink, transparent background) for the
  footer, which drops it straight onto the dark teal — never put a chip or background behind it. At
  tab-bar and favicon size a lockup is illegible, so those two keep a letter tile ("M"). The
  `localStorage` keys still carry the historic `styleon.*` prefix on purpose — renaming them would
  drop every saved cart, session and order.
- **Trust badge**: the eNamad seal is `public/enamad.png` (artwork that carries its own white
  background), shown under «تماس با ما» in the footer on a white chip and linking to
  `trustseal.enamad.ir`.
- `tsconfig` has `noUnusedLocals`; `npm run typecheck` is the quick sanity check.

## Where things live

- `src/lib/data.ts` — the whole catalog (28 products), categories, hero slides, testimonials,
  blog posts. Prices are plain Toman integers. `relatedProducts()` returns same-category,
  same-kind items only (`TYPE_RULES` maps a Persian product name to a kind such as
  outerwear/top/bottom), so a coat rail never shows a t-shirt; it can return an empty list, and
  `ProductPage` then hides the whole «محصولات مرتبط» section.
- `src/context/StoreContext.tsx` — cart + wishlist state, persisted to `localStorage`
  (`styleon.cart`, `styleon.wishlist`). Adding to the cart opens the drawer. Wishlist is added from
  the product page only; product cards carry no heart button. It also owns the basket perks: the
  applied discount code (`styleon.coupon`), the «مدورا کوین» balance (`styleon.coins`), the
  coupon/coin maths behind `due`, and `settleOrder()`, which credits the coins a placed order earns
  and debits the ones it spends. Codes and coin rules are plain data in `src/lib/data.ts`, rendered
  by one shared box: `src/components/cart/RewardPanel.tsx`.
- `src/context/AuthContext.tsx` — demo accounts. Users, session, addresses, orders and the wallet
  (balance + transactions) are kept in `localStorage` (`styleon.users`, `styleon.session`,
  `styleon.addresses`, `styleon.orders`, `styleon.wallet`) because the app ships without a server.
  Replace these helpers with real API calls when a backend exists.
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
