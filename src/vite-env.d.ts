/// <reference types="vite/client" />

interface ImportMetaEnv {
  // App Settings
  readonly VITE_APP_NAME: string
  readonly VITE_APP_VERSION: string
  readonly VITE_APP_DESCRIPTION: string
  readonly VITE_NODE_ENV: string

  // API Configuration
  readonly VITE_API_BASE_URL: string
  readonly VITE_API_TIMEOUT: string
  readonly VITE_API_RETRY_ATTEMPTS: string
  readonly VITE_WS_URL: string
  readonly VITE_WS_RECONNECT_INTERVAL: string

  // Theme System
  readonly VITE_THEME_STORAGE_KEY: string
  readonly VITE_THEME_CUSTOM_STORAGE_KEY: string
  readonly VITE_THEME_TRANSITION_DURATION: string
  readonly VITE_THEME_CACHE_DURATION: string
  readonly VITE_DEFAULT_THEME: string
  readonly VITE_SYSTEM_THEME_ENABLED: string
  readonly VITE_CUSTOM_THEMES_ENABLED: string
  readonly VITE_THEME_CREATOR_ENABLED: string

  // Feature Flags
  readonly VITE_FEATURE_STORYBOOK: string
  readonly VITE_FEATURE_DEV_TOOLS: string
  readonly VITE_DEBUG_ENABLED: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
