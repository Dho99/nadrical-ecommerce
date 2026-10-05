/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string
  readonly VITE_WEBSOCKET_URL?: string
  readonly VITE_WS_HOST?: string
  readonly VITE_WS_PORT?: string
  readonly VITE_USE_MOCK?: string
  readonly VITE_GOOGLE_CLIENT_ID?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
