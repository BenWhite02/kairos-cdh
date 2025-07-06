// File: src/stores/themeStore.ts
// 🎨 Enhanced Theme State Management for Kairos Frontend
// Manages theme switching, custom themes, and tenant-specific theming
// Integrates with CSS Variable Manager for dynamic theme application

import { create } from 'zustand'
import { subscribeWithSelector } from 'zustand/middleware'
import { persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import { ThemeDefinition, themeConfig, getTheme, getAllThemes, isDarkTheme } from '@/config/theme.config'
import { CSSVariableManager } from '@/utils/cssVariableManager'
import { environmentConfig } from '@/config/environment.config'

export interface CustomThemeColors {
  primary?: string
  secondary?: string
  accent?: string
  background?: string
  foreground?: string
  muted?: string
  border?: string
}

export interface ThemePreset {
  id: string
  name: string
  description: string
  colors: CustomThemeColors
  preview?: string
}

export interface ThemeState {
  // Current theme state
  currentTheme: string
  isDarkMode: boolean
  isSystemTheme: boolean
  
  // Theme management
  availableThemes: ThemeDefinition[]
  customThemes: ThemeDefinition[]
  themePresets: ThemePreset[]
  
  // Tenant theming
  tenantTheme?: ThemeDefinition
  enableTenantTheming: boolean
  
  // Theme creator
  isThemeCreatorOpen: boolean
  editingTheme?: ThemeDefinition
  previewTheme?: ThemeDefinition
  
  // UI state
  isTransitioning: boolean
  themeLoadingStates: Record<string, boolean>
  lastThemeChange: number
  
  // Customization
  customColors: CustomThemeColors
  enableCustomColors: boolean
  
  // Cache
  themeCacheTimestamp: number
  enableThemeCache: boolean
}

export interface ThemeActions {
  // Theme switching
  setTheme: (themeId: string) => void
  toggleDarkMode: () => void
  applySystemTheme: () => void
  
  // Custom themes
  createCustomTheme: (theme: Partial<ThemeDefinition>) => Promise<void>
  updateCustomTheme: (themeId: string, updates: Partial<ThemeDefinition>) => Promise<void>
  deleteCustomTheme: (themeId: string) => Promise<void>
  duplicateTheme: (themeId: string, newName: string) => Promise<void>
  
  // Theme creator
  openThemeCreator: (themeId?: string) => void
  closeThemeCreator: () => void
  setEditingTheme: (theme: ThemeDefinition) => void
  setPreviewTheme: (theme?: ThemeDefinition) => void
  saveEditingTheme: () => Promise<void>
  resetEditingTheme: () => void
  
  // Custom colors
  setCustomColors: (colors: CustomThemeColors) => void
  toggleCustomColors: () => void
  resetCustomColors: () => void
  
  // Tenant theming
  setTenantTheme: (theme?: ThemeDefinition) => void
  toggleTenantTheming: () => void
  loadTenantTheme: (tenantId: string) => Promise<void>
  saveTenantTheme: (tenantId: string, theme: ThemeDefinition) => Promise<void>
  
  // Presets
  loadThemePresets: () => Promise<void>
  createThemePreset: (preset: ThemePreset) => void
  applyThemePreset: (presetId: string) => void
  
  // Cache management
  refreshThemeCache: () => Promise<void>
  clearThemeCache: () => void
  
  // Utilities
  exportTheme: (themeId: string) => string
  importTheme: (themeData: string) => Promise<void>
  getThemeCSS: (themeId: string) => string
  initializeTheme: () => void
}

type ThemeStore = ThemeState & ThemeActions

// =============================================================================
// CSS VARIABLE MANAGER INSTANCE
// =============================================================================

const cssManager = new CSSVariableManager(environmentConfig.theme.cssVariablePrefix || '--kairos')

// =============================================================================
// SYSTEM THEME DETECTION
// =============================================================================

const getSystemTheme = (): boolean => {
  return window.matchMedia('(prefers-color-scheme: dark)').matches
}

// =============================================================================
// THEME STORE
// =============================================================================

export const useThemeStore = create<ThemeStore>()(
  subscribeWithSelector(
    persist(
      immer((set, get) => ({
        // =============================================================================
        // INITIAL STATE
        // =============================================================================
        currentTheme: themeConfig.defaultTheme,
        isDarkMode: false,
        isSystemTheme: themeConfig.defaultTheme === 'system',
        
        availableThemes: getAllThemes(),
        customThemes: [],
        themePresets: [],
        
        tenantTheme: undefined,
        enableTenantTheming: environmentConfig.theme.enableTenantThemes,
        
        isThemeCreatorOpen: false,
        editingTheme: undefined,
        previewTheme: undefined,
        
        isTransitioning: false,
        themeLoadingStates: {},
        lastThemeChange: 0,
        
        customColors: {},
        enableCustomColors: false,
        
        themeCacheTimestamp: 0,
        enableThemeCache: true,

        // =============================================================================
        // THEME SWITCHING ACTIONS
        // =============================================================================
        setTheme: (themeId: string) => {
          set((state) => {
            state.isTransitioning = true
            state.currentTheme = themeId
            state.isSystemTheme = themeId === 'system'
            state.lastThemeChange = Date.now()
            
            if (themeId === 'system') {
              state.isDarkMode = getSystemTheme()
            } else {
              state.isDarkMode = isDarkTheme(themeId)
            }
          })

          // Apply theme after state update
          setTimeout(() => {
            const theme = get().tenantTheme || getTheme(themeId)
            if (theme) {
              cssManager.applyTheme(theme)
              
              // Apply custom colors if enabled
              if (get().enableCustomColors) {
                cssManager.applyCustomColors(get().customColors)
              }
            }

            set((state) => {
              state.isTransitioning = false
            })
          }, 0)
        },

        toggleDarkMode: () => {
          const state = get()
          const newTheme = state.isDarkMode ? 'light' : 'dark'
          get().setTheme(newTheme)
        },

        applySystemTheme: () => {
          get().setTheme('system')
        },

        // =============================================================================
        // CUSTOM THEME ACTIONS
        // =============================================================================
        createCustomTheme: async (themeData: Partial<ThemeDefinition>) => {
          const id = `custom-${Date.now()}`
          const newTheme: ThemeDefinition = {
            id,
            name: themeData.name || 'Custom Theme',
            description: themeData.description || 'Custom theme created by user',
            colors: themeData.colors || getTheme('light')!.colors,
            typography: themeData.typography || getTheme('light')!.typography,
            spacing: themeData.spacing || getTheme('light')!.spacing,
            isDark: themeData.isDark || false,
            isCustom: true,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }

          set((state) => {
            state.customThemes.push(newTheme)
            state.availableThemes.push(newTheme)
          })

          // Save to backend if tenant theming is enabled
          if (get().enableTenantTheming) {
            try {
              await fetch(`${environmentConfig.theme.apiUrl}/custom`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTheme)
              })
            } catch (error) {
              console.error('Failed to save custom theme:', error)
            }
          }
        },

        updateCustomTheme: async (themeId: string, updates: Partial<ThemeDefinition>) => {
          set((state) => {
            const customIndex = state.customThemes.findIndex(t => t.id === themeId)
            const availableIndex = state.availableThemes.findIndex(t => t.id === themeId)
            
            if (customIndex !== -1) {
              Object.assign(state.customThemes[customIndex], {
                ...updates,
                updatedAt: new Date().toISOString()
              })
            }
            
            if (availableIndex !== -1) {
              Object.assign(state.availableThemes[availableIndex], {
                ...updates,
                updatedAt: new Date().toISOString()
              })
            }
          })

          // Save to backend
          if (get().enableTenantTheming) {
            try {
              await fetch(`${environmentConfig.theme.apiUrl}/custom/${themeId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates)
              })
            } catch (error) {
              console.error('Failed to update custom theme:', error)
            }
          }
        },

        deleteCustomTheme: async (themeId: string) => {
          set((state) => {
            state.customThemes = state.customThemes.filter(t => t.id !== themeId)
            state.availableThemes = state.availableThemes.filter(t => t.id !== themeId)
            
            // Switch to default theme if deleted theme was active
            if (state.currentTheme === themeId) {
              state.currentTheme = themeConfig.defaultTheme
            }
          })

          // Delete from backend
          if (get().enableTenantTheming) {
            try {
              await fetch(`${environmentConfig.theme.apiUrl}/custom/${themeId}`, {
                method: 'DELETE'
              })
            } catch (error) {
              console.error('Failed to delete custom theme:', error)
            }
          }
        },

        duplicateTheme: async (themeId: string, newName: string) => {
          const originalTheme = getTheme(themeId) || get().customThemes.find(t => t.id === themeId)
          if (!originalTheme) return

          await get().createCustomTheme({
            ...originalTheme,
            name: newName,
            description: `Copy of ${originalTheme.name}`
          })
        },

        // =============================================================================
        // THEME CREATOR ACTIONS
        // =============================================================================
        openThemeCreator: (themeId?: string) => {
          set((state) => {
            state.isThemeCreatorOpen = true
            if (themeId) {
              const theme = getTheme(themeId) || state.customThemes.find(t => t.id === themeId)
              if (theme) {
                state.editingTheme = { ...theme }
              }
            } else {
              state.editingTheme = { ...getTheme('light')!, id: 'new', name: 'New Theme', isCustom: true }
            }
          })
        },

        closeThemeCreator: () => {
          set((state) => {
            state.isThemeCreatorOpen = false
            state.editingTheme = undefined
            state.previewTheme = undefined
          })
        },

        setEditingTheme: (theme: ThemeDefinition) => {
          set((state) => {
            state.editingTheme = { ...theme }
          })
        },

        setPreviewTheme: (theme?: ThemeDefinition) => {
          set((state) => {
            state.previewTheme = theme
          })

          // Apply preview theme
          if (theme) {
            cssManager.applyTheme(theme)
          } else {
            // Revert to current theme
            const currentTheme = get().tenantTheme || getTheme(get().currentTheme)
            if (currentTheme) {
              cssManager.applyTheme(currentTheme)
            }
          }
        },

        saveEditingTheme: async () => {
          const editingTheme = get().editingTheme
          if (!editingTheme) return

          if (editingTheme.id === 'new') {
            await get().createCustomTheme(editingTheme)
          } else {
            await get().updateCustomTheme(editingTheme.id, editingTheme)
          }

          get().closeThemeCreator()
        },

        resetEditingTheme: () => {
          const editingTheme = get().editingTheme
          if (!editingTheme) return

          if (editingTheme.id === 'new') {
            get().setEditingTheme({ ...getTheme('light')!, id: 'new', name: 'New Theme', isCustom: true })
          } else {
            const originalTheme = getTheme(editingTheme.id) || get().customThemes.find(t => t.id === editingTheme.id)
            if (originalTheme) {
              get().setEditingTheme(originalTheme)
            }
          }
        },

        // =============================================================================
        // CUSTOM COLORS ACTIONS
        // =============================================================================
        setCustomColors: (colors: CustomThemeColors) => {
          set((state) => {
            state.customColors = { ...state.customColors, ...colors }
          })

          if (get().enableCustomColors) {
            cssManager.applyCustomColors(colors)
          }
        },

        toggleCustomColors: () => {
          set((state) => {
            state.enableCustomColors = !state.enableCustomColors
          })

          if (get().enableCustomColors) {
            cssManager.applyCustomColors(get().customColors)
          } else {
            // Reapply current theme to remove custom colors
            const currentTheme = get().tenantTheme || getTheme(get().currentTheme)
            if (currentTheme) {
              cssManager.applyTheme(currentTheme)
            }
          }
        },

        resetCustomColors: () => {
          set((state) => {
            state.customColors = {}
            state.enableCustomColors = false
          })

          // Reapply current theme
          const currentTheme = get().tenantTheme || getTheme(get().currentTheme)
          if (currentTheme) {
            cssManager.applyTheme(currentTheme)
          }
        },

        // =============================================================================
        // TENANT THEMING ACTIONS
        // =============================================================================
        setTenantTheme: (theme?: ThemeDefinition) => {
          set((state) => {
            state.tenantTheme = theme
          })

          // Apply tenant theme if set, otherwise apply current theme
          const themeToApply = theme || getTheme(get().currentTheme)
          if (themeToApply) {
            cssManager.applyTheme(themeToApply)
          }
        },

        toggleTenantTheming: () => {
          set((state) => {
            state.enableTenantTheming = !state.enableTenantTheming
          })
        },

        loadTenantTheme: async (tenantId: string) => {
          if (!get().enableTenantTheming) return

          try {
            const response = await fetch(`${environmentConfig.theme.apiUrl}/tenant/${tenantId}`)
            if (response.ok) {
              const tenantTheme = await response.json()
              get().setTenantTheme(tenantTheme)
            }
          } catch (error) {
            console.error('Failed to load tenant theme:', error)
          }
        },

        saveTenantTheme: async (tenantId: string, theme: ThemeDefinition) => {
          if (!get().enableTenantTheming) return

          try {
            await fetch(`${environmentConfig.theme.apiUrl}/tenant/${tenantId}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(theme)
            })
            get().setTenantTheme(theme)
          } catch (error) {
            console.error('Failed to save tenant theme:', error)
          }
        },

        // =============================================================================
        // PRESET ACTIONS
        // =============================================================================
        loadThemePresets: async () => {
          try {
            const response = await fetch(`${environmentConfig.theme.apiUrl}/presets`)
            if (response.ok) {
              const presets = await response.json()
              set((state) => {
                state.themePresets = presets
              })
            }
          } catch (error) {
            console.error('Failed to load theme presets:', error)
          }
        },

        createThemePreset: (preset: ThemePreset) => {
          set((state) => {
            state.themePresets.push(preset)
          })
        },

        applyThemePreset: (presetId: string) => {
          const preset = get().themePresets.find(p => p.id === presetId)
          if (preset) {
            get().setCustomColors(preset.colors)
            get().toggleCustomColors()
          }
        },

        // =============================================================================
        // CACHE MANAGEMENT
        // =============================================================================
        refreshThemeCache: async () => {
          try {
            const response = await fetch(`${environmentConfig.theme.apiUrl}/cache/refresh`, {
              method: 'POST'
            })
            if (response.ok) {
              set((state) => {
                state.themeCacheTimestamp = Date.now()
              })
            }
          } catch (error) {
            console.error('Failed to refresh theme cache:', error)
          }
        },

        clearThemeCache: () => {
          set((state) => {
            state.themeCacheTimestamp = 0
            state.customThemes = []
            state.themePresets = []
          })
        },

        // =============================================================================
        // UTILITY ACTIONS
        // =============================================================================
        exportTheme: (themeId: string) => {
          const theme = getTheme(themeId) || get().customThemes.find(t => t.id === themeId)
          if (!theme) return ''

          return JSON.stringify({
            version: '1.0',
            theme,
            exportedAt: new Date().toISOString(),
            exportedBy: 'Kairos Theme System'
          }, null, 2)
        },

        importTheme: async (themeData: string) => {
          try {
            const parsed = JSON.parse(themeData)
            if (parsed.theme && parsed.version) {
              await get().createCustomTheme({
                ...parsed.theme,
                id: `imported-${Date.now()}`,
                name: `${parsed.theme.name} (Imported)`
              })
            }
          } catch (error) {
            console.error('Failed to import theme:', error)
            throw new Error('Invalid theme data')
          }
        },

        getThemeCSS: (themeId: string) => {
          const theme = getTheme(themeId) || get().customThemes.find(t => t.id === themeId)
          if (!theme) return ''

          return cssManager.generateCSSString(theme)
        },

        initializeTheme: () => {
          const state = get()
          const themeToApply = state.tenantTheme || getTheme(state.currentTheme)
          
          if (themeToApply) {
            cssManager.applyTheme(themeToApply)
            
            if (state.enableCustomColors) {
              cssManager.applyCustomColors(state.customColors)
            }
          }

          // Setup system theme listener
          if (state.isSystemTheme) {
            const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
            const handleSystemThemeChange = (e: MediaQueryListEvent) => {
              if (get().isSystemTheme) {
                set((state) => {
                  state.isDarkMode = e.matches
                })
                const systemTheme = getTheme(e.matches ? 'dark' : 'light')
                if (systemTheme) {
                  cssManager.applyTheme(systemTheme)
                }
              }
            }
            mediaQuery.addEventListener('change', handleSystemThemeChange)
          }

          // Inject utility classes
          const utilityCSS = cssManager.generateUtilityClasses()
          const styleElement = document.createElement('style')
          styleElement.id = 'kairos-theme-utilities'
          styleElement.textContent = utilityCSS
          document.head.appendChild(styleElement)
        }
      })),
      {
        name: 'kairos-theme-store',
        partialize: (state) => ({
          currentTheme: state.currentTheme,
          customThemes: state.customThemes,
          customColors: state.customColors,
          enableCustomColors: state.enableCustomColors,
          enableTenantTheming: state.enableTenantTheming
        })
      }
    )
  )
)

// =============================================================================
// THEME STORE SUBSCRIPTIONS
// =============================================================================

// Subscribe to theme changes to update document
useThemeStore.subscribe(
  (state) => state.currentTheme,
  (currentTheme) => {
    document.documentElement.setAttribute('data-theme', currentTheme)
  }
)

// Subscribe to dark mode changes
useThemeStore.subscribe(
  (state) => state.isDarkMode,
  (isDarkMode) => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }
)

// =============================================================================
// UTILITY HOOKS
// =============================================================================

export const useCurrentTheme = () => {
  const currentTheme = useThemeStore(state => state.currentTheme)
  const tenantTheme = useThemeStore(state => state.tenantTheme)
  return tenantTheme || getTheme(currentTheme)
}

export const useThemeActions = () => {
  return useThemeStore(state => ({
    setTheme: state.setTheme,
    toggleDarkMode: state.toggleDarkMode,
    openThemeCreator: state.openThemeCreator,
    setCustomColors: state.setCustomColors,
    toggleCustomColors: state.toggleCustomColors
  }))
}

export const useThemeCreator = () => {
  return useThemeStore(state => ({
    isOpen: state.isThemeCreatorOpen,
    editingTheme: state.editingTheme,
    previewTheme: state.previewTheme,
    open: state.openThemeCreator,
    close: state.closeThemeCreator,
    setEditing: state.setEditingTheme,
    setPreview: state.setPreviewTheme,
    save: state.saveEditingTheme,
    reset: state.resetEditingTheme
  }))
}

// Initialize theme store
if (typeof window !== 'undefined') {
  useThemeStore.getState().initializeTheme()
}

export default useThemeStore