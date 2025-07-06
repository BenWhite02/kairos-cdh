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
  }

  /**
   * Generate CSS variables object from theme definition
   */
  generateThemeVariables(theme: ThemeDefinition): CSSVariableMap {
    const variables: CSSVariableMap = {}

    // Color variables
    Object.entries(theme.colors).forEach(([colorGroup, colors]) => {
      if (typeof colors === 'object') {
        Object.entries(colors).forEach(([shade, value]) => {
          variables[`${this.prefix}-color-${colorGroup}-${shade}`] = value
        })
      }
    })

    // Typography variables
    Object.entries(theme.typography.fontFamily).forEach(([key, value]) => {
      variables[`${this.prefix}-font-family-${key}`] = Array.isArray(value) ? value.join(', ') : value
    })

    Object.entries(theme.typography.fontSize).forEach(([key, value]) => {
      variables[`${this.prefix}-font-size-${key}`] = value
    })

    Object.entries(theme.typography.fontWeight).forEach(([key, value]) => {
      variables[`${this.prefix}-font-weight-${key}`] = value.toString()
    })

    Object.entries(theme.typography.lineHeight).forEach(([key, value]) => {
      variables[`${this.prefix}-line-height-${key}`] = value.toString()
    })

    // Spacing variables
    Object.entries(theme.spacing.borderRadius).forEach(([key, value]) => {
      variables[`${this.prefix}-border-radius-${key}`] = value
    })

    Object.entries(theme.spacing.spacing).forEach(([key, value]) => {
      variables[`${this.prefix}-spacing-${key}`] = value
    })

    Object.entries(theme.spacing.shadows).forEach(([key, value]) => {
      variables[`${this.prefix}-shadow-${key}`] = value
    })

    // Semantic variables (derived from colors)
    variables[`${this.prefix}-background`] = theme.isDark ? theme.colors.gray[900] : theme.colors.gray[50]
    variables[`${this.prefix}-foreground`] = theme.isDark ? theme.colors.gray[100] : theme.colors.gray[900]
    variables[`${this.prefix}-muted`] = theme.isDark ? theme.colors.gray[700] : theme.colors.gray[200]
    variables[`${this.prefix}-muted-foreground`] = theme.isDark ? theme.colors.gray[400] : theme.colors.gray[600]
    variables[`${this.prefix}-border`] = theme.isDark ? theme.colors.gray[700] : theme.colors.gray[200]
    variables[`${this.prefix}-input`] = theme.isDark ? theme.colors.gray[800] : theme.colors.gray[100]
    variables[`${this.prefix}-card`] = theme.isDark ? theme.colors.gray[800] : '#ffffff'
    variables[`${this.prefix}-card-foreground`] = theme.isDark ? theme.colors.gray[100] : theme.colors.gray[900]
    variables[`${this.prefix}-popover`] = theme.isDark ? theme.colors.gray[800] : '#ffffff'
    variables[`${this.prefix}-popover-foreground`] = theme.isDark ? theme.colors.gray[100] : theme.colors.gray[900]

    return variables
  }

  /**
   * Set CSS custom properties on the root element
   */
  setVariables(variables: CSSVariableMap): void {
    Object.entries(variables).forEach(([property, value]) => {
      this.root.style.setProperty(property, value.toString())
    })
  }

  /**
   * Set a single CSS variable
   */
  setVariable(property: string, value: string | number): void {
    const fullProperty = property.startsWith('--') ? property : `${this.prefix}-${property}`
    this.root.style.setProperty(fullProperty, value.toString())
  }

  /**
   * Get a CSS variable value
   */
  getVariable(property: string): string {
    const fullProperty = property.startsWith('--') ? property : `${this.prefix}-${property}`
    return getComputedStyle(this.root).getPropertyValue(fullProperty).trim()
  }

  /**
   * Remove a CSS variable
   */
  removeVariable(property: string): void {
    const fullProperty = property.startsWith('--') ? property : `${this.prefix}-${property}`
    this.root.style.removeProperty(fullProperty)
  }

  /**
   * Update data attributes for theme identification
   */
  updateDataAttributes(theme: ThemeDefinition): void {
    this.root.setAttribute('data-theme', theme.id)
    this.root.setAttribute('data-theme-mode', theme.isDark ? 'dark' : 'light')
    
    // Update class for Tailwind compatibility
    if (theme.isDark) {
      this.root.classList.add('dark')
    } else {
      this.root.classList.remove('dark')
    }
  }

  /**
   * Generate CSS custom property declarations as string
   */
  generateCSSString(theme: ThemeDefinition): string {
    const variables = this.generateThemeVariables(theme)
    const declarations = Object.entries(variables)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n')

    return `:root {\n${declarations}\n}`
  }

  /**
   * Apply custom color overrides
   */
  applyCustomColors(colors: Record<string, string>): void {
    Object.entries(colors).forEach(([property, value]) => {
      this.setVariable(`color-custom-${property}`, value)
    })
  }

  /**
   * Apply component-specific variables
   */
  applyComponentVariables(component: string, variables: Record<string, string>): void {
    Object.entries(variables).forEach(([property, value]) => {
      this.setVariable(`${component}-${property}`, value)
    })
  }

  /**
   * Clear all theme variables
   */
  clearThemeVariables(): void {
    const styles = this.root.style
    for (let i = styles.length - 1; i >= 0; i--) {
      const property = styles[i]
      if (property.startsWith(this.prefix)) {
        this.root.style.removeProperty(property)
      }
    }
  }

  /**
   * Get all current theme variables
   */
  getAllThemeVariables(): Record<string, string> {
    const variables: Record<string, string> = {}
    const computedStyles = getComputedStyle(this.root)
    
    for (let i = 0; i < computedStyles.length; i++) {
      const property = computedStyles[i]
      if (property.startsWith(this.prefix)) {
        variables[property] = computedStyles.getPropertyValue(property).trim()
      }
    }
    
    return variables
  }

  /**
   * Create scoped variables for a specific element
   */
  applyScopedTheme(element: HTMLElement, theme: ThemeDefinition): void {
    const variables = this.generateThemeVariables(theme)
    Object.entries(variables).forEach(([property, value]) => {
      element.style.setProperty(property, value.toString())
    })
    element.setAttribute('data-theme', theme.id)
  }

  /**
   * Generate theme-aware utility classes
   */
  generateUtilityClasses(): string {
    return `
      .theme-bg-primary { background-color: var(${this.prefix}-color-primary-500); }
      .theme-bg-secondary { background-color: var(${this.prefix}-color-secondary-500); }
      .theme-bg-accent { background-color: var(${this.prefix}-color-accent-500); }
      .theme-bg-success { background-color: var(${this.prefix}-color-success-500); }
      .theme-bg-warning { background-color: var(${this.prefix}-color-warning-500); }
      .theme-bg-error { background-color: var(${this.prefix}-color-error-500); }
      .theme-bg-info { background-color: var(${this.prefix}-color-info-500); }
      
      .theme-text-primary { color: var(${this.prefix}-color-primary-500); }
      .theme-text-secondary { color: var(${this.prefix}-color-secondary-500); }
      .theme-text-accent { color: var(${this.prefix}-color-accent-500); }
      .theme-text-success { color: var(${this.prefix}-color-success-500); }
      .theme-text-warning { color: var(${this.prefix}-color-warning-500); }
      .theme-text-error { color: var(${this.prefix}-color-error-500); }
      .theme-text-info { color: var(${this.prefix}-color-info-500); }
      
      .theme-border-primary { border-color: var(${this.prefix}-color-primary-500); }
      .theme-border-secondary { border-color: var(${this.prefix}-color-secondary-500); }
      .theme-border-accent { border-color: var(${this.prefix}-color-accent-500); }
      
      .theme-bg { background-color: var(${this.prefix}-background); }
      .theme-fg { color: var(${this.prefix}-foreground); }
      .theme-muted { background-color: var(${this.prefix}-muted); }
      .theme-muted-fg { color: var(${this.prefix}-muted-foreground); }
      .theme-border { border-color: var(${this.prefix}-border); }
      .theme-input { background-color: var(${this.prefix}-input); }
      .theme-card { background-color: var(${this.prefix}-card); }
      .theme-card-fg { color: var(${this.prefix}-card-foreground); }
      .theme-popover { background-color: var(${this.prefix}-popover); }
      .theme-popover-fg { color: var(${this.prefix}-popover-foreground); }
    `
  }
}

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

export const createCSSVariableManager = (prefix?: string): CSSVariableManager => {
  return new CSSVariableManager(prefix)
}

export const applyThemeToElement = (element: HTMLElement, theme: ThemeDefinition, prefix?: string): void => {
  const manager = new CSSVariableManager(prefix)
  manager.applyScopedTheme(element, theme)
}

export const generateThemeCSS = (theme: ThemeDefinition, prefix?: string): string => {
  const manager = new CSSVariableManager(prefix)
  return manager.generateCSSString(theme)
}

export const injectUtilityClasses = (prefix?: string): void => {
  const manager = new CSSVariableManager(prefix)
  const css = manager.generateUtilityClasses()
  
  const styleElement = document.createElement('style')
  styleElement.id = 'kairos-theme-utilities'
  styleElement.textContent = css
  
  // Remove existing utility styles
  const existing = document.getElementById('kairos-theme-utilities')
  if (existing) {
    existing.remove()
  }
  
  document.head.appendChild(styleElement)
}

// =============================================================================
// DEFAULT EXPORT
// =============================================================================

export default CSSVariableManager