/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string
  readonly VITE_RPC_URL: string
  readonly VITE_WALLETCONNECT_PROJECT_ID: string
  readonly VITE_CARBON_CREDIT_CONTRACT_ADDRESS: string
  readonly VITE_SENTRY_DSN: string
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
