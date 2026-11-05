/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Backend base URL including /api, e.g. http://localhost:5000/api */
  readonly VITE_API_URL: string;
  /** Paystack public key (pk_test_… / pk_live_…). Never the secret key. */
  readonly VITE_PAYSTACK_PUBLIC_KEY: string;
  /** Optional support address shown on help pages. */
  readonly VITE_SUPPORT_EMAIL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
