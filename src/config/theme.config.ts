// File: src/config/theme.config.ts
// 🎨 KAIROS Theme Configuration System
// Centralized theme management with CSS-in-classes approach
// Supports multiple themes, custom themes, and theme switching

import { Theme, ThemeVariables, ColorPalette, ThemePreset } from '@/types/theme.types'

// =============================================================================
// THEME CONSTANTS
// =============================================================================

export const THEME_STORAGE_KEY = import.meta.env.VITE_THEME_STORAGE_KEY || 'kairos_selected_theme'
export const CUSTOM_THEMES_STORAGE_KEY = import.meta.env.VITE_THEME_CUSTOM_STORAGE_KEY || 'kairos_custom_themes'
export const THEME_TRANSITION_DURATION = parseInt(import.meta.env.VITE_THEME_TRANSITION_DURATION) || 200

// =============================================================================
// COLOR PALETTES
// =============================================================================

export const colorPalettes: Record<string, ColorPalette> = {
  // Classic Blue Palette
  blue: {
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

  // Modern Purple Palette
  purple: {
    50: '#faf5ff',
    100: '#f3e8ff',
    200: '#e9d5ff',
    300: '#d8b4fe',
    400: '#c084fc',
    500: '#a855f7',
    600: '#9333ea',
    700: '#7c3aed',
    800: '#6b21a8',
    900: '#581c87',
    950: '#3b0764'
  },

  // Vibrant Green Palette
  green: {
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

  // Warm Orange Palette
  orange: {
    50: '#fff7ed',
    100: '#ffedd5',
    200: '#fed7aa',
    300: '#fdba74',
    400: '#fb923c',
    500: '#f97316',
    600: '#ea580c',
    700: '#c2410c',
    800: '#9a3412',
    900: '#7c2d12',
    950: '#431407'
  },

  // Professional Gray Palette
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
  },

  // Elegant Rose Palette
  rose: {
    50: '#fff1f2',
    100: '#ffe4e6',
    200: '#fecdd3',
    300: '#fda4af',
    400: '#fb7185',
    500: '#f43f5e',
    600: '#e11d48',
    700: '#be123c',
    800: '#9f1239',
    900: '#881337',
    950: '#4c0519'
  }
}

// =============================================================================
// BUILT-IN THEMES
// =============================================================================

export const builtInThemes: Record<string, Theme> = {
  // Light Theme - Clean and Professional
  light: {
    id: 'light',
    name: 'Light',
    description: 'Clean and professional light theme',
    type: 'light',
    isCustom: false,
    isDefault: true,
    variables: {
      // Primary Colors (Blue)
      'color-primary-50': colorPalettes.blue[50],
      'color-primary-100': colorPalettes.blue[100],
      'color-primary-200': colorPalettes.blue[200],
      'color-primary-300': colorPalettes.blue[300],
      'color-primary-400': colorPalettes.blue[400],
      'color-primary-500': colorPalettes.blue[500],
      'color-primary-600': colorPalettes.blue[600],
      'color-primary-700': colorPalettes.blue[700],
      'color-primary-800': colorPalettes.blue[800],
      'color-primary-900': colorPalettes.blue[900],
      
      // Secondary Colors (Gray)
      'color-secondary-50': colorPalettes.gray[50],
      'color-secondary-100': colorPalettes.gray[100],
      'color-secondary-200': colorPalettes.gray[200],
      'color-secondary-300': colorPalettes.gray[300],
      'color-secondary-400': colorPalettes.gray[400],
      'color-secondary-500': colorPalettes.gray[500],
      'color-secondary-600': colorPalettes.gray[600],
      'color-secondary-700': colorPalettes.gray[700],
      'color-secondary-800': colorPalettes.gray[800],
      'color-secondary-900': colorPalettes.gray[900],
      
      // Accent Colors (Purple)
      'color-accent-50': colorPalettes.purple[50],
      'color-accent-100': colorPalettes.purple[100],
      'color-accent-200': colorPalettes.purple[200],
      'color-accent-300': colorPalettes.purple[300],
      'color-accent-400': colorPalettes.purple[400],
      'color-accent-500': colorPalettes.purple[500],
      'color-accent-600': colorPalettes.purple[600],
      'color-accent-700': colorPalettes.purple[700],
      'color-accent-800': colorPalettes.purple[800],
      'color-accent-900': colorPalettes.purple[900],
      
      // Neutral Gray Scale
      'color-gray-50': colorPalettes.gray[50],
      'color-gray-100': colorPalettes.gray[100],
      'color-gray-200': colorPalettes.gray[200],
      'color-gray-300': colorPalettes.gray[300],
      'color-gray-400': colorPalettes.gray[400],
      'color-gray-500': colorPalettes.gray[500],
      'color-gray-600': colorPalettes.gray[600],
      'color-gray-700': colorPalettes.gray[700],
      'color-gray-800': colorPalettes.gray[800],
      'color-gray-900': colorPalettes.gray[900],
      
      // Semantic Colors
      'color-success': colorPalettes.green[500],
      'color-warning': colorPalettes.orange[500],
      'color-error': colorPalettes.rose[500],
      'color-info': colorPalettes.blue[500],
      
      // Background Colors
      'color-background': '#ffffff',
      'color-surface': colorPalettes.gray[50],
      'color-surface-elevated': '#ffffff',
      
      // Text Colors
      'color-text-primary': colorPalettes.gray[900],
      'color-text-secondary': colorPalettes.gray[600],
      'color-text-tertiary': colorPalettes.gray[400],
      'color-text-inverse': '#ffffff',
      
      // Border Colors
      'color-border': colorPalettes.gray[200],
      'color-border-subtle': colorPalettes.gray[100],
      'color-border-strong': colorPalettes.gray[300],
      
      // Typography
      'font-family-sans': '"Inter", ui-sans-serif, system-ui, sans-serif',
      'font-family-mono': '"JetBrains Mono", ui-monospace, monospace',
      'font-size-xs': '0.75rem',
      'font-size-sm': '0.875rem',
      'font-size-base': '1rem',
      'font-size-lg': '1.125rem',
      'font-size-xl': '1.25rem',
      'font-size-2xl': '1.5rem',
      'font-size-3xl': '1.875rem',
      'font-size-4xl': '2.25rem',
      'line-height-tight': '1.25',
      'line-height-normal': '1.5',
      'line-height-relaxed': '1.75',
      
      // Spacing
      'spacing-xs': '0.25rem',
      'spacing-sm': '0.5rem',
      'spacing-md': '1rem',
      'spacing-lg': '1.5rem',
      'spacing-xl': '2rem',
      'spacing-2xl': '3rem',
      
      // Border Radius
      'border-radius-sm': '0.25rem',
      'border-radius-md': '0.375rem',
      'border-radius-lg': '0.5rem',
      'border-radius-xl': '0.75rem',
      'border-radius-2xl': '1rem',
      'border-radius-full': '9999px',
      
      // Shadows
      'shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
      'shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
      'shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      'shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)'
    }
  },

  // Dark Theme - Modern and Sleek
  dark: {
    id: 'dark',
    name: 'Dark',
    description: 'Modern and sleek dark theme',
    type: 'dark',
    isCustom: false,
    isDefault: false,
    variables: {
      // Primary Colors (Blue - adjusted for dark mode)
      'color-primary-50': colorPalettes.blue[950],
      'color-primary-100': colorPalettes.blue[900],
      'color-primary-200': colorPalettes.blue[800],
      'color-primary-300': colorPalettes.blue[700],
      'color-primary-400': colorPalettes.blue[600],
      'color-primary-500': colorPalettes.blue[500],
      'color-primary-600': colorPalettes.blue[400],
      'color-primary-700': colorPalettes.blue[300],
      'color-primary-800': colorPalettes.blue[200],
      'color-primary-900': colorPalettes.blue[100],
      
      // Secondary Colors (Gray - dark variants)
      'color-secondary-50': colorPalettes.gray[900],
      'color-secondary-100': colorPalettes.gray[800],
      'color-secondary-200': colorPalettes.gray[700],
      'color-secondary-300': colorPalettes.gray[600],
      'color-secondary-400': colorPalettes.gray[500],
      'color-secondary-500': colorPalettes.gray[400],
      'color-secondary-600': colorPalettes.gray[300],
      'color-secondary-700': colorPalettes.gray[200],
      'color-secondary-800': colorPalettes.gray[100],
      'color-secondary-900': colorPalettes.gray[50],
      
      // Accent Colors (Purple - adjusted)
      'color-accent-50': colorPalettes.purple[950],
      'color-accent-100': colorPalettes.purple[900],
      'color-accent-200': colorPalettes.purple[800],
      'color-accent-300': colorPalettes.purple[700],
      'color-accent-400': colorPalettes.purple[600],
      'color-accent-500': colorPalettes.purple[500],
      'color-accent-600': colorPalettes.purple[400],
      'color-accent-700': colorPalettes.purple[300],
      'color-accent-800': colorPalettes.purple[200],
      'color-accent-900': colorPalettes.purple[100],
      
      // Neutral Gray Scale (dark)
      'color-gray-50': '#0f172a',
      'color-gray-100': '#1e293b',
      'color-gray-200': '#334155',
      'color-gray-300': '#475569',
      'color-gray-400': '#64748b',
      'color-gray-500': '#94a3b8',
      'color-gray-600': '#cbd5e1',
      'color-gray-700': '#e2e8f0',
      'color-gray-800': '#f1f5f9',
      'color-gray-900': '#f8fafc',
      
      // Semantic Colors (dark optimized)
      'color-success': colorPalettes.green[400],
      'color-warning': colorPalettes.orange[400],
      'color-error': colorPalettes.rose[400],
      'color-info': colorPalettes.blue[400],
      
      // Background Colors (dark)
      'color-background': '#0f172a',
      'color-surface': '#1e293b',
      'color-surface-elevated': '#334155',
      
      // Text Colors (dark)
      'color-text-primary': '#f8fafc',
      'color-text-secondary': '#cbd5e1',
      'color-text-tertiary': '#94a3b8',
      'color-text-inverse': '#0f172a',
      
      // Border Colors (dark)
      'color-border': '#475569',
      'color-border-subtle': '#334155',
      'color-border-strong': '#64748b',
      
      // Typography (same as light)
      'font-family-sans': '"Inter", ui-sans-serif, system-ui, sans-serif',
      'font-family-mono': '"JetBrains Mono", ui-monospace, monospace',
      'font-size-xs': '0.75rem',
      'font-size-sm': '0.875rem',
      'font-size-base': '1rem',
      'font-size-lg': '1.125rem',
      'font-size-xl': '1.25rem',
      'font-size-2xl': '1.5rem',
      'font-size-3xl': '1.875rem',
      'font-size-4xl': '2.25rem',
      'line-height-tight': '1.25',
      'line-height-normal': '1.5',
      'line-height-relaxed': '1.75',
      
      // Spacing (same as light)
      'spacing-xs': '0.25rem',
      'spacing-sm': '0.5rem',
      'spacing-md': '1rem',
      'spacing-lg': '1.5rem',
      'spacing-xl': '2rem',
      'spacing-2xl': '3rem',
      
      // Border Radius (same as light)
      'border-radius-sm': '0.25rem',
      'border-radius-md': '0.375rem',
      'border-radius-lg': '0.5rem',
      'border-radius-xl': '0.75rem',
      'border-radius-2xl': '1rem',
      'border-radius-full': '9999px',
      
      // Shadows (dark optimized)
      'shadow-sm': '0 1px 2px 0 rgb(0 0 0 / 0.25)',
      'shadow-md': '0 4px 6px -1px rgb(0 0 0 / 0.4), 0 2px 4px -2px rgb(0 0 0 / 0.25)',
      'shadow-lg': '0 10px 15px -3px rgb(0 0 0 / 0.4), 0 4px 6px -4px rgb(0 0 0 / 0.25)',
      'shadow-xl': '0 20px 25px -5px rgb(0 0 0 / 0.4), 0 8px 10px -6px rgb(0 0 0 / 0.25)'
    }
  },

  // System Theme - Follows OS preference
  system: {
    id: 'system',
    name: 'System',
    description: 'Follows your system preference',
    type: 'system',
    isCustom: false,
    isDefault: false,
    variables: {} // Will use light or dark variables based on system preference
  }
}

// =============================================================================
// THEME PRESETS FOR QUICK CREATION
// =============================================================================

export const themePresets: ThemePreset[] = [
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional blue theme for corporate use',
    primary: 'blue',
    secondary: 'gray',
    accent: 'purple'
  },
  {
    id: 'nature-green',
    name: 'Nature Green',
    description: 'Fresh green theme inspired by nature',
    primary: 'green',
    secondary: 'gray',
    accent: 'blue'
  },
  {
    id: 'sunset-orange',
    name: 'Sunset Orange',
    description: 'Warm orange theme for creative projects',
    primary: 'orange',
    secondary: 'gray',
    accent: 'rose'
  },
  {
    id: 'royal-purple',
    name: 'Royal Purple',
    description: 'Elegant purple theme for premium feel',
    primary: 'purple',
    secondary: 'gray',
    accent: 'blue'
  },
  {
    id: 'romantic-rose',
    name: 'Romantic Rose',
    description: 'Soft rose theme for elegant designs',
    primary: 'rose',
    secondary: 'gray',
    accent: 'purple'
  }
]

// =============================================================================
// THEME UTILITY FUNCTIONS
// =============================================================================

/**
 * Get all available themes (built-in + custom)
 */
export function getAllThemes(): Theme[] {
  const customThemes = getCustomThemes()
  return [...Object.values(builtInThemes), ...customThemes]
}

/**
 * Get a specific theme by ID
 */
export function getTheme(themeId: string): Theme | undefined {
  // Check built-in themes first
  if (builtInThemes[themeId]) {
    return builtInThemes[themeId]
  }
  
  // Check custom themes
  const customThemes = getCustomThemes()
  return customThemes.find(theme => theme.id === themeId)
}

/**
 * Get custom themes from localStorage
 */
export function getCustomThemes(): Theme[] {
  try {
    const stored = localStorage.getItem(CUSTOM_THEMES_STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.warn('Failed to load custom themes:', error)
    return []
  }
}

/**
 * Save custom themes to localStorage
 */
export function saveCustomThemes(themes: Theme[]): void {
  try {
    localStorage.setItem(CUSTOM_THEMES_STORAGE_KEY, JSON.stringify(themes))
  } catch (error) {
    console.error('Failed to save custom themes:', error)
  }
}

/**
 * Create a new theme from a preset
 */
export function createThemeFromPreset(
  preset: ThemePreset,
  type: 'light' | 'dark' = 'light',
  customName?: string
): Theme {
  const baseTheme = builtInThemes[type]
  const primaryPalette = colorPalettes[preset.primary]
  const secondaryPalette = colorPalettes[preset.secondary]
  const accentPalette = colorPalettes[preset.accent]
  
  const newTheme: Theme = {
    id: `${preset.id}-${type}-${Date.now()}`,
    name: customName || `${preset.name} (${type === 'light' ? 'Light' : 'Dark'})`,
    description: `Custom ${preset.description.toLowerCase()}`,
    type,
    isCustom: true,
    isDefault: false,
    variables: {
      ...baseTheme.variables,
      // Override with preset colors
      ...Object.keys(primaryPalette).reduce((acc, key) => {
        acc[`color-primary-${key}`] = primaryPalette[key as keyof ColorPalette]
        return acc
      }, {} as ThemeVariables),
      ...Object.keys(secondaryPalette).reduce((acc, key) => {
        acc[`color-secondary-${key}`] = secondaryPalette[key as keyof ColorPalette]
        return acc
      }, {} as ThemeVariables),
      ...Object.keys(accentPalette).reduce((acc, key) => {
        acc[`color-accent-${key}`] = accentPalette[key as keyof ColorPalette]
        return acc
      }, {} as ThemeVariables)
    }
  }
  
  return newTheme
}

/**
 * Validate theme structure
 */
export function validateTheme(theme: Partial<Theme>): string[] {
  const errors: string[] = []
  
  if (!theme.id) errors.push('Theme ID is required')
  if (!theme.name) errors.push('Theme name is required')
  if (!theme.type || !['light', 'dark', 'system'].includes(theme.type)) {
    errors.push('Theme type must be light, dark, or system')
  }
  if (!theme.variables || typeof theme.variables !== 'object') {
    errors.push('Theme variables are required')
  }
  
  return errors
}

/**
 * Get default theme ID
 */
export function getDefaultThemeId(): string {
  return import.meta.env.VITE_DEFAULT_THEME || 'light'
}