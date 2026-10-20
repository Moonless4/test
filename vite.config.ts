import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

/**
 * تنظیمات سندباکس Base44 (پیش‌نمایش).
 *
 * میزبان عمومی پیش‌نمایش یک پروکسی است: مرورگر `Origin: https://3000-<suffix>` می‌فرستد
 * و سرور `Host: <port>-<sandbox id>.<sandbox host domain>` را دریافت می‌کند.
 * پس allowlist ویت باید دامنه‌ی چرخشی سندباکس را پوشش دهد.
 * `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS` را خود پلتفرم ست می‌کند و ویت آن را اضافه می‌کند؛
 * لیست زیر لایه‌ی اطمینان دوم است. هر دو فقط وقتی BASE44_PREVIEW_MODE === '1' باشد اعمال
 * می‌شوند تا رفتار عادی/توسعه‌ی محلی دست‌نخورده بماند.
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
    // bind mount در سندباکس همیشه رویداد inotify را عبور نمی‌دهد.
    watch: previewMode ? { usePolling: true, interval: 400 } : undefined,
  },
  preview: {
    host: true,
    port: 3000,
    strictPort: true,
    allowedHosts,
  },
});
