// File: src/config/theme.config.ts
// 🎨 Complete theme system configuration for Kairos Frontend
// Supports multiple theme presets, custom themes, and tenant-specific theming
// All styles kept in classes as per project requirements

export interface ThemeColors {
  // Primary palette
  primary: {
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
  
  // Secondary palette
  secondary: {
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
  
  // Accent palette
  accent: {
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
  
  // Semantic colors
  success: {
    50: string
    500: string
    700: string
  }
  
  warning: {
    50: string
    500: string
    700: string
  }
  
  error: {
    50: string
    500: string
    700: string
  }
  
  info: {
    50: string
    500: string
    700: string
  }
  
  // Neutral palette
  gray: {
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
}

export interface ThemeTypography {
  fontFamily: {
    sans: string[]
    mono: string[]
    serif: string[]
  }
  fontSize: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
    '6xl': string
  }
  fontWeight: {
    light: number
    normal: number
    medium: number
    semibold: number
    bold: number
    extrabold: number
  }
  lineHeight: {
    tight: number
    normal: number
    relaxed: number
    loose: number
  }
}

export interface ThemeSpacing {
  borderRadius: {
    none: string
    sm: string
    base: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    full: string
  }
  spacing: {
    px: string
    0: string
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
    8: string
    10: string
    12: string
    16: string
    20: string
    24: string
    32: string
    40: string
    48: string
    56: string
    64: string
  }
  shadows: {
    none: string
    sm: string
    base: string
    md: string
    lg: string
    xl: string
    '2xl': string
    inner: string
  }
}

export interface ThemeDefinition {
  id: string
  name: string
  description: string
  colors: ThemeColors
  typography: ThemeTypography
  spacing: ThemeSpacing
  isDark: boolean
  isCustom: boolean
  createdAt?: string
  updatedAt?: string
  tenantId?: string
}

export interface ThemeConfig {
  themes: Record<string, ThemeDefinition>
  defaultTheme: string
  enableCustomThemes: boolean
  enableTenantThemes: boolean
  themeStorageKey: string
  cssVariablePrefix: string
  transitionDuration: number
  cacheTimeout: number
}

// =============================================================================
// DEFAULT THEME DEFINITIONS
// =============================================================================

const defaultColors: ThemeColors = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a',
    950: '#172554'
  },
  secondary: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    400: '#4ade80',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    950: '#052e16'
  },
  accent: {
    50: '#fefce8',
    100: '#fef9c3',
    200: '#fef08a',
    300: '#fde047',
    400: '#facc15',
    500: '#eab308',
    600: '#ca8a04',
    700: '#a16207',
    800: '#854d0e',
    900: '#713f12',
    950: '#422006'
  },
  success: {
    50: '#f0fdf4',
    500: '#22c55e',
    700: '#15803d'
  },
  warning: {
    50: '#fefce8',
    500: '#eab308',
    700: '#a16207'
  },
  error: {
    50: '#fef2f2',
    500: '#ef4444',
    700: '#c53030'
  },
  info: {
    50: '#eff6ff',
    500: '#3b82f6',
    700: '#1d4ed8'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827',
    950: '#030712'
  }
}

const defaultTypography: ThemeTypography = {
  fontFamily: {
    sans: ['Inter', 'system-ui', 'sans-serif'],
    mono: ['JetBrains Mono', 'Monaco', 'Consolas', 'monospace'],
    serif: ['Georgia', 'Times New Roman', 'serif']
  },
  fontSize: {
    xs: '0.75rem',
    sm: '0.875rem',
    base: '1rem',
    lg: '1.125rem',
    xl: '1.25rem',
    '2xl': '1.5rem',
    '3xl': '1.875rem',
    '4xl': '2.25rem',
    '5xl': '3rem',
    '6xl': '3.75rem'
  },
  fontWeight: {
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800
  },
  lineHeight: {
    tight: 1.25,
    normal: 1.5,
    relaxed: 1.625,
    loose: 2
  }
}

const defaultSpacing: ThemeSpacing = {
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    base: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    8: '2rem',
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
    20: '5rem',
    24: '6rem',
    32: '8rem',
    40: '10rem',
    48: '12rem',
    56: '14rem',
    64: '16rem'
  },
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)'
  }
}

// =============================================================================
// THEME DEFINITIONS
// =============================================================================

const lightTheme: ThemeDefinition = {
  id: 'light',
  name: 'Light',
  description: 'Clean and bright theme for optimal readability',
  colors: defaultColors,
  typography: defaultTypography,
  spacing: defaultSpacing,
  isDark: false,
  isCustom: false
}

const darkTheme: ThemeDefinition = {
  id: 'dark',
  name: 'Dark',
  description: 'Dark theme for reduced eye strain',
  colors: {
    ...defaultColors,
    gray: {
      50: '#030712',
      100: '#111827',
      200: '#1f2937',
      300: '#374151',
      400: '#4b5563',
      500: '#6b7280',
      600: '#9ca3af',
      700: '#d1d5db',
      800: '#e5e7eb',
      900: '#f3f4f6',
      950: '#f9fafb'
    }
  },
  typography: defaultTypography,
  spacing: defaultSpacing,
  isDark: true,
  isCustom: false
}

const systemTheme: ThemeDefinition = {
  id: 'system',
  name: 'System',
  description: 'Automatically match your system preference',
  colors: defaultColors,
  typography: defaultTypography,
  spacing: defaultSpacing,
  isDark: false,
  isCustom: false
}

const oceanTheme: ThemeDefinition = {
  id: 'ocean',
  name: 'Ocean',
  description: 'Deep blue theme inspired by the ocean',
  colors: {
    ...defaultColors,
    primary: {
      50: '#ecfeff',
      100: '#cffafe',
      200: '#a5f3fc',
      300: '#67e8f9',
      400: '#22d3ee',
      500: '#06b6d4',
      600: '#0891b2',
      700: '#0e7490',
      800: '#155e75',
      900: '#164e63',
      950: '#083344'
    },
    secondary: {
      50: '#f0f9ff',
      100: '#e0f2fe',
      200: '#bae6fd',
      300: '#7dd3fc',
      400: '#38bdf8',
      500: '#0ea5e9',
      600: '#0284c7',
      700: '#0369a1',
      800: '#075985',
      900: '#0c4a6e',
      950: '#082f49'
    }
  },
  typography: defaultTypography,
  spacing: defaultSpacing,
  isDark: false,
  isCustom: false
}

const forestTheme: ThemeDefinition = {
  id: 'forest',
  name: 'Forest',
  description: 'Natural green theme inspired by forests',
  colors: {
    ...defaultColors,
    primary: {
      50: '#f0fdf4',
      100: '#dcfce7',
      200: '#bbf7d0',
      300: '#86efac',
      400: '#4ade80',
      500: '#22c55e',
      600: '#16a34a',
      700: '#15803d',
      800: '#166534',
      900: '#14532d',
      950: '#052e16'
    },
    secondary: {
      50: '#f7fee7',
      100: '#ecfccb',
      200: '#d9f99d',
      300: '#bef264',
      400: '#a3e635',
      500: '#84cc16',
      600: '#65a30d',
      700: '#4d7c0f',
      800: '#3f6212',
      900: '#365314',
      950: '#1a2e05'
    }
  },
  typography: defaultTypography,
  spacing: defaultSpacing,
  isDark: false,
  isCustom: false
}

// =============================================================================
// MAIN CONFIGURATION
// =============================================================================

export const themeConfig: ThemeConfig = {
  themes: {
    light: lightTheme,
    dark: darkTheme,
    system: systemTheme,
    ocean: oceanTheme,
    forest: forestTheme
  },
  defaultTheme: import.meta.env.VITE_DEFAULT_THEME || 'light',
  enableCustomThemes: import.meta.env.VITE_ENABLE_CUSTOM_THEMES !== 'false',
  enableTenantThemes: import.meta.env.VITE_ENABLE_TENANT_THEMES !== 'false',
  themeStorageKey: 'kairos-theme',
  cssVariablePrefix: '--kairos',
  transitionDuration: 200,
  cacheTimeout: parseInt(import.meta.env.VITE_THEME_CACHE_TTL || '3600000')
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const getTheme = (themeId: string): ThemeDefinition | null => {
  return themeConfig.themes[themeId] || null
}

export const getAllThemes = (): ThemeDefinition[] => {
  return Object.values(themeConfig.themes)
}

export const getThemeIds = (): string[] => {
  return Object.keys(themeConfig.themes)
}

export const isValidThemeId = (themeId: string): boolean => {
  return themeId in themeConfig.themes
}

export const getDefaultTheme = (): ThemeDefinition => {
  return themeConfig.themes[themeConfig.defaultTheme] || themeConfig.themes.light
}

export const isDarkTheme = (themeId: string): boolean => {
  const theme = getTheme(themeId)
  if (!theme) return false
  
  if (themeId === 'system') {
    return window.matchMedia('(prefers-color-scheme: dark)').matches
  }
  
  return theme.isDark
}

export default themeConfig