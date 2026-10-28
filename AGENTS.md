# AGENTS.md

## Running the app

`docker compose -f docker-compose.base44.yml up -d --build` starts a single
`web` service: plain `node:22` with the repo bind-mounted at `/app`, running
Vite's dev server (`npm install` on container start, then `vite --host
0.0.0.0 --port 5173`). Host port 3000 maps to 5173, so
`docker compose ... exec web node -e "fetch('http://127.0.0.1:5173/')"` is the
quickest health probe. `node_modules` lives in a named volume, so dependency
changes need a container recreate (`docker compose -f docker-compose.base44.yml
up -d --build`), not a host `npm install`.

## Structure

- `index.html` loads the theme's original stylesheets by absolute path from
  `public/assets/...` (fonts, Swiper, Bootstrap grid, Elementor CSS). Those
  files are self-hosted copies; do not re-link the reference site. They are
  needed by the captured header, footer and homepage only — rebuilt pages never
  reference Elementor classes.
- `src/App.jsx` is the layout shell: `#container` → captured header → 
  `#page-body` with the routed page → captured footer. `Header`/`Footer`
  (`src/components/`) render `src/content/*.html` inside a slot with
  `display: contents`, because the theme positions `#page-body` with
  `#header-container + #page-body` and `body.sticky-header #header-container + *`.
  `styles/site.css` restores that fixed-header offset for the slot.
- `src/routes.jsx` is the route table. Every page module in `src/pages/` is
  `React.lazy`-loaded, so the homepage markup only ships on `/`. A route with no
  match renders `NotFoundPage`.
- `src/pages/*.jsx` are real components built from `src/components/`
  (`PageSection`, `PageHeading`, `Button`, `RequestForm`, `PostCard`,
  `ProjectCard`, `Breadcrumbs`, `Faq`, `TeamBand`, `Lightbox`). Shared page
  styles live in `src/styles/site.css`, imported from `src/main.jsx`; it
  replaces the old `public/assets/css/rebuild.css`.
- `HomePage.jsx` is the only page that renders captured markup
  (`src/content/home.js`, an array of section HTML strings) inside the
  `.elementor.elementor-837` wrapper that `elementor-post-837.css` is scoped to.
  Keep it that way: it is the reference page itself.
- Content lives in `src/content/`: `projects.js` (project cards + `findProject`),
  `project-details.js` (overview, facts, gallery, related services keyed by the
  project slug), `articles.js` (blog posts), `services.js` (footer service
  pages). No markup is parsed out of captured sections anymore.
- Behaviour lives in `src/lib/`: `header.js` (sticky header, mobile drawer,
  sub-menus — bound once from `Header`), `forms.js` (validation bound per route
  change, keeps the `.rb-form` / `data-rb-form` / `.rb-form-note` contract),
  `initSliders.js` + `applyLayoutVars.js` (theme `data-settings` grids and
  horizontal tracks). The contact/cooperation forms are still per-browser only —
  they have no submission endpoint.
- The site has no accounts: there is no `/login` route, no login page and no
  account markup in the captured header, so `/login` falls through to
  `NotFoundPage`. The header's consultation action (`.header-action-btn-wrap`,
  label + phone number + icon) is always visible — `styles/site.css` only keeps
  it on one line, it does not hide the text behind a hover.

## Admin panel and content

The site is editable at `/admin` (login, then a dashboard) and the backend is a
second compose service, `api`:

- `server/index.js` — the whole API on Node's built-in `http` module, no
  dependencies: `GET /api/content` (public), `POST /api/login`, `POST
  /api/logout`, `GET /api/session`, `GET|PUT /api/admin/content` (behind the
  session). The session is an HMAC-signed httpOnly cookie; the signing key is
  generated once into the data volume. Login reads `PANEL_USER` /
  `PANEL_PASSWORD` from the environment and falls back to `admin` / `1234` in
  the code, so a dashboard secret always wins.
  `PANEL_USER` / `PANEL_PASSWORD` come from the platform env file
  (`/run/base44/app.env`, wired as the last `env_file` entry of the `api`
  service); the fallback only applies while they are unset, so the default
  `admin` / `1234` stops working as soon as the secrets are delivered. Check
  delivery without printing values:
  `docker compose -f docker-compose.base44.yml exec -T api sh -c 'printenv PANEL_USER >/dev/null && echo present || echo missing'`.
  A change on the secrets dashboard recreates `api` by itself — never run
  `up`/`restart` for it; `POST /api/login` with `admin`/`1234` returning 401 is
  the end-to-end proof that the secrets are active.
- Two-factor authentication is a second layer on the same password login, never
  a replacement: `server/twofactor.js` is a dependency-free TOTP (RFC 6238,
  SHA1/6 digits/30s, one step of drift). `POST /api/login` still checks
  `PANEL_USER` / `PANEL_PASSWORD` and then returns `{ twoFactor: "setup" }`
  (never configured) or `{ twoFactor: "required" }` with a signed 10-minute
  `aratan_2fa` pending cookie — no session. Setup is `POST /api/2fa/setup/start`
  (secret + `otpauth://` URI, reused while pending), `/api/2fa/setup/verify`
  (enables 2FA and is the only response that ever carries the 10 backup codes)
  and `/api/2fa/setup/complete` (requires `{ saved: true }`, then the session).
  Later logins use `/api/2fa/verify`, which accepts a 6-digit TOTP or an unused
  backup code. State is `/data/security.json` in the `content` volume; backup
  codes are stored as HMAC-SHA256 hashes only and a used code is marked
  `usedAt`. Failed second-factor attempts are counted per IP per scope
  (`login`, `setup`, `reauth`): six in ten minutes then 429, plus a 300ms delay
  on every miss. `GET /api/admin/2fa` returns status and the remaining count —
  never the secret or a code; `POST /api/admin/2fa/backup-codes` and
  `/api/admin/2fa/reset` re-authenticate with password + current code so a
  stolen session cookie cannot re-seed the factor. The QR is rendered in the
  browser (`qrcode` in `package.json`, `src/admin/TwoFactor.jsx`); the server
  only sends the URI.
- `server/store.js` + `server/seed.js` — the content is one JSON document in the
  `content` volume (`/data/site.json`), written atomically. The first boot seeds
  it from the `src/content/*.js` modules, so the panel opens on the real site.
- The document has five keys: `settings` (hero, home services, team, about,
  contact, socials, header, footer, clients, faqs), `projects` (card fields plus
  a nested `details`), `services`, `articles`, `servicePages`.
- The front end still reads `src/content/*.js`; those modules export `let` and a
  `hydrate*` function, so the saved document replaces their static arrays before
  the first render. `src/lib/siteContent.js` fetches the document and
  `main.jsx` waits for it — a failed request leaves the static content in place,
  which is why the site must keep working without the API.
- `settings` is read directly from `src/content/site.js` by the components that
  render it (hero, team, FAQ, clients, about, contact). The captured header and
  footer markup cannot read data, so `src/lib/siteChrome.js` fills their editable
  spots by selector (menu labels, consultation action, footer contact/socials/
  licences). Only the first N menu/social items are mapped onto the markup — the
  panel cannot add or remove those nodes.
- `src/admin/` is the dashboard: `schema.js` declares every section (where its
  data lives and its fields), `fields.jsx` renders the forms (text, textarea,
  image, switch, `lines`, `pairs` for `[title, value]` rows, `json` for the
  article bodies and the service pages), `AdminApp.jsx` holds the session, the
  draft document and the per-section save. Saving sends only the section's
  top-level key, so two sections never overwrite each other.
- `styles/admin.css` is self-contained under `.adm-*`, and `App.jsx` renders
  `/admin` without the site header, footer or content offsets.

## Gotchas

- Vite only accepts the preview hostname because `vite.config.js` appends
  `.${BASE44_SANDBOX_HOST_DOMAIN}` to `allowedHosts` when
  `BASE44_PREVIEW_MODE === "1"`; unset keeps Vite's default behavior.
- `RouteReady` in `App.jsx` re-runs `applyLayoutVars`, `initSliders` and
  `initForms` after every route render. It must stay inside the `Suspense`
  boundary next to `AppRoutes`, otherwise lazy pages mount after those helpers
  already ran and their grids/forms stay dead.
- The header and footer render eagerly while every page is `React.lazy`, so the
  `.rb-loading` fallback has to keep `min-height: 100vh`. Shrinking it makes the
  footer sit under the header and flash at the top of the page while the page
  chunk loads (on refresh and on every route change).
- Header markup is captured HTML: edit menu behaviour in `src/lib/header.js`,
  not in JSX.
- The header hides on the way down and returns on the way up: `header.js` puts
  `header-hidden` on `<body>` past `HIDE_AFTER` (200px) and only while the
  scroll position grows, and `styles/site.css` slides the fixed header out with
  `translateY(-100%)`. Route changes clear the class from `App.jsx`, and the
  mobile drawer forces it off while open.
- Branding is ARATAN (`آراتان | ARATAN`). The logo lives in three files in
  `public/img/`: `aratan-logo.png` (dark ink, transparent background — for the
  light header/footer states), `aratan-logo-light.png` (white ink, transparent
  background — for the dark states) and `aratan-favicon.png` (the mark alone,
  square, used as the `index.html` favicon). Both header `<img>`s keep the
  theme's swap behaviour: the first (light) shows at rest on the dark homepage
  header, the second (dark) shows once `sticky-header-active` is set. Only the
  homepage has a dark header at rest, so `styles/site.css` forces the second
  logo on every other page and gives the first `.rb-section` a top padding (the
  fixed header would otherwise sit right on it). The `width`/`height`
  attributes on those `<img>`s must keep the 1766:840 ratio or the logo
  stretches. The email address (`info@aratan.ir`)
  and the social handles (`@aratan.studio`, Telegram + Instagram) are
  Aratan-branded placeholders — the owner still needs to swap in the real
  contact details.
- `public/img/` holds the downloaded media. The reference markup points some
  assets at theme-relative paths (`/luxina/wp-content/...`); rewrite those to
  the `/img/...` equivalent.
- `src/lib/smoothScroll.js` (initialised in `main.jsx`) is the Lenis engine
  (`lerp: 0.075`, `wheelMultiplier: 1.2` — soft, weighted glide — on one raf
  loop). It owns wheel input, touch momentum (`syncTouch`, finger drag 1:1,
  release glide eased with `syncTouchLerp: 0.075`), the PageUp/PageDown/Home/End
  keys and `#anchor` clicks via `lenis.scrollTo`, and scrolls the real window so
  the sticky header, carousels and the theme's own scroll state are untouched.
  Lenis runs on every device, even under `prefers-reduced-motion`, as explicitly
  requested by the owner. Do not add a media-query mount guard: the constructor
  also needs `respectReducedMotion: false` or Lenis forces instant scrolling.
  Other reduced-motion styles remain unchanged.
  `allowNestedScroll: true` is what keeps the horizontal project tracks on
  native swiping. Three gotchas: the theme ships
  `html { scroll-behavior: smooth }`, which restarts the browser's own
  animation on every frame write, so the module switches `html` to `auto` while
  active; `body.disable-scrolling` (drawer, lightbox) is mirrored with
  `lenis.stop()`/`start()` through a MutationObserver; and route changes call
  `resetSmoothScroll()` from `App.jsx` instead of `window.scrollTo(0, 0)`.
  Structural Lenis CSS lives in `src/styles/scroll.css`.
