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
  files are self-hosted copies; do not re-link the reference site.
- `src/content/` holds markup captured from the reference page: `header.html`,
  `footer.html` and `home.js` (an array of section HTML strings). Content for
  routes that the reference page did not expose as markup lives in
  `articles.js` (blog posts), `services.js` (footer service pages) and
  `projects.js` (the homepage-hero project, which is not in the projects grid).
- `src/pages/pages.js` maps every route to markup. Listing pages reuse the
  captured homepage sections, so section lookups go by widget name / data-id
  (`sectionWith`, `sectionById`) — never by array index, which shifts whenever
  a section is removed.
- There is no backend: form validation and the login/signup session live in
  `src/lib/initInteractions.js` and `src/lib/account.js` (localStorage only), so
  submissions and accounts exist per browser and are not persisted server-side.
- `src/App.jsx` concatenates header + sections + footer into one
  `dangerouslySetInnerHTML` fragment on purpose. The header tag opens
  `#container` and `#page-body`, and the section/footer markup closes them, so
  splitting the pieces into separately-rendered components breaks the original
  DOM nesting. Keep them in one fragment, or re-balance the wrappers first.
- `public/img/` holds the downloaded media. The reference markup points some
  assets at theme-relative paths (`/luxina/wp-content/...`); rewrite those to
  the `/img/...` equivalent.

## Gotchas

- Vite only accepts the preview hostname because `vite.config.js` appends
  `.${BASE44_SANDBOX_HOST_DOMAIN}` to `allowedHosts` when
  `BASE44_PREVIEW_MODE === "1"`; unset keeps Vite's default behavior.
- The reference page's own theme JS (Swiper init, sticky header, dropdowns,
  mobile drawer) is not wired up yet, so slider rows can overflow their
  container horizontally.
