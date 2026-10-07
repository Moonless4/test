# MEDORA («مدورا») — Base44 dev environment notes

Persian (RTL) fashion storefront. Single-page **React 18 + TypeScript + Vite + Tailwind** app, plus
a dependency-free Node payment service (`server/`). No database and no external credential except
the payment merchant id: the catalog, the cart and the accounts render from local mock data and
localStorage.

## Running it

```bash
docker compose -f docker-compose.base44.yml up -d --build
curl -I http://localhost:3000/
```

- Dev server listens on **host port 3000** (`vite`, `host: 0.0.0.0`, `strictPort`) and proxies
  `/api` to the `api` service (`PAYMENT_API_ORIGIN`, default `http://api:8000`), so the app, the
  Zarinpal callback and the session share one origin. Do not publish the payment service on its
  own port.
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
  Replace these helpers with real API calls when a backend exists. `updateOrderStatus` relabels an
  order already in the book, which is how a payment moves it from awaiting to processing.
- `src/lib/payment.ts` + `src/pages/PaymentPage.tsx` + `server/index.mjs` — the payment path.
  Checkout turns the basket into a `PaymentOrder`, keeps it in the store-wide ledger
  (`styleon.payments`), registers it in the account panel as «در انتظار پرداخت» and hands off to
  `activeGateway.handoff()` (async: a real gateway has to be asked first). `VITE_PAYMENT_GATEWAY`
  picks the gateway: `sandbox` (default) keeps the in-app stand-in bank page at `/payment/:id`,
  which moves no money, while `zarinpal` calls the payment service — `POST /api/payment/request`
  → Zarinpal REST v4 (amounts travel in Toman and are sent in Rial) → the shopper pays at
  `payment.zarinpal.com`, and `GET /api/payment/callback` verifies server-side before sending them
  back to `/checkout?payment=…&order=…&ref=…`.
  Coins, the discount code and the basket are settled on the way *back*, in `CheckoutPage`'s return
  effect, never on submit, so an abandoned payment leaves the basket intact. That effect only
  settles a ledger record that is still `pending` — the stand-in gateway has written its own record
  by the time it returns, so nothing is settled twice.
  `ZARINPAL_MERCHANT_ID` arrives through the platform env file (`/run/base44/app.env`); without it
  `/api/payment/request` answers 503 with a Persian message. `ZARINPAL_SANDBOX=1` (the compose
  default) points at `sandbox.zarinpal.com`; a host sets it to `0` and sets
  `VITE_PAYMENT_GATEWAY=zarinpal` for live money. Requests in flight live in the service's memory —
  a restart forgets a payment still at the bank, and the shopper lands back on the checkout.
  The ledger is the only place a guest's order is recorded; the account panel still needs a session.
- `src/lib/filters.ts` + `src/components/shop/FilterLayout.tsx` — one filter model and layout shared
  by `/shop` and `/search`. Filter groups are collapsible and start closed; their state resets when
  the category, discount flag or search query changes.
- `src/components/home/*` — the homepage sections in `src/pages/HomePage.tsx` order:
  Hero, CategoryCards, DiscountSection, PromoBanners, NewArrivals, Benefits, PromoCollection,
  Testimonials, Newsletter.
- `src/lib/faq.ts` + `src/pages/FaqPage.tsx` + `src/components/faq/FaqAccordion.tsx` — «سوالات متداول».
  Questions are grouped by topic; the page filters by group (a wrapping row of chips on a phone, a
  rail from `lg`) and renders one `FaqAccordion` per group (one answer open at a time, the first one
  open on mount). The footer's «سوالات متداول» link points here. Answers are plain strings, so they
  carry no `<Price>`: keep money out of the prose and name the shop's real rules instead — the coin
  rates, coupon codes and return window in that file must stay true to what the app does.
- Other routes: `/shop`, `/shop/:category`, `/product/:id`, `/search?q=`, `/cart`, `/checkout`,
  `/wishlist`, `/blog`, `/blog/:id`, `/login`, `/register`, `/account`, `/faq`.

## Porting to WordPress

The owner's plan is to move the storefront to WordPress and host it. Nothing here is a WordPress
theme, so the port means rebuilding the pages as a theme (or running this SPA headless) and moving
the catalog, the accounts and the orders into WooCommerce — `src/lib/data.ts` and the localStorage
stores in the contexts are what get replaced. The payment path is the piece that does *not* carry
over: on WordPress, WooCommerce plus the زرین‌پال gateway plugin owns it, and `server/index.mjs`
exists for the SPA while it stands alone. `src/lib/payment.ts` stays the contract either way — a
headless build would point it at WooCommerce's REST API instead.

Caveat when verifying payments here: the sandbox cannot reach `zarinpal.com` (the request times
out), so the live gateway can only be exercised on a host that can. With a stub behind `fetch`, the
request/verify/redirect logic can still be checked end to end.

## Verifying a change

1. `curl -s http://localhost:3000/ | head` — dev server serves the live HTML shell.
2. `docker compose -f docker-compose.base44.yml ps` — web service must be `healthy`.
3. Drive the real UI in the preview: add to cart, wishlist, search, filters, checkout steps.
