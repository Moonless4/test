# MEDORA («مدورا») — Base44 dev environment notes

Persian (RTL) fashion storefront. Single-page **React 18 + TypeScript + Vite + Tailwind** app, plus
a dependency-free Node service (`server/`) that hosts the payment path and the commerce proxy.

The store is being moved onto the owner's own **WordPress + WooCommerce** site. The API layer for
it is in place (`server/commerce.mjs`, `src/lib/woo/`, `src/services/`, `src/hooks/`); the screens
still render from the old catalogue in `src/lib/data.ts` and the localStorage stores, and are being
moved over one surface at a time. See "Headless WooCommerce".

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
  image area. The hero slider carries two crops per slide: `image` (1800×780, tablets and desktop)
  and `imagePhone` (1100×1000). The wide crop inside a phone-height box is zoomed in ~2.6× (only a
  third of the photo survives `object-cover`), so `Hero` picks `imagePhone` under
  `matchMedia('(max-width: 639px)')` and its box keeps that ~11:10 shape (`aspect-[11/10]`,
  `sm:aspect-auto sm:min-h-[420px]`), which is what sizes the slider on a phone.
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
  footer, which drops it straight onto the dark teal — never put a chip or background behind it.
  `public/medora-mark.png` is the standalone mark (black ink on transparency) and is what the phone
  and tablet tab bar's round brand button carries: a lockup is illegible at 46px, and the mark keeps
  the tile's white chip so the black ink reads. The active tab is signalled by that chip's ring
  colour, since the artwork itself cannot change colour. The
  `localStorage` keys still carry the historic `styleon.*` prefix on purpose — renaming them would
  drop every saved cart, session and order.
- **Trust badge**: the eNamad seal is `public/enamad.png` (artwork that carries its own white
  background), shown under «تماس با ما» in the footer on a white chip and linking to
  `trustseal.enamad.ir`.
- `tsconfig` has `noUnusedLocals`; `npm run typecheck` is the quick sanity check.

## Performance

Measured on the production build (`npm run build` then `vite preview`) with mobile emulation and a
4× CPU / Slow-4G throttle — baseline → now: **LCP 2715 → 1738 ms**, initial JS **109 → 85 KB**
(111.8 → 86.8 KB gzip, 15 route chunks split out), fonts **168 KB TTF → 54 KB WOFF2**, logos
**284 KB PNG → 23 KB WebP**, CLS **0 → 0**, TBT ~unchanged.

- **Fonts** are WOFF2 (`public/fonts/iranyekanx/*.woff2`; the TTFs stay as the editable source) and
  both weights are preloaded in `index.html` with `crossorigin`. The `@font-face` rules must keep
  pointing at the WOFF2 files or the preload is wasted.
- **The hero's first slide is preloaded per breakpoint** in `index.html` (phone crop under 640px, the
  wide crop above it). Those two URLs must stay byte-identical to the ones `Hero` asks for, or the
  photo downloads twice. `Hero` gives slide 0 `priority="high"` and the other slides `"low"`: all
  three sit inside the viewport, so without it the followers compete with the LCP image.
- `Img` exposes `priority`, which writes the lowercase `fetchpriority` attribute. React 18 drops the
  camelCase `fetchPriority` prop with a console warning — use `priority`, never `fetchPriority`.
- **Route chunks**: every page except `HomePage` is `lazy()` in `App.tsx`, inside one `Suspense`
  whose fallback only reserves height (`min-h-[70vh]`) so the footer cannot jump while a chunk
  arrives. `HomePage` stays in the entry chunk on purpose — it is the landing page.
- **Static artwork** in `public/` is WebP at ~3× its display size (`medora-logo.webp` 565×120,
  `medora-logo-white.webp`, `medora-mark.webp` 96×72) and carries `width`/`height` so the header logo
  cannot shift the layout. The `.png` originals remain as the source and are no longer requested.
- The dev server on port 3000 serves unbundled modules with no compression and no caching, so
  Lighthouse numbers against it mean nothing — measure the built app.
- Left to the host, not done here: Brotli/Gzip on the wire and long-lived caching for the hashed
  `dist/assets/*` files (Vite already fingerprints them). See "Porting to WordPress".

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
  The checkout offers a signed-in shopper's saved addresses above «اطلاعات ارسال» and fills the
  shipping form from the one they tap (the receiver splits into first/last name; an address carries
  no province, so that field is left as it is).
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

## Headless WooCommerce

The storefront is being moved onto the owner's WordPress + WooCommerce site. The browser never talks
to WordPress: every storefront call goes to the **commerce proxy** in `server/commerce.mjs`, served
on the app's own origin under `/api/commerce/*` (the dev server already proxies `/api` to the `api`
service, so there is one origin, no CORS and no cookie games).

```
browser ──/api/commerce/*──▶ server/commerce.mjs ──▶ WordPress + WooCommerce
                             the only place the store URL
                             and the credentials exist
```

| route | reaches | credential |
| --- | --- | --- |
| `GET /api/commerce/store/*` | WooCommerce **Store API** (`wc/store/v1`): products, categories, attributes, reviews, the cart, checkout | none — it is public by design |
| `GET /api/commerce/content/*` | WordPress REST (`wp/v2`): posts, media, menus | application password, when configured |
| `GET /api/commerce/admin/*` | WooCommerce REST (`wc/v3`): the reads the Store API cannot serve | consumer key + secret |
| `GET /api/commerce/health` | — | reports `configured` / `admin` / `content` only |

- Only those three namespaces are routable, `content` and `admin` are **GET-only**, and a
  state-changing call carrying a foreign `Origin` is refused (403). The proxy is not an open
  forwarder: `/wp-json/wp/v2/users`, `/wp-admin` and every other path are unreachable through it.
- Reads are cached in memory for `WOO_CACHE_TTL_MS` (45 s) with request de-duplication in the
  client. Anything session-bound — cart, checkout, an order, or any request carrying a cookie or a
  cart token — never touches the cache.
- Cart sessions round-trip untouched: the shopper's cookie and the Store API's `Cart-Token` /
  `X-WC-Store-API-Nonce` headers are forwarded both ways. The one rewrite is the `Domain` attribute
  WordPress puts on its cookie — the browser is on *our* host, so a cookie naming the store's domain
  would be rejected. Nothing else about the cookie is touched.
- An upstream failure never reaches the browser verbatim: a 5xx is logged server-side and answered
  as a Persian 502/504, so a WordPress stack trace, a path or a token cannot leak through the proxy.
- **No credential ever goes under compose `environment:`** — the store URL and keys arrive through
  `/run/base44/app.env` and nowhere else, so a value added in the dashboard always wins. Without
  `WOO_STORE_URL` every commerce route answers 503 and the UI renders a "store not connected" state.

### Frontend data layer

| layer | file | what it owns |
| --- | --- | --- |
| transport | `src/lib/woo/client.ts` | de-duplication, the 30 s read cache, the cart session, `CommerceError` |
| wire types | `src/lib/woo/types.ts` | the Store API / WP REST shapes, for the subset used |
| models | `src/lib/woo/map.ts` | WooCommerce → the app's own `Product` / `Category` / `BlogPost` |
| services | `src/services/*.ts` | products, catalog + filters, search, content, cart, checkout, orders |
| hooks | `src/hooks/useAsync.ts`, `src/hooks/useCatalog.ts` | loading / error / retry, one hook per read |

- Components consume the **services or the hooks**. No component builds a query string, calls
  `fetch`, or sees a WordPress shape.
- **Money** is converted once, in `map.ts`: the Store API sends prices as strings in the store's
  minor unit with a currency code, and Rial is divided by ten to reach the Toman the UI renders.
  `cartTotals()` in `src/services/cart.ts` is the only place the cart's money is read, so the app
  cannot disagree with the total WooCommerce will put on the order.
- The sale rail's minimum discount is a **parameter** (`DEFAULT_MIN_DISCOUNT`, overridable per
  call), and the discount itself is computed from the two prices the store publishes, never stored.
- Categories are whatever the store has: `CategoryId` is now `string`, so nothing may assume the
  original six slugs.
- The filter rail (`buildFilterGroups` in `src/services/catalog.ts`) is derived from the store's
  categories and attributes on every load — add or rename an attribute in WooCommerce and it follows.
- Colours carry no hex in the Store API (term meta is not exposed), so `map.ts` honours a `#rrggbb`
  written into the term description and otherwise matches the term name against the usual names.
- The Store API publishes an exact `stock_quantity` only while stock is low
  (`low_stock_remaining`); the real number lives behind the admin namespace.

### Still to wire

The API layer is in place; these screens still read `src/lib/data.ts`. Order: catalog surfaces
(home rails, shop, category, product, search, sale) → cart and checkout → content surfaces (header,
mega menu, footer, blog, FAQ) → customer accounts.

Customer sign-in is the one piece needing a decision before it is written: the Store API has no
account endpoints, so it is either WordPress **application passwords** proxied server-side or a JWT
plugin on the site. Never add a proxy route that trusts a client-supplied customer id — that is how
one shopper reads another's orders. Orders are read back one at a time with the `order_key`
WooCommerce issued (`src/services/orders.ts`), which is what makes "own orders only" true.

The payment path does *not* carry over to WooCommerce: on WordPress the زرین‌پال gateway plugin
owns it, and `server/index.mjs` exists for the SPA while it stands alone.

Caveat when verifying payments here: the sandbox cannot reach `zarinpal.com` (the request times
out), so the live gateway can only be exercised on a host that can. With a stub behind `fetch`, the
request/verify/redirect logic can still be checked end to end.

## Verifying a change

1. `curl -s http://localhost:3000/ | head` — dev server serves the live HTML shell.
2. `docker compose -f docker-compose.base44.yml ps` — web service must be `healthy`.
3. Drive the real UI in the preview: add to cart, wishlist, search, filters, checkout steps.
4. Commerce proxy: `curl -s http://localhost:3000/api/commerce/health` — `configured: false` until
   `WOO_STORE_URL` is set, `true` after. `content`/`admin` are GET-only, so a POST answers 405, and
   an unknown namespace answers 404. To exercise the whole path without the real store, point a
   throwaway instance at any WordPress site and read its posts:

   ```bash
   docker compose -f docker-compose.base44.yml exec -T api sh -c '
     PAYMENT_API_PORT=8999 WOO_STORE_URL=https://wordpress.org/news node server/index.mjs &
     sleep 1.5
     curl -s "http://127.0.0.1:8999/api/commerce/content/posts?per_page=2" | head -c 200
     kill %1'
   ```

   `x-wp-total` / `x-wp-totalpages` coming back proves pagination survives the proxy, and
   `x-commerce-cache` flips `miss` → `hit` on the second call.
5. Security regressions: `curl -i http://localhost:3000/api/payment/health` (headers present, no
   configuration in the body), then `curl -s -o /dev/null -w '%{http_code}' -X POST
   http://localhost:3000/api/payment/request -H 'content-type: application/json' -d
   '{"orderId":"../../x","amount":1000}'` (400) and the same with `-H 'Origin: https://evil.example'`
   (403). See "Security" below for the full list.

## Security

The storefront is a static SPA: no server-side session, no database, no user data beyond what the
browser stores itself. The only server-side attack surface is the payment service
(`server/index.mjs`) — and it **is** reachable from the public preview host through the dev server's
`/api` proxy, so that is where the hardening lives rather than in the SPA.

**What the payment service enforces:**

- A **16 KB body cap**, so a huge POST cannot be buffered into memory.
- A **JSON object** body only: a scalar, an array or malformed JSON is rejected.
- `orderId` limited to 64 characters of `[A-Za-z0-9._-]`; `amount` must be a **JSON number**,
  integral, positive and at most 1e9 Toman (a numeric string is rejected rather than coerced);
  `description` is truncated to 300 characters.
- An **Origin check** on `POST /api/payment/request`: a state-changing request carrying a foreign
  `Origin` is answered 403 — the CSRF defence for the one route that moves money.
- A **fixed-window rate limit** (30 requests/minute per client IP, with `Retry-After` on 429) on the
  request and callback routes. The dev server's proxy forwards `x-forwarded-for` (`xfwd: true` in
  `vite.config.ts`) so the limit keys on the shopper, not on the proxy.
- **Bounded memory**: `pending` entries expire after 30 minutes and the map is capped at 500, so it
  cannot be grown without bound by repeated requests.
- **Security headers** on every response: `nosniff`, `DENY` framing, `no-referrer`, a
  `default-src 'none'` CSP, `no-store`, and HSTS when the request arrived over TLS
  (`x-forwarded-proto: https`).
- `GET /api/payment/health` reports only `{ ok, gateway, sandbox }` — it no longer discloses
  whether the merchant id is configured, the site URL, or the in-flight count.
- Errors never carry a stack trace or a configuration value; details go to the server log only.

**Client-side**: there is no `dangerouslySetInnerHTML`, `eval` or `innerHTML` anywhere in the
source, so everything a shopper can type (search query, review text, checkout fields) reaches the
DOM as escaped React text. Keep it that way — a review or a query must never be rendered as HTML.

### Accepted limitations (only a backend can fix these)

These are architectural, not bugs, and no client-side change removes them:

- **Accounts live in `localStorage`** (`AuthContext.tsx`), passwords included. Anything in the
  browser is readable by any script on the origin, and a client-only app must keep a verifier it
  can compare against — so hashing it there would rename the problem, not solve it. Do not put real
  customer credentials into this demo.
- **Authorization is client-side.** `addressBook[userId]` / `orderBook[userId]` are trusted because
  there is no server to re-check them. The `AccountPage` route guard is a UX affordance, not access
  control.
- **The ledger is client-side**, so `/checkout?payment=paid&order=…` can mark a pending record paid
  in the shopper's *own* browser. It grants nothing beyond that browser, but the payment status
  must be re-verified server-side once a backend exists.
- **The amount is whatever the client posts.** The service validates its *shape*, never its
  *correctness*: only a server-side price source (WooCommerce's order total) can prove the amount
  matches the basket. Fix this first when the store gets a backend.
- `ZARINPAL_MERCHANT_ID` is the only real credential and stays server-side. Never move it to a
  `VITE_*` variable — Vite inlines every `VITE_` value into the client bundle.
- The dev server's `allowedHosts: true` is a preview-only concession. A host must serve the built
  app behind HTTPS with HSTS and a real CSP; Vite's dev server sets neither.
