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
    // bind mounts inside Docker do not always emit filesystem events
    watch: { usePolling: true, interval: 400 },
  },
});
