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

The site is editable at `/admin` and the backend is a second compose service,
`api`:

- `server/index.js` — the API on Node's built-in `http` module, no
  dependencies. Public: `GET /api/content`, `GET /api/media/<file>`, `POST
  /api/messages`. Behind the session: `POST /api/login`, `/api/logout`, `GET
  /api/session`, `GET|PUT /api/admin/content`, the 2FA endpoints, the message
  inbox and the media library. The session is an HMAC-signed httpOnly cookie;
  the signing key is generated once into the data volume. Login still reads
  `PANEL_USER` / `PANEL_PASSWORD` from the environment (the `admin`/`1234`
  fallback applies only while they are unset), so dashboard secrets always win
  and the credentials themselves did not change.
- The password is never stored as text. `server/password.js` hashes it with
  salted scrypt (N=32768, r=8, p=1, 64-byte key) and
  `/data/admin-credentials.json` holds only the username and
  `{ algorithm, salt, hash, N, r, p, keylen }`. `ensureCredentials()` hashes the
  environment password on first boot and re-hashes only when it changes. The
  password is never returned by an endpoint, logged, or written into the content
  document. Verify by checking the file's `password.hash` field exists (never
  print the value) and that a wrong password returns 401.
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
  never the secret or a code; `POST /api/admin/2fa/backup-codes` re-authenticates
  with password + current code so a stolen session cookie cannot re-seed the
  factor. The QR is rendered in the browser (`qrcode` in `package.json`,
  `src/admin/TwoFactor.jsx`); the server only sends the URI.
- 2FA is permanent once configured. There is **no** `/api/admin/2fa/reset`
  endpoint and no disable, skip or "turn off" control in the panel. The only
  security operation is regenerating backup codes; `GET /api/admin/2fa` reports
  `permanent: true`.
- `server/store.js` + `server/seed.js` — the content is one JSON document in the
  `content` volume (`/data/site.json`), written atomically. The first boot seeds
  it from the `src/content/*.js` modules. On read, a saved document is merged
  over a fresh seed (arrays of objects item by item) so keys added later appear
  with their defaults while every saved value wins.
- The document has `settings` plus `projects`, `services`, `articles` and the
  nested `servicePages`. `settings` now also carries `general`, `seo`,
  `homeSections` (home band order + visibility), `homeHeadings`, `timeline`,
  `promo`, `faqBlock` and `pages` (copy and SEO for the static pages), and the
  header `menu` (items, submenus, `enabled`, `icon`) and footer link columns.
- Inbox and library: `/data/messages.json` (public form submissions, unread
  flag), `/data/media.json` plus `/data/media/<file>` (uploaded images served
  from `GET /api/media/<file>`). Both are separate from the content document and
  never require a rebuild.
- Front end wiring: `homeSections` drives `HomePage`; `settings.pages.*` drives
  the about, contact, projects, blog, consultation and cooperation pages;
  `settings.seo` + per-page SEO feed `PageMeta`; `projects[].seoTitle|visible`,
  `articles[].published` and `services[].visible` control listings; the request
  forms POST to `/api/messages`. The captured header/footer markup is filled
  dynamically by `src/lib/siteChrome.js` — the header menu (items, submenus,
  order, visibility) and footer link columns are rebuilt from the document, so
  edit them in the panel, not in `header.html`/`footer.html`. `Header.jsx` calls
  `applyHeaderChrome()` before `initHeader()` so the behaviour layer binds the
  final anchors.
- `src/admin/` — `schema.js` declares `PAGES`, `COLLECTIONS`, `SECTION_ENTRIES`
  and the grouped `NAV`; `AdminApp.jsx` holds the session, draft document, dirty
  state, save and unsaved-changes guard; `fields.jsx` renders every field type
  (text, textarea, image + media picker, switch, lists, pairs, article blocks,
  menu, order); `CollectionEditor.jsx` is the master–detail project/service/
  article editor; `PageEditors.jsx` is the tabbed page and section editor;
  `DeepEditor.jsx` is a label-driven editor for the nested service pages;
  `Dashboard.jsx`, `PagesList.jsx`, `MessagesPanel.jsx` and `MediaLibrary.jsx`
  cover the remaining views. Saving sends only the current entry's top-level
  key. An entry's `view` (`page`, `collection`, `section`, `deep`) decides which
  editor renders — ids must stay unique across the three lists.
- `styles/admin.css` is a self-contained `.adm-*` design system (warm paper,
  charcoal ink, hairlines, one bronze accent) and `App.jsx` renders `/admin`
  without the site header, footer or content offsets.

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
