# Rasturan Naval — Base44 dev environment

## What this app is

A Persian (RTL) restaurant site built with React 18 + Vite. There is no backend,
database, or server API: the menu, blog, reviews, and forms are client-side, and
the cart is persisted in `localStorage` (`naval-cart-v1`). Forms (contact,
reservation, checkout, newsletter, auth) validate locally and show a confirmation
in the UI; they do not send data anywhere.

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

- `src/data/account.js` holds the demo customer in the shape a future API would
  return (user, addresses, orders with priced items, reservations, favorites,
  notifications, loyalty, settings) plus status dictionaries and Persian/Jalali
  formatters (`fa`, `money`, `formatDate`, `orderTotal`, …). Edit seed data there.
- `src/account/AccountContext.jsx` is the only state layer. It hydrates from that
  seed and persists to `localStorage` under `naval-account-v1`; every mutation
  (favorites, addresses, reservations, notifications, rewards, settings) is an
  action on the provider, so swapping in a backend means replacing those bodies.
- Favorites are product ids, so the heart buttons on `ProductCard`/`ProductPage`
  and the account favorites grid share one source of truth.
- `src/styles/account.css` is the whole account design system (sidebar, panels,
  status pills, cards, modals, skeletons, breakpoints). Store-wide additions in
  it are only the favorite-heart styles.
- Verification: the account pages have no test suite — drive them in the preview
  (reorder, reschedule/cancel a reservation, add/delete an address, save the
  profile, mark notifications, redeem a reward, toggle settings). Reset the
  `naval-account-v1` key afterwards if a check mutates seed data.

## Assets

The reference design is `https://avan.wbrk.ir/demo2/`. Its imagery was localized
into `public/assets/` (the origin is not reachable from the sandbox; images were
fetched through the wsrv.nl image proxy and converted to WebP where useful).
The exact reference font, YekanBakh FaNum, is vendored in `public/fonts/` (plus
Caveat Brush for the English script accents). Keep both when editing the design.
