# Rasturan Naval — Base44 dev environment

## What this app is

A Persian (RTL) restaurant site built with React 18 + Vite. There is no backend,
database, or server API: the menu, blog, reviews, and forms are client-side, and
the cart is persisted in `localStorage` (`naval-cart-v1`). Forms (contact,
reservation, checkout, newsletter, auth) validate locally and show a confirmation
in the UI; they do not send data anywhere. Menu, banners, blog, footer and the
static pages are editable from the admin panel at `/admin` (see below).

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

There is no test suite. For UI changes, load the preview and exercise the
interaction directly (cart, quick view, filters, FAQ, search, checkout).

## Sandbox-specific configuration

- `vite.config.js` adds `.$BASE44_SANDBOX_HOST_DOMAIN` to `allowedHosts` only
  when `BASE44_PREVIEW_MODE === "1"`; otherwise the base allowlist (`localhost`)
  is unchanged. It also honours Vite's
  `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` variable. Both variables are passed
  bare through Compose so the platform supplies them.
- No host/origin values are hardcoded.

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
- Auth is a local simulation (no server, passwords are not stored): a login with
  an unknown number starts a brand-new empty account (from `createAccount()` in
  `src/data/account.js`), registration is refused for an already-used number, and
  sign-out clears the session. No sample/demo customer exists any more; the
  provider also purges the removed `09121234567` entry from stored accounts.
- `/account/*` is gated: signed-out visitors get the sign-in card in
  `AccountShell` (it opens `AuthModal` through the `onLogin` prop from
  `src/App.jsx`) instead of the demo dashboard.
- `src/account/Avatar.jsx` renders `user.avatar`: either a `graphic:<id>` key
  (the SVG avatars in `AVATAR_STYLES`, default `graphic:gold`) or a plain image
  URL / data URL. Profile → «آپلود عکس من» turns the picked file into a 320px
  square JPEG data URL with `src/account/avatarUpload.js` (JPG/PNG/WebP,
  ≤ 6 MB) and saves it inside the account entry, so no upload server exists.
- Favorites are product ids, so the heart buttons on `ProductCard`/`ProductPage`
  and the account favorites grid share one source of truth.
- `src/styles/account.css` is the whole account design system (sidebar, panels,
  status pills, cards, modals, skeletons, breakpoints). Store-wide additions in
  it are only the favorite-heart styles.
- Verification: the account pages have no test suite — drive them in the preview
  (reorder, reschedule/cancel a reservation, add/delete an address, save the
  profile, mark notifications, redeem a reward, toggle settings). Reset the
  `naval-accounts-v1` / `naval-account-session-v1` keys afterwards if a check
  registers an account or mutates seed data; sign in as `09121234567` (any
  6+ character password) to get the demo customer back.

## Admin panel (`/admin`)

The site content is editable at `/admin` (login required). There is no backend:
`src/site/SiteContent.jsx` is a React context that keeps the whole content tree
in `localStorage` under `atrin-site-v1`, deep-merged over the defaults in
`src/site/defaultContent.js` (which re-uses the arrays in `src/data/content.js`).
Admins edit through `update()`; every public component reads the same provider
via `useSite()`, so a saved change shows on the site immediately.

- Sections (`src/admin/panels/`): dashboard, orders, products, categories, menu
  filters, header mega menu, hero slides, promo banners, blog posts, discount
  codes, newsletter subscribers, footer (link columns, socials, trust badges,
  legal links), content pages (`/p/:slug`), site identity and contact info,
  settings (admin credentials, 2FA, JSON backup/restore, reset).
- Admin auth (`src/admin/auth.js` + `src/admin/totp.js`): there are no hardcoded
  credentials. The first visit to `/admin` shows «راه‌اندازی مدیر» and stores the
  chosen username/password only as salted PBKDF2-SHA256 hashes in
  `localStorage` under `atrin-admin-auth-v2`; nothing secret is written into the
  site content (legacy `settings.adminUsername/adminPassword` keys are stripped on
  load and are no longer exported with backups). Login is two-step with a real
  RFC 6238 TOTP secret (Google Authenticator, `otpauth://` URI shown at
  enrollment), the code is single-use, 5 failed attempts lock sign-in for two
  minutes, and the form carries an off-screen honeypot field (`name="company_website"`)
  that rejects bot submissions. The session is a 45-minute token in
  `sessionStorage` (`atrin-admin-session-v2`).
- This is still a browser-only gate: anyone with devtools can edit their own
  localStorage/session and see the panel UI. Real protection needs a server.
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
