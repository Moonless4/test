import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * Sandbox (Base44 preview) adjustments.
 *
 * The public preview host is a proxy: the browser sends `Origin: https://3000-<suffix>`
 * and the server receives `Host: <port>-<sandbox id>.<sandbox host domain>`.
 * Vite's host allowlist must therefore cover the rotating sandbox domain.
 * `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` (set by the platform) is appended by Vite;
 * the config-level list below is a second, explicit safety net. Both are only applied
 * when BASE44_PREVIEW_MODE === '1', so shared/dev behaviour stays default.
 */
const previewMode = process.env.BASE44_PREVIEW_MODE === '1';
const sandboxHostDomain = process.env.BASE44_SANDBOX_HOST_DOMAIN;
const allowedHosts =
  previewMode && sandboxHostDomain ? [`.${sandboxHostDomain}`] : undefined;

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts,
    // Bind mounts inside the sandbox do not always forward inotify events.
    watch: previewMode ? { usePolling: true, interval: 400 } : undefined,
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts,
  },
});
