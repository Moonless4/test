import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Sandbox preview: the proxy forwards the sandbox hostname, which changes between
// environments, so allow the whole sandbox domain while preview mode is on.
const sandboxHost =
  process.env.BASE44_PREVIEW_MODE === '1' ? process.env.BASE44_SANDBOX_HOST_DOMAIN : undefined
const allowedHosts = sandboxHost ? [`.${sandboxHost}`] : []

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    allowedHosts,
    watch: { usePolling: true, interval: 300 },
  },
  preview: {
    host: '0.0.0.0',
    port: 5173,
    allowedHosts,
  },
})
