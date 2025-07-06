// File: src/stores/appStore.ts
// 🎯 Block H2: State Management - Main Application Store
// Zustand-based global state management for Kairos Frontend
// * 🎨 **Theme management** with dynamic switching
// * 🏢 **Tenant context** and workspace management  
// * 👤 **User authentication** state
// * 🔔 **Notifications** and alerts
// * 🚀 **UI state** and loading indicators

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface User {
  id: string
  email: string
  name: string
  role: 'admin' | 'user' | 'viewer'
  tenantId: string
  workspaceIds: string[]
  preferences: UserPreferences
}

export interface UserPreferences {
  theme: ThemeMode
  language: string
  dashboardLayout: 'compact' | 'expanded'
  analyticsRefreshRate: number
  enableNotifications: boolean
  enableSounds: boolean
}

export type ThemeMode = 
  | 'light' 
  | 'dark' 
  | 'kairos-blue' 
  | 'moment-purple' 
  | 'enterprise'
  | 'auto'

export interface Tenant {
  id: string
  name: string
  domain: string
  subscriptionTier: 'free' | 'pro' | 'enterprise'
  features: string[]
  branding?: {
    primaryColor: string
    logo: string
    favicon: string
  }
}

export interface Workspace {
  id: string
  name: string
  description?: string
  tenantId: string
  isActive: boolean
}

export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actions?: NotificationAction[]
}

export interface NotificationAction {
  label: string
  action: () => void
  variant?: 'primary' | 'secondary'
}

export interface AppState {
  // =============================================================================
  // AUTHENTICATION STATE
  // =============================================================================
  user: User | null
  isAuthenticated: boolean
  authToken: string | null
  refreshToken: string | null
  
  // =============================================================================
  // TENANT & WORKSPACE STATE
  // =============================================================================
  currentTenant: Tenant | null
  currentWorkspace: Workspace | null
  availableTenants: Tenant[]
  availableWorkspaces: Workspace[]
  
  // =============================================================================
  // THEME SYSTEM STATE
  // =============================================================================
  theme: ThemeMode
  isDarkMode: boolean
  customThemeColors: Record<string, string>
  themeTransition: boolean
  
  // =============================================================================
  // UI STATE
  // =============================================================================
  isLoading: boolean
  isSidebarOpen: boolean
  isMobileMenuOpen: boolean
  loadingStates: Record<string, boolean>
  
  // =============================================================================
  // NOTIFICATIONS STATE
  // =============================================================================
  notifications: Notification[]
  unreadCount: number
  
  // =============================================================================
  // ERROR STATE
  // =============================================================================
  error: string | null
  errors: Record<string, string>
  
  // =============================================================================
  // REAL-TIME STATE
  // =============================================================================
  isConnected: boolean
  lastConnectionTime: Date | null
  connectionRetries: number
}

export interface AppActions {
  // =============================================================================
  // AUTHENTICATION ACTIONS
  // =============================================================================
  login: (user: User, tokens: { authToken: string; refreshToken: string }) => void
  logout: () => void
  updateUser: (updates: Partial<User>) => void
  updateUserPreferences: (preferences: Partial<UserPreferences>) => void
  
  // =============================================================================
  // TENANT & WORKSPACE ACTIONS
  // =============================================================================
  setCurrentTenant: (tenant: Tenant) => void
  setCurrentWorkspace: (workspace: Workspace) => void
  addTenant: (tenant: Tenant) => void
  updateTenant: (tenantId: string, updates: Partial<Tenant>) => void
  
  // =============================================================================
  // THEME SYSTEM ACTIONS
  // =============================================================================
  setTheme: (theme: ThemeMode) => void
  toggleDarkMode: () => void
  setCustomThemeColors: (colors: Record<string, string>) => void
  enableThemeTransition: () => void
  
  // =============================================================================
  // UI ACTIONS
  // =============================================================================
  setLoading: (isLoading: boolean) => void
  setLoadingState: (key: string, isLoading: boolean) => void
  toggleSidebar: () => void
  toggleMobileMenu: () => void
  
  // =============================================================================
  // NOTIFICATION ACTIONS
  // =============================================================================
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void
  markNotificationAsRead: (id: string) => void
  markAllNotificationsAsRead: () => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
  
  // =============================================================================
  // ERROR ACTIONS
  // =============================================================================
  setError: (error: string | null) => void
  setFieldError: (field: string, error: string) => void
  clearErrors: () => void
  
  // =============================================================================
  // REAL-TIME ACTIONS
  // =============================================================================
  setConnectionStatus: (isConnected: boolean) => void
  incrementConnectionRetries: () => void
  resetConnectionRetries: () => void
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useAppStore = create<AppState & AppActions>()(
  devtools(
    persist(
      immer((set, get) => ({
        // =============================================================================
        // INITIAL STATE
        // =============================================================================
        user: null,
        isAuthenticated: false,
        authToken: null,
        refreshToken: null,
        
        currentTenant: null,
        currentWorkspace: null,
        availableTenants: [],
        availableWorkspaces: [],
        
        theme: (import.meta.env.VITE_DEFAULT_THEME as ThemeMode) || 'light',
        isDarkMode: false,
        customThemeColors: {},
        themeTransition: false,
        
        isLoading: false,
        isSidebarOpen: true,
        isMobileMenuOpen: false,
        loadingStates: {},
        
        notifications: [],
        unreadCount: 0,
        
        error: null,
        errors: {},
        
        isConnected: false,
        lastConnectionTime: null,
        connectionRetries: 0,
        
        // =============================================================================
        // AUTHENTICATION ACTIONS
        // =============================================================================
        login: (user, tokens) => {
          set((state) => {
            state.user = user
            state.isAuthenticated = true
            state.authToken = tokens.authToken
            state.refreshToken = tokens.refreshToken
            state.error = null
          })
        },
        
        logout: () => {
          set((state) => {
            state.user = null
            state.isAuthenticated = false
            state.authToken = null
            state.refreshToken = null
            state.currentTenant = null
            state.currentWorkspace = null
            state.availableTenants = []
            state.availableWorkspaces = []
            state.notifications = []
            state.unreadCount = 0
            state.errors = {}
          })
        },
        
        updateUser: (updates) => {
          set((state) => {
            if (state.user) {
              Object.assign(state.user, updates)
            }
          })
        },
        
        updateUserPreferences: (preferences) => {
          set((state) => {
            if (state.user?.preferences) {
              Object.assign(state.user.preferences, preferences)
            }
          })
        },
        
        // =============================================================================
        // TENANT & WORKSPACE ACTIONS
        // =============================================================================
        setCurrentTenant: (tenant) => {
          set((state) => {
            state.currentTenant = tenant
          })
        },
        
        setCurrentWorkspace: (workspace) => {
          set((state) => {
            state.currentWorkspace = workspace
          })
        },
        
        addTenant: (tenant) => {
          set((state) => {
            const exists = state.availableTenants.find(t => t.id === tenant.id)
            if (!exists) {
              state.availableTenants.push(tenant)
            }
          })
        },
        
        updateTenant: (tenantId, updates) => {
          set((state) => {
            const index = state.availableTenants.findIndex(t => t.id === tenantId)
            if (index !== -1) {
              Object.assign(state.availableTenants[index], updates)
            }
            if (state.currentTenant?.id === tenantId) {
              Object.assign(state.currentTenant, updates)
            }
          })
        },
        
        // =============================================================================
        // THEME SYSTEM ACTIONS
        // =============================================================================
        setTheme: (theme) => {
          set((state) => {
            state.theme = theme
            state.isDarkMode = theme === 'dark' || 
                             (theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches)
            
            // Apply theme to document
            const root = document.documentElement
            root.className = root.className.replace(/theme-\w+/g, '')
            root.classList.add(`theme-${theme}`)
            
            if (state.isDarkMode) {
              root.classList.add('dark')
            } else {
              root.classList.remove('dark')
            }
          })
        },
        
        toggleDarkMode: () => {
          const currentTheme = get().theme
          const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
          get().setTheme(newTheme)
        },
        
        setCustomThemeColors: (colors) => {
          set((state) => {
            state.customThemeColors = colors
            
            // Apply custom colors to CSS variables
            const root = document.documentElement
            Object.entries(colors).forEach(([property, value]) => {
              root.style.setProperty(`--color-${property}`, value)
            })
          })
        },
        
        enableThemeTransition: () => {
          set((state) => {
            state.themeTransition = true
          })
          
          // Disable transition after animation completes
          setTimeout(() => {
            set((state) => {
              state.themeTransition = false
            })
          }, 300)
        },
        
        // =============================================================================
        // UI ACTIONS
        // =============================================================================
        setLoading: (isLoading) => {
          set((state) => {
            state.isLoading = isLoading
          })
        },
        
        setLoadingState: (key, isLoading) => {
          set((state) => {
            if (isLoading) {
              state.loadingStates[key] = true
            } else {
              delete state.loadingStates[key]
            }
          })
        },
        
        toggleSidebar: () => {
          set((state) => {
            state.isSidebarOpen = !state.isSidebarOpen
          })
        },
        
        toggleMobileMenu: () => {
          set((state) => {
            state.isMobileMenuOpen = !state.isMobileMenuOpen
          })
        },
        
        // =============================================================================
        // NOTIFICATION ACTIONS
        // =============================================================================
        addNotification: (notification) => {
          set((state) => {
            const newNotification: Notification = {
              ...notification,
              id: Date.now().toString(),
              timestamp: new Date(),
              read: false,
            }
            state.notifications.unshift(newNotification)
            state.unreadCount += 1
            
            // Limit notifications to 50
            if (state.notifications.length > 50) {
              state.notifications = state.notifications.slice(0, 50)
            }
          })
        },
        
        markNotificationAsRead: (id) => {
          set((state) => {
            const notification = state.notifications.find(n => n.id === id)
            if (notification && !notification.read) {
              notification.read = true
              state.unreadCount = Math.max(0, state.unreadCount - 1)
            }
          })
        },
        
        markAllNotificationsAsRead: () => {
          set((state) => {
            state.notifications.forEach(n => {
              n.read = true
            })
            state.unreadCount = 0
          })
        },
        
        removeNotification: (id) => {
          set((state) => {
            const index = state.notifications.findIndex(n => n.id === id)
            if (index !== -1) {
              const notification = state.notifications[index]
              if (!notification.read) {
                state.unreadCount = Math.max(0, state.unreadCount - 1)
              }
              state.notifications.splice(index, 1)
            }
          })
        },
        
        clearNotifications: () => {
          set((state) => {
            state.notifications = []
            state.unreadCount = 0
          })
        },
        
        // =============================================================================
        // ERROR ACTIONS
        // =============================================================================
        setError: (error) => {
          set((state) => {
            state.error = error
          })
        },
        
        setFieldError: (field, error) => {
          set((state) => {
            state.errors[field] = error
          })
        },
        
        clearErrors: () => {
          set((state) => {
            state.error = null
            state.errors = {}
          })
        },
        
        // =============================================================================
        // REAL-TIME ACTIONS
        // =============================================================================
        setConnectionStatus: (isConnected) => {
          set((state) => {
            state.isConnected = isConnected
            if (isConnected) {
              state.lastConnectionTime = new Date()
              state.connectionRetries = 0
            }
          })
        },
        
        incrementConnectionRetries: () => {
          set((state) => {
            state.connectionRetries += 1
          })
        },
        
        resetConnectionRetries: () => {
          set((state) => {
            state.connectionRetries = 0
          })
        },
      })),
      {
        name: 'kairos-app-store',
        partialize: (state) => ({
          // Persist only essential data
          theme: state.theme,
          isDarkMode: state.isDarkMode,
          customThemeColors: state.customThemeColors,
          isSidebarOpen: state.isSidebarOpen,
          user: state.user ? {
            ...state.user,
            // Don't persist sensitive data
            authToken: undefined,
            refreshToken: undefined,
          } : null,
          currentTenant: state.currentTenant,
          currentWorkspace: state.currentWorkspace,
        }),
      }
    ),
    {
      name: 'kairos-app-store',
    }
  )
)

// =============================================================================
// SELECTOR HOOKS
// =============================================================================

export const useAuth = () => useAppStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  login: state.login,
  logout: state.logout,
  updateUser: state.updateUser,
}))

export const useTheme = () => useAppStore((state) => ({
  theme: state.theme,
  isDarkMode: state.isDarkMode,
  customThemeColors: state.customThemeColors,
  setTheme: state.setTheme,
  toggleDarkMode: state.toggleDarkMode,
  setCustomThemeColors: state.setCustomThemeColors,
}))

export const useNotifications = () => useAppStore((state) => ({
  notifications: state.notifications,
  unreadCount: state.unreadCount,
  addNotification: state.addNotification,
  markNotificationAsRead: state.markNotificationAsRead,
  markAllNotificationsAsRead: state.markAllNotificationsAsRead,
  removeNotification: state.removeNotification,
  clearNotifications: state.clearNotifications,
}))

export const useTenant = () => useAppStore((state) => ({
  currentTenant: state.currentTenant,
  currentWorkspace: state.currentWorkspace,
  availableTenants: state.availableTenants,
  availableWorkspaces: state.availableWorkspaces,
  setCurrentTenant: state.setCurrentTenant,
  setCurrentWorkspace: state.setCurrentWorkspace,
}))

export const useUI = () => useAppStore((state) => ({
  isLoading: state.isLoading,
  isSidebarOpen: state.isSidebarOpen,
  isMobileMenuOpen: state.isMobileMenuOpen,
  loadingStates: state.loadingStates,
  setLoading: state.setLoading,
  setLoadingState: state.setLoadingState,
  toggleSidebar: state.toggleSidebar,
  toggleMobileMenu: state.toggleMobileMenu,
}))