/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** `sandbox` (default) keeps the stand-in bank page; `zarinpal` takes real money. */
  readonly VITE_PAYMENT_GATEWAY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
