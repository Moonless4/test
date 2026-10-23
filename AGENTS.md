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
  horizontal tracks). There is no backend: submissions exist per browser only.
- The site has no accounts: there is no `/login` route, no login page and no
  account markup in the captured header, so `/login` falls through to
  `NotFoundPage`. The header's consultation action (`.header-action-btn-wrap`,
  label + phone number + icon) is always visible — `styles/site.css` only keeps
  it on one line, it does not hide the text behind a hover.

## Gotchas

- Vite only accepts the preview hostname because `vite.config.js` appends
  `.${BASE44_SANDBOX_HOST_DOMAIN}` to `allowedHosts` when
  `BASE44_PREVIEW_MODE === "1"`; unset keeps Vite's default behavior.
- `RouteReady` in `App.jsx` re-runs `applyLayoutVars`, `initSliders` and
  `initForms` after every route render. It must stay inside the `Suspense`
  boundary next to `AppRoutes`, otherwise lazy pages mount after those helpers
  already ran and their grids/forms stay dead.
- Header markup is captured HTML: edit menu behaviour in `src/lib/header.js`,
  not in JSX.
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
  (`lerp: 0.06`, `wheelMultiplier: 1.2` — heavy, drawn-out inertia — on one raf
  loop). It owns wheel input, touch momentum (`syncTouch`, finger drag 1:1,
  release glide eased with `syncTouchLerp: 0.06`), the PageUp/PageDown/Home/End
  keys and `#anchor` clicks via `lenis.scrollTo`, and scrolls the real window so
  the sticky header, carousels and the theme's own scroll state are untouched.
  Lenis runs on every device; it is not created only under
  `prefers-reduced-motion` (which also forces `lerp: 1` inside Lenis itself).
  `allowNestedScroll: true` is what keeps the horizontal project tracks on
  native swiping. Three gotchas: the theme ships
  `html { scroll-behavior: smooth }`, which restarts the browser's own
  animation on every frame write, so the module switches `html` to `auto` while
  active; `body.disable-scrolling` (drawer, lightbox) is mirrored with
  `lenis.stop()`/`start()` through a MutationObserver; and route changes call
  `resetSmoothScroll()` from `App.jsx` instead of `window.scrollTo(0, 0)`.
  Structural Lenis CSS lives in `src/styles/scroll.css`.
