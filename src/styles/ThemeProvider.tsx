// File: src/styles/ThemeProvider.tsx
// 🎨 Enhanced Theme Provider with CSS Variable Management
// Provides theme context and manages CSS variables injection
// All styles kept in classes as per project requirements

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { ThemeDefinition, getTheme, getAllThemes } from '@/config/theme.config'

interface ThemeContextType {
  currentTheme: ThemeDefinition
  setTheme: (themeId: string) => void
  isLoading: boolean
  availableThemes: ThemeDefinition[]
  isSystemDark: boolean
  effectiveTheme: ThemeDefinition
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: React.ReactNode
  defaultTheme?: string
  storageKey?: string
}

/**
 * CSS Variable Manager - Injects theme variables into document
 */
class CSSVariableManager {
  private static instance: CSSVariableManager
  private styleElement: HTMLStyleElement | null = null

  static getInstance(): CSSVariableManager {
    if (!CSSVariableManager.instance) {
      CSSVariableManager.instance = new CSSVariableManager()
    }
    return CSSVariableManager.instance
  }

  private constructor() {
    this.createStyleElement()
  }

  private createStyleElement() {
    // Remove existing style element if it exists
    const existingStyle = document.getElementById('kairos-theme-variables')
    if (existingStyle) {
      existingStyle.remove()
    }

    // Create new style element
    this.styleElement = document.createElement('style')
    this.styleElement.id = 'kairos-theme-variables'
    this.styleElement.type = 'text/css'
    document.head.appendChild(this.styleElement)
  }

  injectThemeVariables(theme: ThemeDefinition) {
    if (!this.styleElement) {
      this.createStyleElement()
    }

    const cssVariables = this.generateCSSVariables(theme)
    this.styleElement!.textContent = cssVariables
  }

  private generateCSSVariables(theme: ThemeDefinition): string {
    const { colors, typography, spacing } = theme
    let css = ':root {\n'

    // Inject color variables
    Object.entries(colors).forEach(([group, shades]) => {
      if (typeof shades === 'object' && shades !== null) {
        Object.entries(shades).forEach(([shade, value]) => {
          css += `  --kairos-color-${group}-${shade}: ${value};\n`
        })
      }
    })

    // Inject typography variables
    Object.entries(typography.fontFamily).forEach(([family, fonts]) => {
      css += `  --kairos-font-family-${family}: ${fonts.join(', ')};\n`
    })

    Object.entries(typography.fontSize).forEach(([size, value]) => {
      css += `  --kairos-font-size-${size}: ${value};\n`
    })

    Object.entries(typography.fontWeight).forEach(([weight, value]) => {
      css += `  --kairos-font-weight-${weight}: ${value};\n`
    })

    Object.entries(typography.lineHeight).forEach(([height, value]) => {
      css += `  --kairos-line-height-${height}: ${value};\n`
    })

    // Inject spacing variables
    Object.entries(spacing.borderRadius).forEach(([radius, value]) => {
      css += `  --kairos-border-radius-${radius}: ${value};\n`
    })

    Object.entries(spacing.spacing).forEach(([space, value]) => {
      css += `  --kairos-spacing-${space}: ${value};\n`
    })

    Object.entries(spacing.shadows).forEach(([shadow, value]) => {
      css += `  --kairos-shadow-${shadow}: ${value};\n`
    })

    css += '}\n'

    // Add dark mode overrides if this is a dark theme
    if (theme.isDark) {
      css += 'html.dark {\n'
      css += '  color-scheme: dark;\n'
      css += '}\n'
    } else {
      css += 'html:not(.dark) {\n'
      css += '  color-scheme: light;\n'
      css += '}\n'
    }

    return css
  }
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme = 'kairos-default',
  storageKey = 'kairos-theme'
}) => {
  const [currentTheme, setCurrentTheme] = useState<ThemeDefinition>(() => 
    getTheme(defaultTheme)
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isSystemDark, setIsSystemDark] = useState(false)
  const [availableThemes] = useState<ThemeDefinition[]>(getAllThemes())

  // CSS Variable Manager instance
  const cssManager = CSSVariableManager.getInstance()

  // Calculate effective theme (considering system preference for auto themes)
  const effectiveTheme = React.useMemo(() => {
    if (currentTheme.id === 'auto') {
      return isSystemDark 
        ? getTheme('kairos-dark') 
        : getTheme('kairos-light')
    }
    return currentTheme
  }, [currentTheme, isSystemDark])

  // System dark mode detection
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsSystemDark(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => {
      setIsSystemDark(e.matches)
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Load theme from storage on mount
  useEffect(() => {
    try {
      const storedThemeId = localStorage.getItem(storageKey)
      if (storedThemeId) {
        const theme = getTheme(storedThemeId)
        if (theme) {
          setCurrentTheme(theme)
        }
      }
    } catch (error) {
      console.warn('Failed to load theme from storage:', error)
    }
    setIsLoading(false)
  }, [storageKey])

  // Apply theme changes
  useEffect(() => {
    // Add transition class for smooth theme switching
    document.documentElement.classList.add('theme-transitioning')
    
    // Update dark class on html element
    if (effectiveTheme.isDark) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }

    // Inject CSS variables
    cssManager.injectThemeVariables(effectiveTheme)

    // Update body class for theme-aware styling
    document.body.className = 'theme-body'

    // Remove transition class after animation completes
    const timer = setTimeout(() => {
      document.documentElement.classList.remove('theme-transitioning')
    }, 200)

    return () => clearTimeout(timer)
  }, [effectiveTheme, cssManager])

  // Theme setter with persistence
  const setTheme = useCallback((themeId: string) => {
    const theme = getTheme(themeId)
    if (theme) {
      setCurrentTheme(theme)
      try {
        localStorage.setItem(storageKey, themeId)
      } catch (error) {
        console.warn('Failed to save theme to storage:', error)
      }
    }
  }, [storageKey])

  const contextValue: ThemeContextType = {
    currentTheme,
    setTheme,
    isLoading,
    availableThemes,
    isSystemDark,
    effectiveTheme
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

export default ThemeProvider