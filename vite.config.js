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
    },
    allowedHosts: ['localhost', ...sandboxHosts],
  },
});
