// File: src/components/ThemeProvider.tsx
// 🎨 KAIROS Theme Provider Component
// Provides theme context and initializes theme system
// All styles kept in classes as per project requirements

import React, { useEffect, useState, createContext, useContext, ReactNode } from 'react'
import { useThemeStore, setupSystemThemeDetection } from '@/stores/themeStore'
import { CSSVariableManager } from '@/utils/theme/cssVariableManager'
import { getTheme, getDefaultThemeId } from '@/config/theme.config'
import type { Theme } from '@/types/theme.types'

// =============================================================================
// THEME CONTEXT
// =============================================================================

interface ThemeContextValue {
  currentTheme: Theme | null
  isLoading: boolean
  error: string | null
}

const ThemeContext = createContext<ThemeContextValue>({
  currentTheme: null,
  isLoading: true,
  error: null
})

export const useTheme = () => {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}

// =============================================================================
// THEME PROVIDER COMPONENT
// =============================================================================

interface ThemeProviderProps {
  children: ReactNode
  defaultTheme?: string
  enableSystemDetection?: boolean
  className?: string
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({
  children,
  defaultTheme,
  enableSystemDetection = true,
  className
}) => {
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentTheme, setCurrentTheme] = useState<Theme | null>(null)

  // Get theme store state
  const {
    currentTheme: currentThemeId,
    availableThemes,
    isTransitioning,
    error: storeError,
    setTheme,
    refreshThemes,
    preloadThemes
  } = useThemeStore()

  // ==========================================================================
  // INITIALIZATION
  // ==========================================================================

  useEffect(() => {
    const initializeTheme = async () => {
      try {
        setIsLoading(true)
        setError(null)

        console.log('🎨 Initializing KAIROS Theme System...')

        // Initialize CSS Variable Manager
        CSSVariableManager.initialize()

        // Setup system theme detection if enabled
        let cleanupSystemDetection: (() => void) | undefined
        if (enableSystemDetection) {
          cleanupSystemDetection = setupSystemThemeDetection()
        }

        // Refresh available themes
        refreshThemes()

        // Preload themes for better performance
        if (useThemeStore.getState().preloadThemes) {
          await preloadThemes()
        }

        // Determine initial theme
        const initialThemeId = currentThemeId || defaultTheme || getDefaultThemeId()
        
        // Get theme object
        const theme = getTheme(initialThemeId)
        if (!theme) {
          throw new Error(`Theme '${initialThemeId}' not found`)
        }

        // Apply initial theme
        await setTheme(initialThemeId)
        setCurrentTheme(theme)

        console.log(`✅ Theme system initialized with theme: ${theme.name}`)

        return () => {
          if (cleanupSystemDetection) {
            cleanupSystemDetection()
          }
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Theme initialization failed'
        console.error('❌ Theme initialization error:', errorMessage)
        setError(errorMessage)
        
        // Fall back to a basic theme
        try {
          const fallbackTheme = getTheme('light') || availableThemes[0]
          if (fallbackTheme) {
            setCurrentTheme(fallbackTheme)
            await CSSVariableManager.applyTheme(fallbackTheme)
          }
        } catch (fallbackError) {
          console.error('❌ Fallback theme failed:', fallbackError)
        }
      } finally {
        setIsLoading(false)
      }
    }

    initializeTheme()
  }, []) // Only run on mount

  // ==========================================================================
  // THEME UPDATES
  // ==========================================================================

  useEffect(() => {
    // Update current theme when store changes
    if (currentThemeId && !isTransitioning) {
      const theme = getTheme(currentThemeId)
      if (theme && theme.id !== currentTheme?.id) {
        setCurrentTheme(theme)
        console.log(`🎨 Theme changed to: ${theme.name}`)
      }
    }
  }, [currentThemeId, isTransitioning, currentTheme?.id])

  // ==========================================================================
  // ERROR HANDLING
  // ==========================================================================

  useEffect(() => {
    // Update error state from store
    if (storeError) {
      setError(storeError)
    }
  }, [storeError])

  // ==========================================================================
  // CONTEXT VALUE
  // ==========================================================================

  const contextValue: ThemeContextValue = React.useMemo(() => ({
    currentTheme,
    isLoading,
    error: error || storeError
  }), [currentTheme, isLoading, error, storeError])

  // ==========================================================================
  // LOADING STATE
  // ==========================================================================

  if (isLoading) {
    return (
      <div className="kairos-theme-loading min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-gray-600">Loading theme system...</p>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // ERROR STATE
  // ==========================================================================

  if (error && !currentTheme) {
    return (
      <div className="kairos-theme-error min-h-screen flex items-center justify-center bg-red-50">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="text-red-500 text-5xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-red-900 mb-2">
            Theme System Error
          </h1>
          <p className="text-red-700 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Reload Page
          </button>
        </div>
      </div>
    )
  }

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <ThemeContext.Provider value={contextValue}>
      <div 
        className={`kairos-theme-provider ${className || ''}`}
        data-theme={currentTheme?.id}
        data-theme-type={currentTheme?.type}
      >
        {children}
        
        {/* Error notification if theme is working but there's an error */}
        {error && currentTheme && (
          <div className="fixed bottom-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded shadow-lg max-w-sm z-50">
            <div className="flex items-start">
              <span className="text-red-500 mr-2">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-medium">Theme Warning</p>
                <p className="text-xs">{error}</p>
              </div>
              <button
                onClick={() => useThemeStore.getState().clearError()}
                className="ml-2 text-red-500 hover:text-red-700"
                aria-label="Dismiss"
              >
                ×
              </button>
            </div>
          </div>
        )}
      </div>
    </ThemeContext.Provider>
  )
}

// =============================================================================
// THEME PROVIDER HOC
// =============================================================================

/**
 * Higher-order component that wraps a component with ThemeProvider
 */
export function withThemeProvider<T extends object>(
  Component: React.ComponentType<T>,
  options?: {
    defaultTheme?: string
    enableSystemDetection?: boolean
  }
) {
  const WrappedComponent = (props: T) => (
    <ThemeProvider 
      defaultTheme={options?.defaultTheme}
      enableSystemDetection={options?.enableSystemDetection}
    >
      <Component {...props} />
    </ThemeProvider>
  )
  
  WrappedComponent.displayName = `withThemeProvider(${Component.displayName || Component.name})`
  
  return WrappedComponent
}

// =============================================================================
// THEME PROVIDER HOOKS
// =============================================================================

/**
 * Hook to get current theme with loading and error states
 */
export const useCurrentTheme = () => {
  const { currentTheme, isLoading, error } = useTheme()
  const storeTheme = useThemeStore((state) => {
    const theme = state.availableThemes.find(t => t.id === state.currentTheme)
    return theme || null
  })
  
  return {
    theme: currentTheme || storeTheme,
    isLoading,
    error
  }
}

/**
 * Hook to check if theme system is ready
 */
export const useThemeReady = () => {
  const { currentTheme, isLoading, error } = useTheme()
  return {
    isReady: !isLoading && currentTheme !== null,
    hasError: error !== null,
    theme: currentTheme
  }
}

/**
 * Hook to get theme system status
 */
export const useThemeStatus = () => {
  const { currentTheme, isLoading, error } = useTheme()
  const { isTransitioning } = useThemeStore()
  
  return {
    status: isLoading ? 'loading' : error ? 'error' : 'ready',
    isLoading,
    isTransitioning,
    error,
    currentTheme
  }
}