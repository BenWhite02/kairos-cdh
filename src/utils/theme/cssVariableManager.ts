// File: src/utils/theme/cssVariableManager.ts
// 🎨 KAIROS CSS Variable Manager
// Manages CSS custom properties for theme system
// All styles kept in classes as per project requirements

import { Theme, ThemeVariables, CSSVariable } from '@/types/theme.types'

/**
 * Manages CSS custom properties for the theme system
 * Handles application, caching, and performance optimization
 */
export class CSSVariableManager {
  private static cache = new Map<string, string>()
  private static appliedTheme: string | null = null
  private static rootElement: HTMLElement | null = null

  /**
   * Initialize the CSS variable manager
   */
  static initialize(): void {
    if (typeof document === 'undefined') return

    this.rootElement = document.documentElement
    
    // Set up CSS custom property observation
    this.setupPropertyObserver()
  }

  /**
   * Apply theme variables to CSS custom properties
   */
  static async applyTheme(theme: Theme): Promise<void> {
    if (!theme || !this.rootElement) {
      console.warn('Cannot apply theme: theme or root element not available')
      return
    }

    try {
      // Check if theme is already applied
      if (this.appliedTheme === theme.id && this.cache.has(theme.id)) {
        console.debug(`Theme '${theme.id}' already applied, skipping`)
        return
      }

      const startTime = performance.now()

      // Generate CSS variables string
      const cssText = this.generateCSSText(theme.variables)
      
      // Cache the CSS text
      this.cache.set(theme.id, cssText)

      // Apply variables to root element
      this.applyVariables(theme.variables)

      // Add theme class to body for CSS-in-classes approach
      this.updateThemeClasses(theme)

      // Update applied theme
      this.appliedTheme = theme.id

      const endTime = performance.now()
      console.debug(`Applied theme '${theme.id}' in ${(endTime - startTime).toFixed(2)}ms`)

      // Dispatch theme applied event
      this.dispatchThemeEvent('theme-applied', { theme })

    } catch (error) {
      console.error('Failed to apply theme:', error)
      throw new Error(`Theme application failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Generate CSS text from theme variables
   */
  private static generateCSSText(variables: ThemeVariables): string {
    const cssRules: string[] = []

    Object.entries(variables).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        cssRules.push(`  --kairos-${key}: ${value};`)
      }
    })

    return `:root {\n${cssRules.join('\n')}\n}`
  }

  /**
   * Apply variables to root element
   */
  private static applyVariables(variables: ThemeVariables): void {
    if (!this.rootElement) return

    Object.entries(variables).forEach(([key, value]) => {
      if (value && typeof value === 'string') {
        this.rootElement!.style.setProperty(`--kairos-${key}`, value)
      }
    })
  }

  /**
   * Update theme classes on body element
   */
  private static updateThemeClasses(theme: Theme): void {
    if (typeof document === 'undefined') return

    const body = document.body
    
    // Remove existing theme classes
    body.classList.forEach(className => {
      if (className.startsWith('theme-') || className.startsWith('kairos-theme-')) {
        body.classList.remove(className)
      }
    })

    // Add new theme classes
    body.classList.add(`theme-${theme.type}`)
    body.classList.add(`kairos-theme-${theme.id}`)
    
    if (theme.isCustom) {
      body.classList.add('theme-custom')
    }

    // Add data attribute for CSS targeting
    body.setAttribute('data-theme', theme.id)
    body.setAttribute('data-theme-type', theme.type)
  }

  /**
   * Get current theme CSS variables
   */
  static getCurrentVariables(): Record<string, string> {
    if (!this.rootElement) return {}

    const computedStyle = getComputedStyle(this.rootElement)
    const variables: Record<string, string> = {}

    // Extract all CSS custom properties with kairos prefix
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i]
      if (property.startsWith('--kairos-')) {
        const value = computedStyle.getPropertyValue(property).trim()
        if (value) {
          variables[property] = value
        }
      }
    }

    return variables
  }

  /**
   * Get a specific CSS variable value
   */
  static getVariable(name: string): string | null {
    if (!this.rootElement) return null

    const fullName = name.startsWith('--kairos-') ? name : `--kairos-${name}`
    return getComputedStyle(this.rootElement).getPropertyValue(fullName).trim() || null
  }

  /**
   * Set a specific CSS variable
   */
  static setVariable(name: string, value: string): void {
    if (!this.rootElement) return

    const fullName = name.startsWith('--kairos-') ? name : `--kairos-${name}`
    this.rootElement.style.setProperty(fullName, value)
  }

  /**
   * Remove a specific CSS variable
   */
  static removeVariable(name: string): void {
    if (!this.rootElement) return

    const fullName = name.startsWith('--kairos-') ? name : `--kairos-${name}`
    this.rootElement.style.removeProperty(fullName)
  }

  /**
   * Clear all theme-related CSS variables
   */
  static clearVariables(): void {
    if (!this.rootElement) return

    const computedStyle = getComputedStyle(this.rootElement)
    
    for (let i = 0; i < computedStyle.length; i++) {
      const property = computedStyle[i]
      if (property.startsWith('--kairos-')) {
        this.rootElement.style.removeProperty(property)
      }
    }
  }

  /**
   * Export current theme as CSS
   */
  static exportAsCSS(): string {
    const variables = this.getCurrentVariables()
    
    if (Object.keys(variables).length === 0) {
      return '/* No theme variables found */'
    }

    const cssRules = Object.entries(variables)
      .map(([property, value]) => `  ${property}: ${value};`)
      .join('\n')

    return `:root {\n${cssRules}\n}`
  }

  /**
   * Import theme from CSS text
   */
  static importFromCSS(cssText: string): ThemeVariables | null {
    try {
      const variables: Partial<ThemeVariables> = {}
      
      // Parse CSS text to extract variables
      const rootRuleMatch = cssText.match(/:root\s*\{([^}]+)\}/)
      if (!rootRuleMatch) return null

      const rulesText = rootRuleMatch[1]
      const rules = rulesText.split(';').filter(rule => rule.trim())

      rules.forEach(rule => {
        const [property, value] = rule.split(':').map(s => s.trim())
        if (property && value && property.startsWith('--kairos-')) {
          const variableName = property.replace('--kairos-', '')
          if (this.isValidVariableName(variableName)) {
            variables[variableName as keyof ThemeVariables] = value
          }
        }
      })

      return variables as ThemeVariables
    } catch (error) {
      console.error('Failed to import CSS:', error)
      return null
    }
  }

  /**
   * Validate CSS variable name
   */
  private static isValidVariableName(name: string): boolean {
    const validNames = [
      'color-primary-50', 'color-primary-100', 'color-primary-200', 'color-primary-300',
      'color-primary-400', 'color-primary-500', 'color-primary-600', 'color-primary-700',
      'color-primary-800', 'color-primary-900',
      'color-secondary-50', 'color-secondary-100', 'color-secondary-200', 'color-secondary-300',
      'color-secondary-400', 'color-secondary-500', 'color-secondary-600', 'color-secondary-700',
      'color-secondary-800', 'color-secondary-900',
      'color-accent-50', 'color-accent-100', 'color-accent-200', 'color-accent-300',
      'color-accent-400', 'color-accent-500', 'color-accent-600', 'color-accent-700',
      'color-accent-800', 'color-accent-900',
      'color-gray-50', 'color-gray-100', 'color-gray-200', 'color-gray-300',
      'color-gray-400', 'color-gray-500', 'color-gray-600', 'color-gray-700',
      'color-gray-800', 'color-gray-900',
      'color-success', 'color-warning', 'color-error', 'color-info',
      'color-background', 'color-surface', 'color-surface-elevated',
      'color-text-primary', 'color-text-secondary', 'color-text-tertiary', 'color-text-inverse',
      'color-border', 'color-border-subtle', 'color-border-strong',
      'font-family-sans', 'font-family-mono',
      'font-size-xs', 'font-size-sm', 'font-size-base', 'font-size-lg',
      'font-size-xl', 'font-size-2xl', 'font-size-3xl', 'font-size-4xl',
      'line-height-tight', 'line-height-normal', 'line-height-relaxed',
      'spacing-xs', 'spacing-sm', 'spacing-md', 'spacing-lg', 'spacing-xl', 'spacing-2xl',
      'border-radius-sm', 'border-radius-md', 'border-radius-lg', 'border-radius-xl',
      'border-radius-2xl', 'border-radius-full',
      'shadow-sm', 'shadow-md', 'shadow-lg', 'shadow-xl'
    ]

    return validNames.includes(name)
  }

  /**
   * Get all CSS variables with metadata
   */
  static getAllVariables(): CSSVariable[] {
    const variables = this.getCurrentVariables()
    
    return Object.entries(variables).map(([name, value]) => ({
      name,
      value,
      category: this.getCategoryFromName(name),
      description: this.getDescriptionFromName(name)
    }))
  }

  /**
   * Get category from variable name
   */
  private static getCategoryFromName(name: string): string {
    if (name.includes('color-')) return 'Colors'
    if (name.includes('font-')) return 'Typography'
    if (name.includes('spacing-')) return 'Spacing'
    if (name.includes('border-radius-')) return 'Border Radius'
    if (name.includes('shadow-')) return 'Shadows'
    if (name.includes('line-height-')) return 'Typography'
    return 'Other'
  }

  /**
   * Get description from variable name
   */
  private static getDescriptionFromName(name: string): string {
    const descriptions: Record<string, string> = {
      'color-primary-500': 'Primary brand color',
      'color-secondary-500': 'Secondary brand color',
      'color-accent-500': 'Accent color for highlights',
      'color-background': 'Main background color',
      'color-surface': 'Surface background color',
      'color-text-primary': 'Primary text color',
      'font-family-sans': 'Sans-serif font family',
      'font-size-base': 'Base font size',
      'spacing-md': 'Medium spacing',
      'border-radius-md': 'Medium border radius',
      'shadow-md': 'Medium shadow'
    }

    return descriptions[name.replace('--kairos-', '')] || 'Theme variable'
  }

  /**
   * Setup CSS property observer for debugging
   */
  private static setupPropertyObserver(): void {
    if (typeof window === 'undefined' || !window.MutationObserver) return

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
          const target = mutation.target as HTMLElement
          if (target === this.rootElement) {
            console.debug('Root element style changed')
          }
        }
      })
    })

    if (this.rootElement) {
      observer.observe(this.rootElement, {
        attributes: true,
        attributeFilter: ['style']
      })
    }
  }

  /**
   * Dispatch theme-related events
   */
  private static dispatchThemeEvent(type: string, detail: any): void {
    if (typeof window === 'undefined') return

    const event = new CustomEvent(`kairos:${type}`, {
      detail,
      bubbles: true,
      cancelable: true
    })

    window.dispatchEvent(event)
  }

  /**
   * Clear cache
   */
  static clearCache(): void {
    this.cache.clear()
    this.appliedTheme = null
  }

  /**
   * Get cache size
   */
  static getCacheSize(): number {
    return this.cache.size
  }

  /**
   * Get cache info
   */
  static getCacheInfo(): { size: number; keys: string[]; appliedTheme: string | null } {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      appliedTheme: this.appliedTheme
    }
  }

  /**
   * Preload theme CSS
   */
  static preloadTheme(theme: Theme): void {
    if (this.cache.has(theme.id)) return

    const cssText = this.generateCSSText(theme.variables)
    this.cache.set(theme.id, cssText)
  }

  /**
   * Check if theme is cached
   */
  static isThemeCached(themeId: string): boolean {
    return this.cache.has(themeId)
  }

  /**
   * Validate CSS color value
   */
  static isValidColor(color: string): boolean {
    if (!color || typeof color !== 'string') return false

    // Create a dummy element to test color validity
    const element = document.createElement('div')
    element.style.color = color
    
    return element.style.color !== ''
  }

  /**
   * Get contrast ratio between two colors
   */
  static getContrastRatio(color1: string, color2: string): number {
    // This is a simplified contrast ratio calculation
    // In a real implementation, you'd want a more robust color parsing library
    
    const luminance1 = this.getLuminance(color1)
    const luminance2 = this.getLuminance(color2)
    
    const brighter = Math.max(luminance1, luminance2)
    const darker = Math.min(luminance1, luminance2)
    
    return (brighter + 0.05) / (darker + 0.05)
  }

  /**
   * Get relative luminance of a color (simplified)
   */
  private static getLuminance(color: string): number {
    // This is a very simplified luminance calculation
    // A real implementation would properly parse color values
    
    // For now, return a placeholder value
    // You'd want to use a proper color library for this
    return color.includes('dark') ? 0.1 : 0.9
  }
}

// Initialize on module load
if (typeof document !== 'undefined') {
  document.addEventListener('DOMContentLoaded', () => {
    CSSVariableManager.initialize()
  })
}