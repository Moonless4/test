# AGENTS.md

## Project

Single-page Persian (RTL) restaurant landing site for «رستوران نوال», built with Vite + React and
Tailwind CSS v4 (`@tailwindcss/vite`, no `tailwind.config.js` — theme tokens live in `src/index.css`
under `@theme`).

## Running locally (sandbox)

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

- `web` runs `npm install` then `vite` on container port 5173, published on host port **3000**.
- Source is bind-mounted at `/app`; `node_modules` lives in a named volume so host/container
  installs never collide. Dependency installs happen in the container start command.
- Vite file watching uses polling (`server.watch.usePolling`) because the repo arrives via a bind
  mount where inotify events are unreliable. Edits still hot-reload; if a change does not appear,
  restart the service.
- `vite.config.js` appends `.<BASE44_SANDBOX_HOST_DOMAIN>` to `allowedHosts` **only** when
  `BASE44_PREVIEW_MODE === "1"` (sandbox preview). With the flag unset the allowlist is unchanged.

## Verification

- `curl -sI http://localhost:3000/` should return 200 and the HTML should reference
  `/@vite/client` (proves the dev server is serving source, not a prebuilt bundle).
- There are no tests, linters or backend services; behaviour is UI-only (hero carousel, category
  filter, FAQ accordion, add-to-cart counter in local React state).
- Content lives in `src/data/site.js` — menu items, prices, testimonials, news, FAQ and contact
  details are all defined there.
- Food and chef imagery is loaded from Unsplash URLs; there are no local image assets. Offline
  previews will show blank image frames.

## Conventions

- Components are one file each in `src/components/`; shared design primitives are small
  (e.g. `SectionHeading`, `FoodCard`).
- RTL and Persian numerals throughout (`toLocaleString('fa-IR')` for prices).
