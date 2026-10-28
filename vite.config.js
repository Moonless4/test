import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In the Base44 sandbox the preview is proxied: the sandbox host name carries
// a rotating sandbox id, so the allowlist needs the wildcard domain, not a
// fixed host. Outside the sandbox (flag unset) Vite keeps its default.
const previewMode = process.env.BASE44_PREVIEW_MODE === '1';
const allowedHosts = previewMode
  ? [
      process.env.BASE44_SANDBOX_HOST_DOMAIN && `.${process.env.BASE44_SANDBOX_HOST_DOMAIN}`,
      process.env.BASE44_PUBLIC_HOST_SUFFIX && `3000-${process.env.BASE44_PUBLIC_HOST_SUFFIX}`,
    ].filter(Boolean)
  : undefined;

export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts,
    // The content API runs as its own compose service. Proxying it here keeps
    // the browser on one origin, so the admin session cookie stays same-site.
    proxy: {
      '/api': {
        target: process.env.CONTENT_API_URL || 'http://localhost:4000',
        changeOrigin: false,
      },
    },
    // bind mounts inside Docker do not always emit filesystem events
    watch: { usePolling: true, interval: 400 },
  },
});
