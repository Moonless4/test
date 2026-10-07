import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    // The sandbox preview reaches the dev server through a proxy whose host
    // is environment-specific, so all hosts must be allowed.
    allowedHosts: true,
    // The payment service runs beside the dev server; keeping it behind /api gives the
    // app, the Zarinpal callback and the session one origin — no CORS, no cookie games.
    proxy: {
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
  },
  build: {
    target: 'es2020',
    cssCodeSplit: true,
  },
});
