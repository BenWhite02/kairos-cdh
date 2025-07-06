// File: src/components/SimpleThemeProvider.tsx
// Simplified theme provider for testing

import React, { ReactNode } from 'react'

interface SimpleThemeProviderProps {
  children: ReactNode
}

export const SimpleThemeProvider: React.FC<SimpleThemeProviderProps> = ({ children }) => {
  // Set basic CSS variables
  React.useEffect(() => {
    const root = document.documentElement
    
    // Light theme variables
    root.style.setProperty('--kairos-color-primary-500', '#3b82f6')
    root.style.setProperty('--kairos-color-secondary-500', '#6b7280')
    root.style.setProperty('--kairos-color-accent-500', '#8b5cf6')
    root.style.setProperty('--kairos-color-success', '#10b981')
    root.style.setProperty('--kairos-color-error', '#ef4444')
    root.style.setProperty('--kairos-color-background', '#ffffff')
    root.style.setProperty('--kairos-color-surface', '#f9fafb')
    root.style.setProperty('--kairos-color-text-primary', '#111827')
    root.style.setProperty('--kairos-color-text-secondary', '#6b7280')
    root.style.setProperty('--kairos-color-text-tertiary', '#9ca3af')
    root.style.setProperty('--kairos-color-border', '#e5e7eb')
    
    // Add theme class
    document.body.classList.add('theme-light')
    document.body.setAttribute('data-theme', 'light')
  }, [])

  return <div className="simple-theme-provider">{children}</div>
}