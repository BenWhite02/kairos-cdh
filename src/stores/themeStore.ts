// File: src/stores/themeStore.ts
// 🎨 KAIROS Theme Store with Zustand
// Global state management for theme system
// All styles kept in classes as per project requirements

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { subscribeWithSelector } from 'zustand/middleware'
import { 
  Theme, 
  ThemeState, 
  ThemeActions, 
  CustomThemeColors,
  ThemePreset 
} from '@/types/theme.types'
import { 
  getAllThemes, 
  getTheme, 
  getCustomThemes, 
  saveCustomThemes,
  createThemeFromPreset,
  THEME_STORAGE_KEY,
  THEME_TRANSITION_DURATION,
  getDefaultThemeId
} from '@/config/theme.config'
import { CSSVariableManager } from '@/utils/theme/cssVariableManager'
import { ThemeValidator } from '@/utils/theme/themeValidator'

// =============================================================================
// THEME STORE INTERFACE
// =============================================================================

interface ThemeStore extends ThemeState, ThemeActions {}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialState: ThemeState = {
  // Current theme
  currentTheme: getDefaultThemeId(),
  
  // Theme management
  availableThemes: getAllThemes(),
  customThemes: getCustomThemes(),
  
  // UI state
  isTransitioning: false,
  isCreatorOpen: false,
  previewTheme: null,
  
  // System preferences
  systemThemePreference: 'light',
  respectSystemTheme: true,
  
  // Custom theme creation
  enableCustomColors: import.meta.env.VITE_CUSTOM_THEMES_ENABLED === 'true',
  
  // Settings
  transitionDuration: THEME_TRANSITION_DURATION,
  preloadThemes: true,
  persistCustomThemes: true,
  
  // Cache
  themeCache: new Map(),
  
  // Error state
  error: null
}

// =============================================================================
// THEME STORE IMPLEMENTATION
// =============================================================================

export const useThemeStore = create<ThemeStore>()(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        ...initialState,

        // =======================================================================
        // CORE THEME ACTIONS
        // =======================================================================

        /**
         * Set the current theme
         */
        setTheme: async (themeId: string) => {
          const { isTransitioning, currentTheme } = get()
          
          // Prevent multiple simultaneous transitions
          if (isTransitioning || currentTheme === themeId) return
          
          try {
            set({ isTransitioning: true, error: null })
            
            // Get theme data
            const theme = getTheme(themeId)
            if (!theme) {
              throw new Error(`Theme '${themeId}' not found`)
            }
            
            // Handle system theme
            let resolvedTheme = theme
            if (theme.type === 'system') {
              const systemPreference = get().systemThemePreference
              const fallbackThemeId = systemPreference === 'dark' ? 'dark' : 'light'
              resolvedTheme = getTheme(fallbackThemeId) || theme
            }
            
            // Apply theme variables to CSS
            await CSSVariableManager.applyTheme(resolvedTheme)
            
            // Add transition class to body
            document.body.classList.add('theme-transitioning')
            
            // Update store state
            set({ 
              currentTheme: themeId,
              previewTheme: null
            })
            
            // Remove transition class after animation
            setTimeout(() => {
              document.body.classList.remove('theme-transitioning')
              set({ isTransitioning: false })
            }, get().transitionDuration)
            
          } catch (error) {
            console.error('Theme application failed:', error)
            set({ 
              error: error instanceof Error ? error.message : 'Theme application failed',
              isTransitioning: false 
            })
          }
        },

        /**
         * Preview a theme without applying it
         */
        previewTheme: async (themeId: string | null) => {
          const { currentTheme } = get()
          
          try {
            set({ error: null })
            
            if (themeId === null) {
              // Reset to current theme
              const theme = getTheme(currentTheme)
              if (theme) {
                await CSSVariableManager.applyTheme(theme)
              }
              set({ previewTheme: null })
              return
            }
            
            const theme = getTheme(themeId)
            if (!theme) {
              throw new Error(`Theme '${themeId}' not found`)
            }
            
            // Handle system theme for preview
            let resolvedTheme = theme
            if (theme.type === 'system') {
              const systemPreference = get().systemThemePreference
              const fallbackThemeId = systemPreference === 'dark' ? 'dark' : 'light'
              resolvedTheme = getTheme(fallbackThemeId) || theme
            }
            
            await CSSVariableManager.applyTheme(resolvedTheme)
            set({ previewTheme: themeId })
            
          } catch (error) {
            console.error('Theme preview failed:', error)
            set({ error: error instanceof Error ? error.message : 'Theme preview failed' })
          }
        },

        /**
         * Toggle between light and dark theme
         */
        toggleTheme: () => {
          const { currentTheme } = get()
          const newTheme = currentTheme === 'light' ? 'dark' : 'light'
          get().setTheme(newTheme)
        },

        // =======================================================================
        // CUSTOM THEME MANAGEMENT
        // =======================================================================

        /**
         * Create a new custom theme
         */
        createCustomTheme: (theme: Omit<Theme, 'isCustom'>) => {
          try {
            const errors = ThemeValidator.validateTheme(theme)
            if (errors.length > 0) {
              throw new Error(`Theme validation failed: ${errors.join(', ')}`)
            }
            
            const customTheme: Theme = {
              ...theme,
              isCustom: true,
              id: theme.id || `custom-${Date.now()}`
            }
            
            const { customThemes } = get()
            const updatedCustomThemes = [...customThemes, customTheme]
            
            // Save to localStorage
            saveCustomThemes(updatedCustomThemes)
            
            // Update store
            set({
              customThemes: updatedCustomThemes,
              availableThemes: getAllThemes(),
              error: null
            })
            
            return customTheme.id
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create custom theme'
            set({ error: errorMessage })
            throw error
          }
        },

        /**
         * Update an existing custom theme
         */
        updateCustomTheme: (themeId: string, updates: Partial<Theme>) => {
          try {
            const { customThemes } = get()
            const themeIndex = customThemes.findIndex(t => t.id === themeId)
            
            if (themeIndex === -1) {
              throw new Error(`Custom theme '${themeId}' not found`)
            }
            
            const updatedTheme = { ...customThemes[themeIndex], ...updates }
            const errors = ThemeValidator.validateTheme(updatedTheme)
            if (errors.length > 0) {
              throw new Error(`Theme validation failed: ${errors.join(', ')}`)
            }
            
            const updatedCustomThemes = [...customThemes]
            updatedCustomThemes[themeIndex] = updatedTheme
            
            // Save to localStorage
            saveCustomThemes(updatedCustomThemes)
            
            // Update store
            set({
              customThemes: updatedCustomThemes,
              availableThemes: getAllThemes(),
              error: null
            })
            
            // If this is the current theme, reapply it
            if (get().currentTheme === themeId) {
              get().setTheme(themeId)
            }
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to update custom theme'
            set({ error: errorMessage })
            throw error
          }
        },

        /**
         * Delete a custom theme
         */
        deleteCustomTheme: (themeId: string) => {
          try {
            const { customThemes, currentTheme } = get()
            const updatedCustomThemes = customThemes.filter(t => t.id !== themeId)
            
            // Save to localStorage
            saveCustomThemes(updatedCustomThemes)
            
            // Update store
            set({
              customThemes: updatedCustomThemes,
              availableThemes: getAllThemes(),
              error: null
            })
            
            // If the deleted theme was current, switch to default
            if (currentTheme === themeId) {
              get().setTheme(getDefaultThemeId())
            }
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to delete custom theme'
            set({ error: errorMessage })
            throw error
          }
        },

        /**
         * Create theme from preset
         */
        createThemeFromPreset: (preset: ThemePreset, type: 'light' | 'dark' = 'light', customName?: string) => {
          try {
            const theme = createThemeFromPreset(preset, type, customName)
            return get().createCustomTheme(theme)
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to create theme from preset'
            set({ error: errorMessage })
            throw error
          }
        },

        // =======================================================================
        // SYSTEM INTEGRATION
        // =======================================================================

        /**
         * Update system theme preference
         */
        updateSystemThemePreference: (preference: 'light' | 'dark') => {
          set({ systemThemePreference: preference })
          
          // If current theme is system, reapply it
          if (get().currentTheme === 'system') {
            get().setTheme('system')
          }
        },

        /**
         * Set whether to respect system theme preference
         */
        setRespectSystemTheme: (respect: boolean) => {
          set({ respectSystemTheme: respect })
          
          if (respect && get().currentTheme !== 'system') {
            get().setTheme('system')
          }
        },

        // =======================================================================
        // THEME CREATOR UI
        // =======================================================================

        /**
         * Open theme creator
         */
        openThemeCreator: () => set({ isCreatorOpen: true }),

        /**
         * Close theme creator
         */
        closeThemeCreator: () => set({ isCreatorOpen: false }),

        // =======================================================================
        // CACHE MANAGEMENT
        // =======================================================================

        /**
         * Clear theme cache
         */
        clearThemeCache: () => {
          set({ themeCache: new Map() })
          CSSVariableManager.clearCache()
        },

        /**
         * Preload all themes
         */
        preloadThemes: async () => {
          if (!get().preloadThemes) return
          
          try {
            const themes = get().availableThemes
            const cache = new Map()
            
            for (const theme of themes) {
              if (theme.type !== 'system') {
                cache.set(theme.id, theme)
              }
            }
            
            set({ themeCache: cache })
          } catch (error) {
            console.warn('Failed to preload themes:', error)
          }
        },

        // =======================================================================
        // IMPORT/EXPORT
        // =======================================================================

        /**
         * Export custom themes
         */
        exportThemes: () => {
          const { customThemes } = get()
          return JSON.stringify(customThemes, null, 2)
        },

        /**
         * Import custom themes
         */
        importThemes: (themesJson: string) => {
          try {
            const importedThemes = JSON.parse(themesJson) as Theme[]
            
            if (!Array.isArray(importedThemes)) {
              throw new Error('Invalid theme format')
            }
            
            // Validate each theme
            const validThemes: Theme[] = []
            const errors: string[] = []
            
            for (const theme of importedThemes) {
              const themeErrors = ThemeValidator.validateTheme(theme)
              if (themeErrors.length === 0) {
                validThemes.push({
                  ...theme,
                  id: `imported-${theme.id}-${Date.now()}`,
                  isCustom: true
                })
              } else {
                errors.push(`Theme '${theme.name}': ${themeErrors.join(', ')}`)
              }
            }
            
            if (validThemes.length === 0) {
              throw new Error(`No valid themes found. Errors: ${errors.join('; ')}`)
            }
            
            const { customThemes } = get()
            const updatedCustomThemes = [...customThemes, ...validThemes]
            
            // Save to localStorage
            saveCustomThemes(updatedCustomThemes)
            
            // Update store
            set({
              customThemes: updatedCustomThemes,
              availableThemes: getAllThemes(),
              error: null
            })
            
            return {
              imported: validThemes.length,
              errors: errors.length > 0 ? errors : null
            }
            
          } catch (error) {
            const errorMessage = error instanceof Error ? error.message : 'Failed to import themes'
            set({ error: errorMessage })
            throw error
          }
        },

        // =======================================================================
        // ERROR HANDLING
        // =======================================================================

        /**
         * Clear error state
         */
        clearError: () => set({ error: null }),

        // =======================================================================
        // UTILITIES
        // =======================================================================

        /**
         * Refresh available themes
         */
        refreshThemes: () => {
          set({
            availableThemes: getAllThemes(),
            customThemes: getCustomThemes()
          })
        }
      }),
      {
        name: THEME_STORAGE_KEY,
        storage: createJSONStorage(() => localStorage),
        partialize: (state) => ({
          currentTheme: state.currentTheme,
          systemThemePreference: state.systemThemePreference,
          respectSystemTheme: state.respectSystemTheme,
          enableCustomColors: state.enableCustomColors,
          transitionDuration: state.transitionDuration,
          preloadThemes: state.preloadThemes,
          persistCustomThemes: state.persistCustomThemes
        }),
        onRehydrateStorage: () => (state) => {
          if (state) {
            // Initialize theme on app load
            state.setTheme(state.currentTheme)
            
            // Preload themes if enabled
            if (state.preloadThemes) {
              state.preloadThemes()
            }
          }
        }
      }
    )
  )
)

// =============================================================================
// CONVENIENCE HOOKS
// =============================================================================

/**
 * Hook to get current theme data
 */
export const useCurrentTheme = () => {
  const currentThemeId = useThemeStore(state => state.currentTheme)
  const availableThemes = useThemeStore(state => state.availableThemes)
  
  return availableThemes.find(theme => theme.id === currentThemeId) || availableThemes[0]
}

/**
 * Hook to get theme actions only
 */
export const useThemeActions = () => {
  return useThemeStore(state => ({
    setTheme: state.setTheme,
    previewTheme: state.previewTheme,
    toggleTheme: state.toggleTheme,
    createCustomTheme: state.createCustomTheme,
    updateCustomTheme: state.updateCustomTheme,
    deleteCustomTheme: state.deleteCustomTheme,
    createThemeFromPreset: state.createThemeFromPreset,
    openThemeCreator: state.openThemeCreator,
    closeThemeCreator: state.closeThemeCreator,
    clearThemeCache: state.clearThemeCache,
    exportThemes: state.exportThemes,
    importThemes: state.importThemes,
    clearError: state.clearError,
    refreshThemes: state.refreshThemes
  }))
}

/**
 * Hook to get theme UI state
 */
export const useThemeUI = () => {
  return useThemeStore(state => ({
    isTransitioning: state.isTransitioning,
    isCreatorOpen: state.isCreatorOpen,
    previewTheme: state.previewTheme,
    error: state.error
  }))
}

/**
 * Hook to get custom themes
 */
export const useCustomThemes = () => {
  return useThemeStore(state => state.customThemes)
}

// =============================================================================
// SYSTEM THEME DETECTION
// =============================================================================

/**
 * Set up system theme detection
 */
export function setupSystemThemeDetection() {
  if (typeof window === 'undefined') return
  
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  
  const handleSystemThemeChange = (e: MediaQueryListEvent) => {
    const preference = e.matches ? 'dark' : 'light'
    useThemeStore.getState().updateSystemThemePreference(preference)
  }
  
  // Set initial preference
  const initialPreference = mediaQuery.matches ? 'dark' : 'light'
  useThemeStore.getState().updateSystemThemePreference(initialPreference)
  
  // Listen for changes
  mediaQuery.addEventListener('change', handleSystemThemeChange)
  
  return () => {
    mediaQuery.removeEventListener('change', handleSystemThemeChange)
  }
}