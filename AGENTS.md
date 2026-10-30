# Rasturan Naval — Base44 dev environment

## What this app is

A Persian (RTL) restaurant site built with React 18 + Vite. The public site is
client-side and has no database: the menu, blog, reviews, and forms are
client-side, and the cart is persisted in `localStorage` (`naval-cart-v1`). Forms
(contact, reservation, checkout, newsletter, customer auth) validate locally and
show a confirmation in the UI; they do not send data anywhere. The single server
component is the admin auth API in `server/` (see the admin panel section). Menu,
banners, blog, footer and the static pages are editable from the admin panel at
`/admin` (see below).

## Running locally

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

The web entry point is `http://localhost:3000`. Vite runs from the bind-mounted
working tree with polling enabled, so edits apply without rebuilding the image.

The Node dependency directory is a named volume (`node_modules`) and is installed
with `npm ci` on container startup from the committed `package-lock.json`.
If you change dependencies, regenerate the lockfile in a Node 22 container and
restart the service; do not delete the volume as a refresh mechanism.

## Verification

```bash
curl -fsS http://localhost:3000/ | head
docker compose -f docker-compose.base44.yml ps
npm run build   # production build sanity check
```

Registration and order-write regression tests run with Node's built-in test
runner (command below). There is no comprehensive UI suite; load the preview
and exercise changed interactions directly (cart, filters, search, checkout).

## Demo seed (test data only)

`scripts/seed-demo.mjs` creates the stand-in "database". Every record lives in
localStorage, so the script generates a fixture module
(`src/dev/demoSeed.data.js` — generated, do not hand-edit) and the dev app writes
it into storage once on the next start, before the providers mount
(`src/dev/demoSeed.js`, called from `src/main.jsx`). It is gated on
`import.meta.env.DEV` and on the `atrin-demo-seed` marker, so later test edits
survive; run the script again to reseed. Seeding replaces `atrin-orders-v1` and
`atrin-newsletter-v1` in that browser and never writes an account: the site
opens signed out, so a demo login has to be registered by hand. The fixture's
`purgeAccounts` list is applied once per fixture and removes the customer that
fixture v1 pre-created (`09123456789`) plus its session.

```bash
docker compose -f docker-compose.base44.yml exec -T web npm run seed:demo
```

Content: 5 orders in the admin list with mixed statuses (customer name/phone are
plain text on the order, not a login) and 6 newsletter subscribers. Dates are
relative to the run time. There is no seeded customer, so the dashboard flows are
tested by registering a throwaway account.

## Sandbox-specific configuration

- `vite.config.js` adds `.$BASE44_SANDBOX_HOST_DOMAIN` to `allowedHosts` only
  when `BASE44_PREVIEW_MODE === "1"`; otherwise the base allowlist (`localhost`)
  is unchanged. It also honours Vite's
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` variable. Both variables are passed
  bare through Compose so the platform supplies them.
- No host/origin values are hardcoded.

## Cart & checkout

The cart is a page, not an overlay: `/cart` (`src/pages/CartPage.jsx`, route `cart`
in `matchRoute()`) holds all four steps — سبد خرید، اطلاعات تحویل، پرداخت، تأیید —
and the header cart button navigates there. Hovering the header cart icon (desktop,
above 1080px) slides out `src/components/CartPreview.jsx` from the side with the
items and a «تسویه حساب» button; that button needs a signed-in customer — signed
out, it opens `AuthModal` in register mode as a mandatory window
(`<AuthModal mandatory>`, i.e. `<Modal closable={false}>`: no close button, the
backdrop is inert and Escape does nothing) and lands on `/cart` after the
visitor registers or switches to the sign-in tab. Every other `openAuth()` caller
(`/account` gate, header login) stays dismissible. It opens
even with an empty cart, showing the «سبد خرید شما خالی است» state with a
«مشاهده منو» shortcut. The same
gate guards step 1 → 2 of the page (`useAccount().isAuthenticated`, exposed by
`AccountContext` — the context exposes `isAuthenticated`, not `signedIn`).
Steps advance in place; the summary
sidebar reuses the `.cart-summary` styles and the page's own CSS is
`src/styles/cart.css`.

Step 1 of `/cart` shows a `.cart-account` notice to guests. Its «تسویه حساب»
button calls the same `openAuthGate()` as the header checkout: there is no
separate inline login/register implementation. `requireAccount()` guards step
1 → 2, step 2 → 3 and final submission; losing authentication resets the step
to 1. A failed login must leave the mandatory window open and must never advance
checkout. Mobiles are typed through `src/lib/phone.js`
(`normalizePhone()` strips non-digits, converts Persian/Arabic digits and
`+98`/`0098` to a Latin `09xxxxxxxxx`, `isValidPhone()` checks that shape); the
same helpers validate the delivery phone and `AuthModal`. Club points are
redeemable in the summary aside (`.cart-points`, only for a signed-in customer):
1 point = 100 تومان off, capped by the balance and the food subtotal, recorded
as `pointsUsed`/`discount` on the order and deducted with
`AccountContext.spendPoints()`. A completed order then earns
`floor(subtotal / 10,000) × 10` points through `earnPoints()`. Submitting writes an order through `addOrder()` and clears
the cart in `App.jsx`.

## Customer account area

`/account` and its sub-routes (`orders`, `reservations`, `favorites`, `addresses`,
`profile`, `notifications`, `rewards`, `settings`, plus `orders/:id` and
`reservations/:id`) render inside `src/account/AccountShell.jsx`; routes are
matched in one block in `matchRoute()` in `src/App.jsx`.

- `src/data/account.js` holds the account domain: `createAccount()` (empty new
  customer), `REWARDS`, `DEFAULT_SETTINGS`, status dictionaries and Persian/Jalali
  formatters (`fa`, `money`, `formatDate`, `orderTotal`, …). There is no seeded
  sample customer — every account starts empty; edit shared defaults there.
- `src/account/AccountContext.jsx` is the only state layer. It keeps one account
  per login identifier in `localStorage` under `naval-accounts-v1`
  (`{ [phone]: account }`) and the signed-in identifier under
  `naval-account-session-v1`; the signed-out visitor uses a `guest` entry that
  only holds local favorites. Every mutation (favorites, addresses,
  reservations, notifications, rewards, settings) is an action on the provider,
  so swapping in a backend means replacing those bodies.
- Customer auth remains a local simulation (no server, passwords are not stored
  or verified). Only explicit registration sets `registrationCompleted: true`;
  `src/account/registration.js` is the shared policy. Unknown/legacy automatic
  profiles cannot log in, and old sessions without completed registration no
  longer authenticate. Completing registration for a legacy profile preserves
  its saved data; duplicate completed registrations are refused. `normalize()`
  must preserve the marker across profile/loyalty updates. `addOrder()` checks
  persisted registration/session again before writing and returns `null` when
  missing; checkout must not clear the cart or award points on that result.
  Sign-out clears the session. No sample/demo customer exists any more; the
  provider also purges the removed `09121234567` entry from stored accounts.
- `/account/*` is gated: signed-out visitors get the sign-in card in
  `AccountShell` (it opens `AuthModal` through the `onLogin` prop from
  `src/App.jsx`) instead of the demo dashboard.
- The header (and the mobile menu footer) read `useAccount()` directly: a
  signed-out visitor gets «ورود / ثبت نام», a signed-in customer gets their
  avatar plus first name as a link to `/account`. Never render the guest button
  while `isAuthenticated` is true, or a signed-in customer is sent back to the
  login window every time they leave the account pages.
- `src/account/Avatar.jsx` renders `user.avatar`: either a `graphic:<id>` key
  (the SVG avatars in `AVATAR_STYLES`, default `graphic:gold`) or a plain image
  URL / data URL. Profile → «آپلود عکس من» turns the picked file into a 320px
  square JPEG data URL with `src/account/avatarUpload.js` (JPG/PNG/WebP,
  ≤ 6 MB) and saves it inside the account entry, so no upload server exists.
- Favorites are product ids, so the heart buttons on `ProductCard`/`ProductPage`
  and the account favorites grid share one source of truth.
- Club rewards are claimed on `/account/rewards` and stay in the account as
  single-use coupons (`loyalty.coupons`, logic in `src/data/rewardCoupons.js`).
  Claiming spends points and issues a code: the discount reward draws a random
  10–30% off, so every claim is a different code; the free-drink / dessert / main
  codes only cover one matching item (the cheapest in the cart), and the delivery
  code covers the delivery fee. `/cart` lists the unused codes in the summary
  aside, applies at most one, and the saved order retires it
  (`useCoupon(code, orderCode)` sets `usedAt`/`orderCode`). The rewards page hands
  a chosen code to the cart through `atrin-pending-coupon`. Coupon logic tests:
  `node --test src/data/rewardCoupons.test.js`.
- `src/styles/account.css` is the whole account design system (sidebar, panels,
  status pills, cards, modals, skeletons, breakpoints). Store-wide additions in
  it are only the favorite-heart styles.
- Registration/order regression checks: `docker compose -f
  docker-compose.base44.yml exec -T web node --test src/account/registration.test.js
  src/data/records.test.js`. UI checks must exercise unknown login rejection,
  direct `/cart` checkout, explicit registration, then delivery/payment. Use a
  unique throwaway account and remove only its own test orders; restore the
  browser's original customer/cart storage afterward. Never use the removed
  demo number or sign into an existing customer with guessed credentials.

## Admin panel (`/admin`)

The site content is editable at `/admin` (login required). There is no backend:
`src/site/SiteContent.jsx` is a React context that keeps the whole content tree
in `localStorage` under `atrin-site-v1`, deep-merged over the defaults in
`src/site/defaultContent.js` (which re-uses the arrays in `src/data/content.js`).
Admins edit through `update()`; every public component reads the same provider
via `useSite()`, so a saved change shows on the site immediately.

Stored content never overrides a shipped change by itself: `SITE_CONTENT_VERSION`
in `src/site/defaultContent.js` plus `migrateSavedContent()` in
`src/site/contentStorage.js` (the plain-JS half of the provider, unit-testable in
Node) syncs a saved copy forward once per version — an old hero slider lineup is
replaced by the shipped one, other saved keys survive.

- Sections (`src/admin/panels/`): dashboard, orders, products, categories, menu
  filters, header mega menu, hero slides, promo banners, blog posts, discount
  codes, newsletter subscribers, footer (link columns, socials, trust badges,
  legal links), content pages (`/p/:slug`), site identity and contact info,
  settings (admin credentials, 2FA, JSON backup/restore, reset).
- Admin auth lives in the `api` compose service (`server/index.js`,
  `server/security.js`, `server/store.js`) and is reached through Vite's `/api`
  proxy, so the browser only ever talks to port 3000. The browser keeps no
  credential: `src/admin/api.js` calls `/api/admin/*`, the session is an
  `HttpOnly; SameSite=Strict` cookie, and every authorization decision is made on
  the server. `src/admin/AdminApp.jsx` opens the panel only after
  `GET /api/admin/session` confirms the cookie.
- The single administrator is provisioned from the platform secrets
  `ADMIN_USERNAME` / `ADMIN_PASSWORD` (delivered via `/run/base44/app.env` to the
  `api` service only, never written to the repo). The record lives in the
  `admin_data` volume at `/data/admin.json` as an scrypt hash plus TOTP state.
  On boot `provisionAdmin()` creates the record, and afterwards re-syncs it
  whenever either secret changes (`username`, and the password hash when the env
  password no longer verifies). The enrolled 2FA secret and backup codes are
  preserved. Because the secrets win at boot, a credential change made in the
  panel lasts only until the next restart — rotate
  `ADMIN_USERNAME` / `ADMIN_PASSWORD` in the dashboard for a permanent change.
  There is no registration endpoint at all, and the env password bypasses the
  panel's 10-character strength rule, so keep it long in production.
- Sign-in is password → RFC 6238 TOTP, and a valid TOTP completes it: no backup
  code is requested on a normal login. Enrolling the authenticator also signs the
  admin in and shows the 8 single-use backup codes once (plaintext never stored or
  re-shown). Backup codes are the emergency path only: when the app is
  unreachable, the code step offers a quiet «به اپلیکیشن Google Authenticator
  دسترسی ندارم» link that swaps TOTP for one single-use code — the password step
  is still required. A server-side 3-failure / 20-minute lock (per account and per
  IP) guards every factor. Sensitive actions (credential change, backup-code
  regeneration) require a full re-authentication token (`ReauthForm.jsx`) with
  password + TOTP, where a backup code is likewise only the emergency substitute;
  a password change bumps `sessionVersion`, which invalidates every session.
- The pending sign-in lives on the server for 10 minutes (the `atrin_admin_challenge`
  cookie plus an in-memory challenge): `GET /api/admin/challenge` returns the
  stage, so a reloaded login card resumes at the 2FA step instead of falling back
  to the password form. `POST /api/admin/challenge/clear` drops it when the admin
  chooses «بازگشت». `vite.config.js` ignores `server/` and `.base44/` in its
  watcher, so API-side file activity never full-reloads the browser.
- Because this is a real server gate, verifying it needs the password: sign in at
  `/admin`, then check `/api/admin/session` returns `authenticated: true`.
- The panel path is configurable: `adminPath` in the stored site content
  (Settings → «مسیر ورود به پنل», resolved by `src/lib/adminPath.js` and used by
  `matchRoute()` in `src/App.jsx` plus every in-panel link). It lives in the
  browser's `atrin-site-v1` content like every other editable field, and the old
  path returns 404 afterwards — it hides the panel, it is not extra security.
- Orders, newsletter sign-ups and their admin lists use `src/data/records.js`
  (`atrin-orders-v1`, `atrin-newsletter-v1` in `localStorage`). Checkout writes an
  order there; the footer newsletter form writes a subscriber. Discount codes are
  edited in the panel and stored in the site content (`discountCodes`); they are
  not applied in checkout yet.
- Images are picked in the panel and converted to ≤1100px JPEG data URLs by
  `src/admin/imageUpload.js`, so everything stays inside localStorage; the
  backup/restore buttons in Settings move that content between browsers.
- Routes: `/admin` and `/admin/<section>` are matched in `matchRoute()` in
  `src/App.jsx` and rendered without the public header/footer. Content pages use
  `/p/<slug>` and are rendered by `src/pages/InfoPage.jsx`.
- Styles live in `src/styles/admin.css`: the panel uses the site's brand red
  (`--primary` / `--primary-bright`) for the sidebar, headings and buttons, on the
  same cream surfaces as the rest of the site.
- Two-factor codes are real TOTP: an automated check can read the secret from the
  setup screen and compute a 6-digit code with `crypto.subtle` HMAC-SHA1.
- Verification: sign in at `/admin`, add a product, then check it appears on
  `/menu`; edit a footer badge and confirm the public footer updates; delete the
  test record and use Settings → «بازگرداندن سایت به حالت اولیه» if needed.

## Assets

The reference design is `https://avan.wbrk.ir/demo2/`. Its imagery was localized
into `public/assets/` (the origin is not reachable from the sandbox; images were
fetched through the wsrv.nl image proxy and converted to WebP where useful).
The exact reference font, YekanBakh FaNum, is vendored in `public/fonts/` (plus
Caveat Brush for the English script accents). Keep both when editing the design.
