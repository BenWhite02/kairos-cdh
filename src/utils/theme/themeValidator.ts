// File: src/utils/theme/themeValidator.ts
// 🎨 KAIROS Theme Validator Utility
// Validates theme objects and CSS values
// All styles kept in classes as per project requirements

import type { Theme, ThemeVariables, ThemeValidationResult } from '@/types/theme.types'

/**
 * Theme validation utility class
 */
export class ThemeValidator {
  
  /**
   * Validate a complete theme object
   */
  static validateTheme(theme: Partial<Theme>): string[] {
    const errors: string[] = []
    
    // Required fields validation
    if (!theme.id || typeof theme.id !== 'string') {
      errors.push('Theme ID is required and must be a string')
    } else if (theme.id.length < 1 || theme.id.length > 100) {
      errors.push('Theme ID must be between 1 and 100 characters')
    } else if (!/^[a-z0-9-_]+$/i.test(theme.id)) {
      errors.push('Theme ID can only contain letters, numbers, hyphens, and underscores')
    }
    
    if (!theme.name || typeof theme.name !== 'string') {
      errors.push('Theme name is required and must be a string')
    } else if (theme.name.length < 1 || theme.name.length > 255) {
      errors.push('Theme name must be between 1 and 255 characters')
    }
    
    if (!theme.type || !['light', 'dark', 'system'].includes(theme.type)) {
      errors.push('Theme type must be "light", "dark", or "system"')
    }
    
    if (theme.isCustom === undefined || typeof theme.isCustom !== 'boolean') {
      errors.push('isCustom field is required and must be a boolean')
    }
    
    if (theme.isDefault === undefined || typeof theme.isDefault !== 'boolean') {
      errors.push('isDefault field is required and must be a boolean')
    }
    
    // Variables validation
    if (!theme.variables || typeof theme.variables !== 'object') {
      errors.push('Theme variables are required and must be an object')
    } else {
      const variableErrors = this.validateThemeVariables(theme.variables)
      errors.push(...variableErrors)
    }
    
    // Optional fields validation
    if (theme.description !== undefined) {
      if (typeof theme.description !== 'string') {
        errors.push('Theme description must be a string')
      } else if (theme.description.length > 1000) {
        errors.push('Theme description cannot exceed 1000 characters')
      }
    }
    
    if (theme.author !== undefined) {
      if (typeof theme.author !== 'string') {
        errors.push('Theme author must be a string')
      } else if (theme.author.length > 255) {
        errors.push('Theme author cannot exceed 255 characters')
      }
    }
    
    if (theme.version !== undefined) {
      if (typeof theme.version !== 'string') {
        errors.push('Theme version must be a string')
      } else if (!/^\d+\.\d+\.\d+$/.test(theme.version)) {
        errors.push('Theme version must follow semantic versioning (e.g., 1.0.0)')
      }
    }
    
    if (theme.tags !== undefined) {
      if (!Array.isArray(theme.tags)) {
        errors.push('Theme tags must be an array')
      } else {
        theme.tags.forEach((tag, index) => {
          if (typeof tag !== 'string') {
            errors.push(`Tag at index ${index} must be a string`)
          } else if (tag.length === 0 || tag.length > 50) {
            errors.push(`Tag at index ${index} must be between 1 and 50 characters`)
          }
        })
        
        if (theme.tags.length > 20) {
          errors.push('Theme cannot have more than 20 tags')
        }
      }
    }
    
    return errors
  }
  
  /**
   * Validate theme variables
   */
  static validateThemeVariables(variables: Partial<ThemeVariables>): string[] {
    const errors: string[] = []
    
    // Required color variables
    const requiredColorPalettes = ['primary', 'secondary', 'accent', 'gray']
    const colorShades = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900']
    
    requiredColorPalettes.forEach(palette => {
      colorShades.forEach(shade => {
        const key = `color-${palette}-${shade}` as keyof ThemeVariables
        if (!variables[key]) {
          errors.push(`Missing required color variable: ${key}`)
        } else if (!this.isValidColor(variables[key])) {
          errors.push(`Invalid color value for ${key}: ${variables[key]}`)
        }
      })
    })
    
    // Required semantic colors
    const requiredSemanticColors = ['success', 'warning', 'error', 'info']
    requiredSemanticColors.forEach(color => {
      const key = `color-${color}` as keyof ThemeVariables
      if (!variables[key]) {
        errors.push(`Missing required semantic color: ${key}`)
      } else if (!this.isValidColor(variables[key])) {
        errors.push(`Invalid color value for ${key}: ${variables[key]}`)
      }
    })
    
    // Required background colors
    const requiredBackgrounds = ['background', 'surface', 'surface-elevated']
    requiredBackgrounds.forEach(bg => {
      const key = `color-${bg}` as keyof ThemeVariables
      if (!variables[key]) {
        errors.push(`Missing required background color: ${key}`)
      } else if (!this.isValidColor(variables[key])) {
        errors.push(`Invalid color value for ${key}: ${variables[key]}`)
      }
    })
    
    // Required text colors
    const requiredTextColors = ['text-primary', 'text-secondary', 'text-tertiary', 'text-inverse']
    requiredTextColors.forEach(text => {
      const key = `color-${text}` as keyof ThemeVariables
      if (!variables[key]) {
        errors.push(`Missing required text color: ${key}`)
      } else if (!this.isValidColor(variables[key])) {
        errors.push(`Invalid color value for ${key}: ${variables[key]}`)
      }
    })
    
    // Required border colors
    const requiredBorderColors = ['border', 'border-subtle', 'border-strong']
    requiredBorderColors.forEach(border => {
      const key = `color-${border}` as keyof ThemeVariables
      if (!variables[key]) {
        errors.push(`Missing required border color: ${key}`)
      } else if (!this.isValidColor(variables[key])) {
        errors.push(`Invalid color value for ${key}: ${variables[key]}`)
      }
    })
    
    // Required typography
    const requiredFonts = ['font-family-sans', 'font-family-mono']
    requiredFonts.forEach(font => {
      const key = font as keyof ThemeVariables
      if (!variables[key]) {
        errors.push(`Missing required font: ${key}`)
      } else if (!this.isValidFontFamily(variables[key])) {
        errors.push(`Invalid font family for ${key}: ${variables[key]}`)
      }
    })
    
    // Font sizes
    const requiredFontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl']
    requiredFontSizes.forEach(size => {
      const key = `font-size-${size}` as keyof ThemeVariables
      if (!variables[key]) {
        errors.push(`Missing required font size: ${key}`)
      } else if (!this.isValidLength(variables[key])) {
        errors.push(`Invalid font size for ${key}: ${variables[key]}`)
      }
    })
    
    // Line heights
    const requiredLineHeights = ['tight', 'normal', 'relaxed']
    requiredLineHeights.forEach(height => {
      const key = `line-height-${height}` as keyof ThemeVariables
      if (!variables[key]) {
        errors.push(`Missing required line height: ${key}`)
      } else if (!this.isValidLineHeight(variables[key])) {
        errors.push(`Invalid line height for ${key}: ${variables[key]}`)
      }
    })
    
    // Spacing
    const requiredSpacing = ['xs', 'sm', 'md', 'lg', 'xl', '2xl']
    requiredSpacing.forEach(space => {
      const key = `spacing-${space}` as keyof ThemeVariables
      if (!variables[key]) {
        errors.push(`Missing required spacing: ${key}`)
      } else if (!this.isValidLength(variables[key])) {
        errors.push(`Invalid spacing for ${key}: ${variables[key]}`)
      }
    })
    
    // Border radius
    const requiredBorderRadius = ['sm', 'md', 'lg', 'xl', '2xl', 'full']
    requiredBorderRadius.forEach(radius => {
      const key = `border-radius-${radius}` as keyof ThemeVariables
      if (!variables[key]) {
        errors.push(`Missing required border radius: ${key}`)
      } else if (!this.isValidLength(variables[key]) && variables[key] !== '9999px') {
        errors.push(`Invalid border radius for ${key}: ${variables[key]}`)
      }
    })
    
    // Shadows
    const requiredShadows = ['sm', 'md', 'lg', 'xl']
    requiredShadows.forEach(shadow => {
      const key = `shadow-${shadow}` as keyof ThemeVariables
      if (!variables[key]) {
        errors.push(`Missing required shadow: ${key}`)
      } else if (!this.isValidShadow(variables[key])) {
        errors.push(`Invalid shadow for ${key}: ${variables[key]}`)
      }
    })
    
    return errors
  }
  
  /**
   * Validate CSS color value
   */
  static isValidColor(color: string): boolean {
    if (!color || typeof color !== 'string') return false
    
    // Remove whitespace
    const trimmedColor = color.trim()
    
    // Check common color formats
    const colorPatterns = [
      /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, // Hex colors
      /^rgb\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)$/, // RGB
      /^rgba\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*,\s*[\d.]+\s*\)$/, // RGBA
      /^hsl\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*\)$/, // HSL
      /^hsla\(\s*\d+\s*,\s*\d+%\s*,\s*\d+%\s*,\s*[\d.]+\s*\)$/, // HSLA
      /^(transparent|currentColor)$/, // Special values
    ]
    
    // Check named colors (basic set)
    const namedColors = [
      'black', 'white', 'red', 'green', 'blue', 'yellow', 'orange', 'purple',
      'pink', 'gray', 'grey', 'brown', 'cyan', 'magenta', 'lime', 'indigo',
      'teal', 'navy', 'maroon', 'olive', 'aqua', 'fuchsia', 'silver'
    ]
    
    return colorPatterns.some(pattern => pattern.test(trimmedColor)) || 
           namedColors.includes(trimmedColor.toLowerCase())
  }
  
  /**
   * Validate CSS length value
   */
  static isValidLength(length: string): boolean {
    if (!length || typeof length !== 'string') return false
    
    const lengthPattern = /^-?\d*\.?\d+(px|em|rem|%|vh|vw|vmin|vmax|ch|ex|cm|mm|in|pt|pc)$/
    return lengthPattern.test(length.trim()) || length.trim() === '0'
  }
  
  /**
   * Validate CSS font family
   */
  static isValidFontFamily(fontFamily: string): boolean {
    if (!fontFamily || typeof fontFamily !== 'string') return false
    
    // Basic validation - should contain at least one font name
    const trimmed = fontFamily.trim()
    return trimmed.length > 0 && !trimmed.includes('<') && !trimmed.includes('>')
  }
  
  /**
   * Validate CSS line height
   */
  static isValidLineHeight(lineHeight: string): boolean {
    if (!lineHeight || typeof lineHeight !== 'string') return false
    
    const trimmed = lineHeight.trim()
    
    // Number only (unitless)
    if (/^\d*\.?\d+$/.test(trimmed)) return true
    
    // Length units
    return this.isValidLength(trimmed)
  }
  
  /**
   * Validate CSS box shadow
   */
  static isValidShadow(shadow: string): boolean {
    if (!shadow || typeof shadow !== 'string') return false
    
    const trimmed = shadow.trim()
    
    // Basic shadow pattern validation
    // This is simplified - a full implementation would be more complex
    const shadowPattern = /^(\d+px\s+\d+px(\s+\d+px)?(\s+\d+px)?\s+(#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}|rgba?\([^)]+\)|[a-z]+))(\s*,\s*\d+px\s+\d+px(\s+\d+px)?(\s+\d+px)?\s+(#[A-Fa-f0-9]{6}|#[A-Fa-f0-9]{3}|rgba?\([^)]+\)|[a-z]+))*$/
    
    return shadowPattern.test(trimmed) || trimmed === 'none'
  }
  
  /**
   * Get detailed validation result
   */
  static getValidationResult(theme: Partial<Theme>): ThemeValidationResult {
    const errors = this.validateTheme(theme)
    const warnings: string[] = []
    
    // Add warnings for missing optional fields
    if (!theme.description) {
      warnings.push('Theme description is recommended for better user experience')
    }
    
    if (!theme.author) {
      warnings.push('Theme author information is recommended')
    }
    
    if (!theme.version) {
      warnings.push('Theme version is recommended for tracking changes')
    }
    
    // Check for potential accessibility issues
    if (theme.variables) {
      // This would require more sophisticated color analysis
      // For now, just basic checks
      const primaryColor = theme.variables['color-primary-500']
      const backgroundColor = theme.variables['color-background']
      
      if (primaryColor && backgroundColor) {
        // In a real implementation, you'd calculate contrast ratios
        // For now, just warn about potential issues
        if (theme.type === 'light' && primaryColor.includes('#fff')) {
          warnings.push('Primary color may have insufficient contrast on light background')
        }
        if (theme.type === 'dark' && primaryColor.includes('#000')) {
          warnings.push('Primary color may have insufficient contrast on dark background')
        }
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      warnings
    }
  }
  
  /**
   * Quick validation check
   */
  static isValid(theme: Partial<Theme>): boolean {
    return this.validateTheme(theme).length === 0
  }
}