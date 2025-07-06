// File: src/config/environment.config.ts
// 🌍 Environment-based configuration management for Kairos Frontend
// Centralizes all environment variables and provides type-safe access
// Supports development, staging, and production environments

export interface ApiConfig {
  baseUrl: string
  graphqlUrl: string
  websocketUrl: string
  version: string
  timeout: number
  retryAttempts: number
  retryDelay: number
}

export interface ThemeConfig {
  defaultTheme: string
  enableCustomThemes: boolean
  enableTenantThemes: boolean
  cacheTimeout: number
  transitionDuration: number
  apiUrl: string
  assetsPath: string
}

export interface AuthConfig {
  tokenStorageKey: string
  refreshTokenStorageKey: string
  tokenExpiryBuffer: number
  enableRememberMe: boolean
  sessionTimeout: number
  maxLoginAttempts: number
  lockoutDuration: number
}

export interface AnalyticsConfig {
  enabled: boolean
  trackingId: string
  enableDeviceTracking: boolean
  enableLocationTracking: boolean
  enablePerformanceTracking: boolean
  sampleRate: number
  batchSize: number
  flushInterval: number
}

export interface FeatureFlags {
  enableThemeCreator: boolean
  enableAdvancedAnalytics: boolean
  enableExperiments: boolean
  enableRealTimeUpdates: boolean
  enableOfflineMode: boolean
  enableBetaFeatures: boolean
  enableDebugMode: boolean
}

export interface SecurityConfig {
  enableCSP: boolean
  enableHTTPS: boolean
  enableCORS: boolean
  allowedOrigins: string[]
  maxFileUploadSize: number
  allowedFileTypes: string[]
  enableXSSProtection: boolean
}

export interface CacheConfig {
  enableServiceWorker: boolean
  cacheStrategy: 'network-first' | 'cache-first' | 'stale-while-revalidate'
  maxCacheSize: number
  defaultTTL: number
  enableOfflineIndicator: boolean
}

export interface EnvironmentConfig {
  app: {
    name: string
    version: string
    environment: 'development' | 'staging' | 'production'
    buildTime: string
    commitHash: string
  }
  api: ApiConfig
  theme: ThemeConfig
  auth: AuthConfig
  analytics: AnalyticsConfig
  features: FeatureFlags
  security: SecurityConfig
  cache: CacheConfig
}

// =============================================================================
// ENVIRONMENT VARIABLE HELPERS
// =============================================================================

const getEnvVar = (key: string, defaultValue?: string): string => {
  return import.meta.env[key] || defaultValue || ''
}

const getEnvBool = (key: string, defaultValue: boolean = false): boolean => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  return value === 'true' || value === '1'
}

const getEnvNumber = (key: string, defaultValue: number = 0): number => {
  const value = import.meta.env[key]
  if (value === undefined) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

const getEnvArray = (key: string, defaultValue: string[] = []): string[] => {
  const value = import.meta.env[key]
  if (!value) return defaultValue
  return value.split(',').map(item => item.trim()).filter(Boolean)
}

// =============================================================================
// CONFIGURATION OBJECT
// =============================================================================

export const environmentConfig: EnvironmentConfig = {
  app: {
    name: getEnvVar('VITE_APP_NAME', 'Kairos'),
    version: getEnvVar('VITE_APP_VERSION', '1.0.0'),
    environment: (getEnvVar('VITE_NODE_ENV', 'development') as any),
    buildTime: getEnvVar('VITE_BUILD_TIME', new Date().toISOString()),
    commitHash: getEnvVar('VITE_COMMIT_HASH', 'unknown')
  },

  api: {
    baseUrl: getEnvVar('VITE_API_BASE_URL', 'http://localhost:8080'),
    graphqlUrl: getEnvVar('VITE_GRAPHQL_URL', 'http://localhost:8080/graphql'),
    websocketUrl: getEnvVar('VITE_GRAPHQL_WS_URL', 'ws://localhost:8080/graphql/websocket'),
    version: getEnvVar('VITE_API_VERSION', 'v1'),
    timeout: getEnvNumber('VITE_API_TIMEOUT', 30000),
    retryAttempts: getEnvNumber('VITE_API_RETRY_ATTEMPTS', 3),
    retryDelay: getEnvNumber('VITE_API_RETRY_DELAY', 1000)
  },

  theme: {
    defaultTheme: getEnvVar('VITE_DEFAULT_THEME', 'light'),
    enableCustomThemes: getEnvBool('VITE_ENABLE_CUSTOM_THEMES', true),
    enableTenantThemes: getEnvBool('VITE_ENABLE_TENANT_THEMES', true),
    cacheTimeout: getEnvNumber('VITE_THEME_CACHE_TTL', 3600000),
    transitionDuration: getEnvNumber('VITE_THEME_TRANSITION_DURATION', 200),
    apiUrl: getEnvVar('VITE_THEME_API_URL', 'http://localhost:8080/api/v1/themes'),
    assetsPath: getEnvVar('VITE_THEME_ASSETS_PATH', '/themes')
  },

  auth: {
    tokenStorageKey: getEnvVar('VITE_AUTH_TOKEN_KEY', 'kairos-auth-token'),
    refreshTokenStorageKey: getEnvVar('VITE_AUTH_REFRESH_TOKEN_KEY', 'kairos-refresh-token'),
    tokenExpiryBuffer: getEnvNumber('VITE_AUTH_TOKEN_EXPIRY_BUFFER', 300000), // 5 minutes
    enableRememberMe: getEnvBool('VITE_AUTH_ENABLE_REMEMBER_ME', true),
    sessionTimeout: getEnvNumber('VITE_AUTH_SESSION_TIMEOUT', 86400000), // 24 hours
    maxLoginAttempts: getEnvNumber('VITE_AUTH_MAX_LOGIN_ATTEMPTS', 5),
    lockoutDuration: getEnvNumber('VITE_AUTH_LOCKOUT_DURATION', 900000) // 15 minutes
  },

  analytics: {
    enabled: getEnvBool('VITE_ANALYTICS_ENABLED', false),
    trackingId: getEnvVar('VITE_ANALYTICS_TRACKING_ID'),
    enableDeviceTracking: getEnvBool('VITE_ANALYTICS_DEVICE_TRACKING', true),
    enableLocationTracking: getEnvBool('VITE_ANALYTICS_LOCATION_TRACKING', false),
    enablePerformanceTracking: getEnvBool('VITE_ANALYTICS_PERFORMANCE_TRACKING', true),
    sampleRate: getEnvNumber('VITE_ANALYTICS_SAMPLE_RATE', 100),
    batchSize: getEnvNumber('VITE_ANALYTICS_BATCH_SIZE', 10),
    flushInterval: getEnvNumber('VITE_ANALYTICS_FLUSH_INTERVAL', 30000)
  },

  features: {
    enableThemeCreator: getEnvBool('VITE_ENABLE_THEME_CREATOR', true),
    enableAdvancedAnalytics: getEnvBool('VITE_ENABLE_ADVANCED_ANALYTICS', false),
    enableExperiments: getEnvBool('VITE_ENABLE_EXPERIMENTS', false),
    enableRealTimeUpdates: getEnvBool('VITE_ENABLE_REALTIME_UPDATES', true),
    enableOfflineMode: getEnvBool('VITE_ENABLE_OFFLINE_MODE', false),
    enableBetaFeatures: getEnvBool('VITE_ENABLE_BETA_FEATURES', false),
    enableDebugMode: getEnvBool('VITE_ENABLE_DEBUG_MODE', false)
  },

  security: {
    enableCSP: getEnvBool('VITE_SECURITY_ENABLE_CSP', true),
    enableHTTPS: getEnvBool('VITE_SECURITY_ENABLE_HTTPS', false),
    enableCORS: getEnvBool('VITE_SECURITY_ENABLE_CORS', true),
    allowedOrigins: getEnvArray('VITE_SECURITY_ALLOWED_ORIGINS', ['http://localhost:3000']),
    maxFileUploadSize: getEnvNumber('VITE_SECURITY_MAX_FILE_SIZE', 10485760), // 10MB
    allowedFileTypes: getEnvArray('VITE_SECURITY_ALLOWED_FILE_TYPES', [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp',
      'application/pdf', 'text/csv', 'application/json'
    ]),
    enableXSSProtection: getEnvBool('VITE_SECURITY_ENABLE_XSS_PROTECTION', true)
  },

  cache: {
    enableServiceWorker: getEnvBool('VITE_CACHE_ENABLE_SERVICE_WORKER', false),
    cacheStrategy: (getEnvVar('VITE_CACHE_STRATEGY', 'network-first') as any),
    maxCacheSize: getEnvNumber('VITE_CACHE_MAX_SIZE', 52428800), // 50MB
    defaultTTL: getEnvNumber('VITE_CACHE_DEFAULT_TTL', 3600000), // 1 hour
    enableOfflineIndicator: getEnvBool('VITE_CACHE_ENABLE_OFFLINE_INDICATOR', true)
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const isDevelopment = (): boolean => {
  return environmentConfig.app.environment === 'development'
}

export const isProduction = (): boolean => {
  return environmentConfig.app.environment === 'production'
}

export const isStaging = (): boolean => {
  return environmentConfig.app.environment === 'staging'
}

export const getApiUrl = (endpoint: string = ''): string => {
  const baseUrl = environmentConfig.api.baseUrl
  const version = environmentConfig.api.version
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  if (cleanEndpoint) {
    return `${baseUrl}/api/${version}/${cleanEndpoint}`
  }
  
  return `${baseUrl}/api/${version}`
}

export const getThemeApiUrl = (endpoint: string = ''): string => {
  const baseUrl = environmentConfig.theme.apiUrl
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint
  
  return cleanEndpoint ? `${baseUrl}/${cleanEndpoint}` : baseUrl
}

export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return environmentConfig.features[feature]
}

export const getAppInfo = () => {
  return {
    name: environmentConfig.app.name,
    version: environmentConfig.app.version,
    environment: environmentConfig.app.environment,
    buildTime: environmentConfig.app.buildTime,
    commitHash: environmentConfig.app.commitHash
  }
}

// =============================================================================
// VALIDATION
// =============================================================================

export const validateConfig = (): { valid: boolean; errors: string[] } => {
  const errors: string[] = []

  // Validate required API URLs
  if (!environmentConfig.api.baseUrl) {
    errors.push('VITE_API_BASE_URL is required')
  }

  if (!environmentConfig.api.graphqlUrl) {
    errors.push('VITE_GRAPHQL_URL is required')
  }

  // Validate theme configuration
  if (!environmentConfig.theme.defaultTheme) {
    errors.push('VITE_DEFAULT_THEME is required')
  }

  // Validate analytics configuration if enabled
  if (environmentConfig.analytics.enabled && !environmentConfig.analytics.trackingId) {
    errors.push('VITE_ANALYTICS_TRACKING_ID is required when analytics is enabled')
  }

  // Validate cache strategy
  const validCacheStrategies = ['network-first', 'cache-first', 'stale-while-revalidate']
  if (!validCacheStrategies.includes(environmentConfig.cache.cacheStrategy)) {
    errors.push(`Invalid cache strategy: ${environmentConfig.cache.cacheStrategy}`)
  }

  return {
    valid: errors.length === 0,
    errors
  }
}

// =============================================================================
// DEBUG HELPERS
// =============================================================================

export const debugConfig = () => {
  if (isDevelopment() && environmentConfig.features.enableDebugMode) {
    console.group('🔧 Kairos Environment Configuration')
    console.log('Environment:', environmentConfig.app.environment)
    console.log('API Base URL:', environmentConfig.api.baseUrl)
    console.log('GraphQL URL:', environmentConfig.api.graphqlUrl)
    console.log('Default Theme:', environmentConfig.theme.defaultTheme)
    console.log('Features:', environmentConfig.features)
    console.groupEnd()
  }
}

// Initialize debug logging
if (isDevelopment()) {
  debugConfig()
}

export default environmentConfig