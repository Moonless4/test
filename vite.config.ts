import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/*
 * The Laravel API lives inside this project's root (`backend/`). Vite's `server.fs.deny` is matched
 * against absolute paths, so the tree is named absolutely — a bare `backend/**` would never match
 * `/app/backend/…`, and a `**/backend/**` would also catch a `backend/` folder inside a package in
 * `node_modules`.
 */
const laravelRoot = fileURLToPath(new URL('./backend', import.meta.url));

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // The sandbox preview reaches the dev server through a proxy whose host
    // is environment-specific, so all hosts must be allowed.
    allowedHosts: true,
    // Two services sit behind /api, both so the browser keeps one origin (no CORS, no
    // cookie games): the Laravel API under /api/v1, and the payment service for the rest.
    // The order matters — Vite takes the first matching key.
    proxy: {
      // `changeOrigin` stays off: the Laravel app allowlists the preview's own Host
      // (TRUSTED_HOSTS in docker-compose.base44.yml), so rewriting it to the container
      // name would be answered with 400.
      '/api/v1': {
        target: process.env.BACKEND_API_ORIGIN ?? 'http://backend:8000',
        changeOrigin: false,
      },
      '/api': {
        target: process.env.PAYMENT_API_ORIGIN ?? 'http://api:8000',
        changeOrigin: true,
        // Forward the real client address (and the scheme) so the payment service can rate
        // limit per shopper instead of lumping every caller under the proxy's own IP.
        xfwd: true,
      },
    },
    watch: {
      // Bind mounts do not always emit inotify events — poll instead.
      usePolling: true,
      interval: 300,
    },
    fs: {
      /*
       * The dev server is publicly reachable through the preview proxy, and this project's root is
       * the whole repository — the Laravel API lives inside it at `backend/`. Serving the root
       * therefore published the API's log file (`backend/storage/logs/laravel.log`, which carries
       * shopper emails, addresses and user agents), its compiled Blade templates, its sources and
       * its `composer.json`. Vite's own defaults already deny `.env`; this adds the server-side
       * tree the SPA never imports.
       *
       * On a real host this does not apply — the SPA is served from the built `dist/` and the API
       * from its own document root — but the preview is a shared, public address.
       */
      deny: [
        '.env',
        '.env.*',
        '*.{crt,pem}',
        '**/.git/**',
        `${laravelRoot}/**`,
      ],
    },
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
  },
});
