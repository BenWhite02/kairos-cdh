// File: src/types/theme.types.ts
// 🎨 KAIROS Theme System Type Definitions
// Complete type system for theme management and customization
// All styles kept in classes as per project requirements

// =============================================================================
// CORE THEME TYPES
// =============================================================================

/**
 * Color palette with all color shades
 */
export interface ColorPalette {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
  950: string
}

/**
 * Theme variables that can be customized
 */
export interface ThemeVariables {
  // Primary color palette
  'color-primary-50': string
  'color-primary-100': string
  'color-primary-200': string
  'color-primary-300': string
  'color-primary-400': string
  'color-primary-500': string
  'color-primary-600': string
  'color-primary-700': string
  'color-primary-800': string
  'color-primary-900': string
  
  // Secondary color palette
  'color-secondary-50': string
  'color-secondary-100': string
  'color-secondary-200': string
  'color-secondary-300': string
  'color-secondary-400': string
  'color-secondary-500': string
  'color-secondary-600': string
  'color-secondary-700': string
  'color-secondary-800': string
  'color-secondary-900': string
  
  // Accent color palette
  'color-accent-50': string
  'color-accent-100': string
  'color-accent-200': string
  'color-accent-300': string
  'color-accent-400': string
  'color-accent-500': string
  'color-accent-600': string
  'color-accent-700': string
  'color-accent-800': string
  'color-accent-900': string
  
  // Neutral gray palette
  'color-gray-50': string
  'color-gray-100': string
  'color-gray-200': string
  'color-gray-300': string
  'color-gray-400': string
  'color-gray-500': string
  'color-gray-600': string
  'color-gray-700': string
  'color-gray-800': string
  'color-gray-900': string
  
  // Semantic colors
  'color-success': string
  'color-warning': string
  'color-error': string
  'color-info': string
  
  // Background colors
  'color-background': string
  'color-surface': string
  'color-surface-elevated': string
  
  // Text colors
  'color-text-primary': string
  'color-text-secondary': string
  'color-text-tertiary': string
  'color-text-inverse': string
  
  // Border colors
  'color-border': string
  'color-border-subtle': string
  'color-border-strong': string
  
  // Typography
  'font-family-sans': string
  'font-family-mono': string
  'font-size-xs': string
  'font-size-sm': string
  'font-size-base': string
  'font-size-lg': string
  'font-size-xl': string
  'font-size-2xl': string
  'font-size-3xl': string
  'font-size-4xl': string
  'line-height-tight': string
  'line-height-normal': string
  'line-height-relaxed': string
  
  // Spacing
  'spacing-xs': string
  'spacing-sm': string
  'spacing-md': string
  'spacing-lg': string
  'spacing-xl': string
  'spacing-2xl': string
  
  // Border radius
  'border-radius-sm': string
  'border-radius-md': string
  'border-radius-lg': string
  'border-radius-xl': string
  'border-radius-2xl': string
  'border-radius-full': string
  
  // Shadows
  'shadow-sm': string
  'shadow-md': string
  'shadow-lg': string
  'shadow-xl': string
}

/**
 * Complete theme definition
 */
export interface Theme {
  id: string
  name: string
  description: string
  type: 'light' | 'dark' | 'system'
  isCustom: boolean
  isDefault: boolean
  variables: ThemeVariables
  author?: string
  version?: string
  tags?: string[]
  createdAt?: string
  updatedAt?: string
  previewImage?: string
}

/**
 * Theme preset for quick theme creation
 */
export interface ThemePreset {
  id: string
  name: string
  description: string
  primary: string // Color palette key
  secondary: string // Color palette key
  accent: string // Color palette key
  previewColors?: {
    primary: string
    secondary: string
    accent: string
  }
}

/**
 * Custom theme colors for theme creator
 */
export interface CustomThemeColors {
  primary: ColorPalette
  secondary: ColorPalette
  accent: ColorPalette
  success?: string
  warning?: string
  error?: string
  info?: string
}

// =============================================================================
// STATE MANAGEMENT TYPES
// =============================================================================

/**
 * Theme store state
 */
export interface ThemeState {
  // Current theme
  currentTheme: string
  
  // Available themes
  availableThemes: Theme[]
  customThemes: Theme[]
  
  // UI state
  isTransitioning: boolean
  isCreatorOpen: boolean
  previewTheme: string | null
  
  // System preferences
  systemThemePreference: 'light' | 'dark'
  respectSystemTheme: boolean
  
  // Settings
  enableCustomColors: boolean
  transitionDuration: number
  preloadThemes: boolean
  persistCustomThemes: boolean
  
  // Cache
  themeCache: Map<string, Theme>
  
  // Error state
  error: string | null
}

/**
 * Theme store actions
 */
export interface ThemeActions {
  // Core theme actions
  setTheme: (themeId: string) => Promise<void>
  previewTheme: (themeId: string | null) => Promise<void>
  toggleTheme: () => void
  
  // Custom theme management
  createCustomTheme: (theme: Omit<Theme, 'isCustom'>) => string
  updateCustomTheme: (themeId: string, updates: Partial<Theme>) => void
  deleteCustomTheme: (themeId: string) => void
  createThemeFromPreset: (preset: ThemePreset, type?: 'light' | 'dark', customName?: string) => string
  
  // System integration
  updateSystemThemePreference: (preference: 'light' | 'dark') => void
  setRespectSystemTheme: (respect: boolean) => void
  
  // Theme creator UI
  openThemeCreator: () => void
  closeThemeCreator: () => void
  
  // Cache management
  clearThemeCache: () => void
  preloadThemes: () => Promise<void>
  
  // Import/Export
  exportThemes: () => string
  importThemes: (themesJson: string) => { imported: number; errors?: string[] | null }
  
  // Error handling
  clearError: () => void
  
  // Utilities
  refreshThemes: () => void
}

// =============================================================================
// COMPONENT PROP TYPES
// =============================================================================

/**
 * Theme switcher component props
 */
export interface ThemeSwitcherProps {
  variant?: 'compact' | 'expanded' | 'dropdown'
  showCustomThemes?: boolean
  showThemeCreator?: boolean
  showImportExport?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
  disabled?: boolean
  onThemeChange?: (themeId: string) => void
}

/**
 * Theme creator component props
 */
export interface ThemeCreatorProps {
  isOpen: boolean
  onClose: () => void
  initialTheme?: Partial<Theme>
  onSave?: (theme: Theme) => void
  className?: string
}

/**
 * Theme preview component props
 */
export interface ThemePreviewProps {
  theme: Theme
  size?: 'sm' | 'md' | 'lg'
  showName?: boolean
  showColors?: boolean
  interactive?: boolean
  className?: string
  onClick?: (theme: Theme) => void
}

/**
 * Color picker component props
 */
export interface ColorPickerProps {
  color: string
  onChange: (color: string) => void
  label?: string
  disabled?: boolean
  presets?: string[]
  className?: string
}

/**
 * Color palette editor props
 */
export interface ColorPaletteEditorProps {
  palette: ColorPalette
  onChange: (palette: ColorPalette) => void
  label?: string
  disabled?: boolean
  className?: string
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Theme validation result
 */
export interface ThemeValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Theme export options
 */
export interface ThemeExportOptions {
  includeBuiltInThemes?: boolean
  includeCustomThemes?: boolean
  format?: 'json' | 'css' | 'scss'
  minify?: boolean
}

/**
 * Theme import result
 */
export interface ThemeImportResult {
  success: boolean
  imported: number
  skipped: number
  errors: string[]
  themes: Theme[]
}

/**
 * CSS variable definition
 */
export interface CSSVariable {
  name: string
  value: string
  category: string
  description?: string
}

/**
 * Theme builder configuration
 */
export interface ThemeBuilderConfig {
  enableColorGeneration: boolean
  enableContrastValidation: boolean
  enableAccessibilityChecks: boolean
  autoGenerateShades: boolean
  preserveUserColors: boolean
}

/**
 * Color contrast information
 */
export interface ColorContrast {
  ratio: number
  level: 'AA' | 'AAA' | 'fail'
  isAccessible: boolean
}

/**
 * Theme analytics data
 */
export interface ThemeAnalytics {
  usage: Record<string, number>
  popularColors: string[]
  creationStats: {
    total: number
    custom: number
    fromPresets: number
  }
  performance: {
    averageLoadTime: number
    cacheHitRate: number
  }
}

// =============================================================================
// API TYPES
// =============================================================================

/**
 * Theme API response
 */
export interface ThemeApiResponse<T = Theme> {
  data: T
  meta?: {
    version: string
    timestamp: string
    source: 'local' | 'server'
  }
}

/**
 * Theme list API response
 */
export interface ThemeListApiResponse {
  data: Theme[]
  pagination?: {
    page: number
    limit: number
    total: number
    hasNext: boolean
  }
  meta?: {
    version: string
    timestamp: string
    filters?: Record<string, any>
  }
}

/**
 * Theme creation request
 */
export interface CreateThemeRequest {
  name: string
  description?: string
  type: 'light' | 'dark'
  variables: Partial<ThemeVariables>
  tags?: string[]
  basedOn?: string // Base theme ID
}

/**
 * Theme update request
 */
export interface UpdateThemeRequest {
  name?: string
  description?: string
  variables?: Partial<ThemeVariables>
  tags?: string[]
}

// =============================================================================
// EVENT TYPES
// =============================================================================

/**
 * Theme change event
 */
export interface ThemeChangeEvent {
  type: 'theme-change'
  oldTheme: string
  newTheme: string
  timestamp: number
}

/**
 * Theme preview event
 */
export interface ThemePreviewEvent {
  type: 'theme-preview'
  theme: string | null
  timestamp: number
}

/**
 * Theme creation event
 */
export interface ThemeCreationEvent {
  type: 'theme-created'
  theme: Theme
  source: 'manual' | 'preset' | 'import'
  timestamp: number
}

/**
 * Theme error event
 */
export interface ThemeErrorEvent {
  type: 'theme-error'
  error: string
  context?: Record<string, any>
  timestamp: number
}

/**
 * Union type for all theme events
 */
export type ThemeEvent = 
  | ThemeChangeEvent 
  | ThemePreviewEvent 
  | ThemeCreationEvent
  | ThemeErrorEvent

// =============================================================================
// CONFIGURATION TYPES
// =============================================================================

/**
 * Theme system configuration
 */
export interface ThemeSystemConfig {
  // Storage settings
  storageKey: string
  customThemesStorageKey: string
  
  // Behavior settings
  defaultTheme: string
  respectSystemTheme: boolean
  enableCustomThemes: boolean
  enableThemeCreator: boolean
  
  // Performance settings
  transitionDuration: number
  preloadThemes: boolean
  cacheThemes: boolean
  cacheDuration: number
  
  // Feature flags
  enableColorGeneration: boolean
  enableContrastValidation: boolean
  enableAccessibilityChecks: boolean
  enableThemeImportExport: boolean
  
  // Limits
  maxCustomThemes: number
  maxCustomCssSize: number
  
  // API settings
  apiEndpoint?: string
  apiTimeout: number
}

/**
 * Theme environment variables
 */
export interface ThemeEnvironment {
  VITE_THEME_STORAGE_KEY: string
  VITE_THEME_CUSTOM_STORAGE_KEY: string
  VITE_THEME_TRANSITION_DURATION: string
  VITE_THEME_CACHE_DURATION: string
  VITE_THEME_API_ENDPOINT: string
  VITE_CUSTOM_CSS_MAX_SIZE: string
  VITE_THEME_PREVIEW_ENABLED: string
  VITE_DEFAULT_THEME: string
  VITE_SYSTEM_THEME_ENABLED: string
  VITE_CUSTOM_THEMES_ENABLED: string
  VITE_THEME_CREATOR_ENABLED: string
}