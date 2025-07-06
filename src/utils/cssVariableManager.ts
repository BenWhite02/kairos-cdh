// File: src/utils/cssVariableManager.ts
// 🎨 CSS Variable Management Utility for Kairos Theme System
// Manages dynamic CSS custom properties for theme switching
// Provides type-safe access to CSS variables and theme application

import { ThemeDefinition, ThemeColors } from '@/config/theme.config'

export interface CSSVariableMap {
  [key: string]: string | number
}

export interface ThemeCSSVariables {
  // Color variables
  colors: {
    primary: Record<string, string>
    secondary: Record<string, string>
    accent: Record<string, string>
    success: Record<string, string>
    warning: Record<string, string>
    error: Record<string, string>
    info: Record<string, string>
    gray: Record<string, string>
  }
  
  // Typography variables
  typography: {
    fontFamily: Record<string, string>
    fontSize: Record<string, string>
    fontWeight: Record<string, string>
    lineHeight: Record<string, string>
  }
  
  // Spacing variables
  spacing: {
    borderRadius: Record<string, string>
    spacing: Record<string, string>
    shadows: Record<string, string>
  }
  
  // Component-specific variables
  components: Record<string, string>
}

// =============================================================================
// CSS VARIABLE MANAGER CLASS
// =============================================================================

export class CSSVariableManager {
  private prefix: string
  private root: HTMLElement
  private cache: Map<string, string> = new Map()
  private observers: Set<(variables: CSSVariableMap) => void> = new Set()

  constructor(prefix: string = '--kairos') {
    this.prefix = prefix
    this.root = document.documentElement
  }

  /**
   * Apply theme definition to CSS custom properties
   */
  applyTheme(theme: ThemeDefinition): void {
    const variables = this.generateThemeVariables(theme)
    this.setVariables(variables)
    this.updateDataAttributes(theme)
    this.notifyObservers(variables)
  }

  /**
   * Generate CSS variables object from theme definition
   */
  generateThemeVariables(theme: ThemeDefinition): CSSVariableMap {
    const variables: CSSVariableMap = {}

    // Color variables
    this.generateColorVariables(theme.colors, variables)
    
    // Typography variables
    this.generateTypographyVariables(theme.typography, variables)
    
    // Spacing variables
    this.generateSpacingVariables(theme.spacing, variables)
    
    // Theme metadata
    variables[`${this.prefix}-theme-id`] = theme.id
    variables[`${this.prefix}-theme-name`] = theme.name
    variables[`${this.prefix}-is-dark`] = theme.isDark ? '1' : '0'

    return variables
  }

  /**
   * Generate color CSS variables
   */
  private generateColorVariables(colors: ThemeColors, variables: CSSVariableMap): void {
    Object.entries(colors).forEach(([colorGroup, colorShades]) => {
      if (typeof colorShades === 'object') {
        Object.entries(colorShades).forEach(([shade, value]) => {
          variables[`${this.prefix}-color-${colorGroup}-${shade}`] = value
          
          // Generate HSL variants for better manipulation
          const hsl = this.hexToHsl(value)
          if (hsl) {
            variables[`${this.prefix}-color-${colorGroup}-${shade}-h`] = hsl.h
            variables[`${this.prefix}-color-${colorGroup}-${shade}-s`] = hsl.s
            variables[`${this.prefix}-color-${colorGroup}-${shade}-l`] = hsl.l
          }
        })
      }
    })
  }

  /**
   * Generate typography CSS variables
   */
  private generateTypographyVariables(typography: any, variables: CSSVariableMap): void {
    // Font families
    Object.entries(typography.fontFamily).forEach(([key, value]) => {
      variables[`${this.prefix}-font-family-${key}`] = Array.isArray(value) 
        ? value.join(', ') 
        : value
    })

    // Font sizes
    Object.entries(typography.fontSize).forEach(([key, value]) => {
      variables[`${this.prefix}-font-size-${key}`] = value
    })

    // Font weights
    Object.entries(typography.fontWeight).forEach(([key, value]) => {
      variables[`${this.prefix}-font-weight-${key}`] = value
    })

    // Line heights
    Object.entries(typography.lineHeight).forEach(([key, value]) => {
      variables[`${this.prefix}-line-height-${key}`] = value
    })
  }

  /**
   * Generate spacing CSS variables
   */
  private generateSpacingVariables(spacing: any, variables: CSSVariableMap): void {
    // Border radius
    Object.entries(spacing.borderRadius).forEach(([key, value]) => {
      variables[`${this.prefix}-border-radius-${key}`] = value
    })

    // Spacing scale
    Object.entries(spacing.spacing).forEach(([key, value]) => {
      variables[`${this.prefix}-spacing-${key}`] = value
    })

    // Shadows
    Object.entries(spacing.shadows).forEach(([key, value]) => {
      variables[`${this.prefix}-shadow-${key}`] = value
    })
  }

  /**
   * Set CSS variables on root element
   */
  setVariables(variables: CSSVariableMap): void {
    Object.entries(variables).forEach(([key, value]) => {
      this.root.style.setProperty(key, String(value))
      this.cache.set(key, String(value))
    })
  }

  /**
   * Get CSS variable value
   */
  getVariable(name: string): string | null {
    const fullName = name.startsWith('--') ? name : `${this.prefix}-${name}`
    return this.cache.get(fullName) || getComputedStyle(this.root).getPropertyValue(fullName) || null
  }

  /**
   * Set individual CSS variable
   */
  setVariable(name: string, value: string | number): void {
    const fullName = name.startsWith('--') ? name : `${this.prefix}-${name}`
    this.root.style.setProperty(fullName, String(value))
    this.cache.set(fullName, String(value))
  }

  /**
   * Remove CSS variable
   */
  removeVariable(name: string): void {
    const fullName = name.startsWith('--') ? name : `${this.prefix}-${name}`
    this.root.style.removeProperty(fullName)
    this.cache.delete(fullName)
  }

  /**
   * Update data attributes for theme information
   */
  private updateDataAttributes(theme: ThemeDefinition): void {
    this.root.setAttribute('data-theme', theme.id)
    this.root.setAttribute('data-theme-type', theme.isDark ? 'dark' : 'light')
    this.root.setAttribute('data-theme-custom', theme.isCustom ? 'true' : 'false')
    
    // Update class for CSS targeting
    this.root.className = this.root.className.replace(/theme-\w+/g, '')
    this.root.classList.add(`theme-${theme.id}`)
    
    if (theme.isDark) {
      this.root.classList.add('dark')
      this.root.classList.remove('light')
    } else {
      this.root.classList.add('light')
      this.root.classList.remove('dark')
    }
  }

  /**
   * Convert hex color to HSL
   */
  private hexToHsl(hex: string): { h: number; s: number; l: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
    if (!result) return null

    const r = parseInt(result[1], 16) / 255
    const g = parseInt(result[2], 16) / 255
    const b = parseInt(result[3], 16) / 255

    const max = Math.max(r, g, b)
    const min = Math.min(r, g, b)
    let h: number
    let s: number
    const l = (max + min) / 2

    if (max === min) {
      h = s = 0 // achromatic
    } else {
      const d = max - min
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min)

      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0)
          break
        case g:
          h = (b - r) / d + 2
          break
        case b:
          h = (r - g) / d + 4
          break
        default:
          h = 0
      }

      h /= 6
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    }
  }

  /**
   * Generate CSS from current variables
   */
  generateCSS(): string {
    const variables = Array.from(this.cache.entries())
      .map(([key, value]) => `  ${key}: ${value};`)
      .join('\n')

    return `:root {\n${variables}\n}`
  }

  /**
   * Add observer for variable changes
   */
  addObserver(observer: (variables: CSSVariableMap) => void): void {
    this.observers.add(observer)
  }

  /**
   * Remove observer
   */
  removeObserver(observer: (variables: CSSVariableMap) => void): void {
    this.observers.delete(observer)
  }

  /**
   * Notify observers of variable changes
   */
  private notifyObservers(variables: CSSVariableMap): void {
    this.observers.forEach(observer => observer(variables))
  }

  /**
   * Reset all theme variables
   */
  reset(): void {
    this.cache.forEach((_, key) => {
      this.root.style.removeProperty(key)
    })
    this.cache.clear()
    
    // Reset data attributes
    this.root.removeAttribute('data-theme')
    this.root.removeAttribute('data-theme-type')
    this.root.removeAttribute('data-theme-custom')
    this.root.className = this.root.className.replace(/theme-\w+|dark|light/g, '')
  }

  /**
   * Create CSS utility classes for current theme
   */
  generateUtilityClasses(): string {
    const utilities: string[] = []

    // Generate color utilities
    this.cache.forEach((value, key) => {
      if (key.includes('-color-')) {
        const className = key.replace(`${this.prefix}-`, '').replace(/-/g, '-')
        utilities.push(`.${className} { color: var(${key}); }`)
        utilities.push(`.bg-${className} { background-color: var(${key}); }`)
        utilities.push(`.border-${className} { border-color: var(${key}); }`)
      }
    })

    return utilities.join('\n')
  }
}

// =============================================================================
// THEME TRANSITION MANAGER
// =============================================================================

export class ThemeTransitionManager {
  private cssManager: CSSVariableManager
  private transitionDuration: number

  constructor(cssManager: CSSVariableManager, transitionDuration: number = 200) {
    this.cssManager = cssManager
    this.transitionDuration = transitionDuration
  }

  /**
   * Apply theme with smooth transition
   */
  async applyThemeWithTransition(theme: ThemeDefinition): Promise<void> {
    return new Promise((resolve) => {
      // Add transition class
      document.documentElement.classList.add('theme-transitioning')
      
      // Apply theme
      this.cssManager.applyTheme(theme)
      
      // Remove transition class after animation
      setTimeout(() => {
        document.documentElement.classList.remove('theme-transitioning')
        resolve()
      }, this.transitionDuration)
    })
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default CSSVariableManager