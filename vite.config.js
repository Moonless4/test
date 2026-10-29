import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const sandboxHosts = [];
if (process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS) {
  sandboxHosts.push(process.env.__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS);
}
if (process.env.BASE44_PREVIEW_MODE === '1' && process.env.BASE44_SANDBOX_HOST_DOMAIN) {
  sandboxHosts.push(`.${process.env.BASE44_SANDBOX_HOST_DOMAIN}`);
}

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 3000,
    strictPort: true,
    watch: {
      usePolling: true,
      interval: 300,
      // Only the client bundle can trigger hot reloads; the auth API's own files
      // are not part of it, so their activity must never reload the page.
      ignored: ['**/server/**', '**/.base44/**'],
    },
    allowedHosts: ['localhost', ...sandboxHosts],
    // The admin auth API runs as its own compose service. Proxying keeps the
    // session cookie on the app's own origin (SameSite=Strict keeps working)
    // and leaves the browser talking only to port 3000.
    proxy: {
      '/api': {
        target: process.env.API_PROXY_TARGET || 'http://api:4000',
        changeOrigin: false,
        xfwd: true,
      },
    },
  },
});
