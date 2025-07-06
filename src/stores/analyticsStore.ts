// File: src/stores/analyticsStore.ts
// 🎯 Block H2: State Management - Analytics Dashboard Store
// Specialized Zustand store for analytics data and dashboard state management
// * 📊 **Real-time metrics** from Hades analytics APIs
// * 📈 **Campaign performance** tracking and visualization
// * ⚛️ **Atom usage statistics** and efficiency metrics
// * 🎯 **Moment effectiveness** tracking
// * 📅 **Time-series data** management with caching

import { create } from 'zustand'
import { devtools, subscribeWithSelector } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export interface AnalyticsTimeRange {
  start: Date
  end: Date
  preset: 'last_hour' | 'last_24h' | 'last_7d' | 'last_30d' | 'last_90d' | 'custom'
}

export interface DashboardMetrics {
  totalCampaigns: number
  activeCampaigns: number
  totalMoments: number
  activeMoments: number
  totalAtoms: number
  activeAtoms: number
  decisionsToday: number
  averageResponseTime: number
  successRate: number
  errorRate: number
  lastUpdated: Date
}

export interface CampaignPerformance {
  campaignId: string
  campaignName: string
  momentsDelivered: number
  uniqueUsers: number
  conversionRate: number
  clickThroughRate: number
  impressions: number
  revenue: number
  cost: number
  roi: number
  status: 'active' | 'paused' | 'completed' | 'draft'
  startDate: Date
  endDate?: Date
}

export interface AtomUsageStats {
  atomId: string
  atomName: string
  atomType: string
  usageCount: number
  successRate: number
  averageExecutionTime: number
  errorCount: number
  lastUsed: Date
  popularityRank: number
  efficiency: number
}

export interface MomentEffectiveness {
  momentId: string
  momentName: string
  deliveryCount: number
  engagementRate: number
  conversionRate: number
  averageTimeToConversion: number
  bounceRate: number
  revenue: number
  cost: number
  profitability: number
  audiences: string[]
  channels: string[]
}

export interface UserInteractionData {
  userId: string
  sessionId: string
  timestamp: Date
  action: string
  componentId: string
  metadata: Record<string, any>
  tenantId: string
  workspaceId: string
}

export interface TimeSeriesData {
  timestamp: Date
  value: number
  label?: string
  metadata?: Record<string, any>
}

export interface ChartData {
  id: string
  title: string
  type: 'line' | 'bar' | 'area' | 'pie' | 'donut' | 'funnel'
  data: TimeSeriesData[]
  loading: boolean
  error: string | null
  lastUpdated: Date
  refreshInterval?: number
}

export interface FilterState {
  timeRange: AnalyticsTimeRange
  tenantIds: string[]
  workspaceIds: string[]
  campaignIds: string[]
  atomTypes: string[]
  channels: string[]
  audiences: string[]
  customFilters: Record<string, any>
}

export interface AnalyticsState {
  // =============================================================================
  // DASHBOARD STATE
  // =============================================================================
  dashboardMetrics: DashboardMetrics | null
  isLoadingDashboard: boolean
  dashboardError: string | null
  
  // =============================================================================
  // CAMPAIGN ANALYTICS
  // =============================================================================
  campaignPerformance: CampaignPerformance[]
  isLoadingCampaigns: boolean
  campaignError: string | null
  selectedCampaignId: string | null
  
  // =============================================================================
  // ATOM ANALYTICS
  // =============================================================================
  atomUsageStats: AtomUsageStats[]
  isLoadingAtoms: boolean
  atomError: string | null
  atomSortBy: 'usage' | 'efficiency' | 'popularity' | 'name'
  atomSortOrder: 'asc' | 'desc'
  
  // =============================================================================
  // MOMENT ANALYTICS
  // =============================================================================
  momentEffectiveness: MomentEffectiveness[]
  isLoadingMoments: boolean
  momentError: string | null
  
  // =============================================================================
  // USER INTERACTION ANALYTICS
  // =============================================================================
  userInteractions: UserInteractionData[]
  isLoadingInteractions: boolean
  interactionError: string | null
  
  // =============================================================================
  // CHART DATA
  // =============================================================================
  charts: Record<string, ChartData>
  
  // =============================================================================
  // FILTERS & SETTINGS
  // =============================================================================
  filters: FilterState
  
  // =============================================================================
  // REAL-TIME SETTINGS
  // =============================================================================
  realTimeEnabled: boolean
  refreshInterval: number
  lastRefresh: Date | null
  
  // =============================================================================
  // EXPORT & REPORTING
  // =============================================================================
  isExporting: boolean
  exportFormat: 'csv' | 'excel' | 'pdf' | 'json'
  reportSchedules: string[]
}

export interface AnalyticsActions {
  // =============================================================================
  // DASHBOARD ACTIONS
  // =============================================================================
  loadDashboardMetrics: () => Promise<void>
  refreshDashboard: () => Promise<void>
  
  // =============================================================================
  // CAMPAIGN ACTIONS
  // =============================================================================
  loadCampaignPerformance: () => Promise<void>
  selectCampaign: (campaignId: string | null) => void
  sortCampaigns: (sortBy: string, order: 'asc' | 'desc') => void
  
  // =============================================================================
  // ATOM ACTIONS
  // =============================================================================
  loadAtomUsageStats: () => Promise<void>
  sortAtoms: (sortBy: 'usage' | 'efficiency' | 'popularity' | 'name', order: 'asc' | 'desc') => void
  
  // =============================================================================
  // MOMENT ACTIONS
  // =============================================================================
  loadMomentEffectiveness: () => Promise<void>
  
  // =============================================================================
  // USER INTERACTION ACTIONS
  // =============================================================================
  loadUserInteractions: () => Promise<void>
  trackUserInteraction: (interaction: Omit<UserInteractionData, 'timestamp' | 'userId' | 'sessionId'>) => void
  
  // =============================================================================
  // CHART ACTIONS
  // =============================================================================
  addChart: (chart: Omit<ChartData, 'loading' | 'error' | 'lastUpdated'>) => void
  updateChart: (chartId: string, data: TimeSeriesData[]) => void
  removeChart: (chartId: string) => void
  refreshChart: (chartId: string) => Promise<void>
  
  // =============================================================================
  // FILTER ACTIONS
  // =============================================================================
  setTimeRange: (timeRange: AnalyticsTimeRange) => void
  setFilters: (filters: Partial<FilterState>) => void
  clearFilters: () => void
  applyFilters: () => Promise<void>
  
  // =============================================================================
  // REAL-TIME ACTIONS
  // =============================================================================
  enableRealTime: () => void
  disableRealTime: () => void
  setRefreshInterval: (interval: number) => void
  
  // =============================================================================
  // EXPORT ACTIONS
  // =============================================================================
  exportData: (format: 'csv' | 'excel' | 'pdf' | 'json', dataType: string) => Promise<void>
  scheduleReport: (schedule: string) => void
}

// =============================================================================
// INITIAL STATE
// =============================================================================

const initialTimeRange: AnalyticsTimeRange = {
  start: new Date(Date.now() - 24 * 60 * 60 * 1000), // Last 24 hours
  end: new Date(),
  preset: 'last_24h'
}

const initialFilters: FilterState = {
  timeRange: initialTimeRange,
  tenantIds: [],
  workspaceIds: [],
  campaignIds: [],
  atomTypes: [],
  channels: [],
  audiences: [],
  customFilters: {}
}

// =============================================================================
// STORE IMPLEMENTATION
// =============================================================================

export const useAnalyticsStore = create<AnalyticsState & AnalyticsActions>()(
  devtools(
    subscribeWithSelector(
      immer((set, get) => ({
        // =============================================================================
        // INITIAL STATE
        // =============================================================================
        dashboardMetrics: null,
        isLoadingDashboard: false,
        dashboardError: null,
        
        campaignPerformance: [],
        isLoadingCampaigns: false,
        campaignError: null,
        selectedCampaignId: null,
        
        atomUsageStats: [],
        isLoadingAtoms: false,
        atomError: null,
        atomSortBy: 'usage',
        atomSortOrder: 'desc',
        
        momentEffectiveness: [],
        isLoadingMoments: false,
        momentError: null,
        
        userInteractions: [],
        isLoadingInteractions: false,
        interactionError: null,
        
        charts: {},
        
        filters: initialFilters,
        
        realTimeEnabled: import.meta.env.VITE_ENABLE_REAL_TIME_ANALYTICS === 'true',
        refreshInterval: parseInt(import.meta.env.VITE_ANALYTICS_REFRESH_INTERVAL) || 30000,
        lastRefresh: null,
        
        isExporting: false,
        exportFormat: 'csv',
        reportSchedules: [],
        
        // =============================================================================
        // DASHBOARD ACTIONS
        // =============================================================================
        loadDashboardMetrics: async () => {
          set((state) => {
            state.isLoadingDashboard = true
            state.dashboardError = null
          })
          
          try {
            // This would call your Hades analytics API
            const response = await fetch('/api/v1/analytics/dashboard', {
              headers: {
                'X-Tenant-ID': get().filters.tenantIds[0] || '',
                'Content-Type': 'application/json'
              }
            })
            
            if (!response.ok) {
              throw new Error(`Dashboard API error: ${response.status}`)
            }
            
            const metrics = await response.json()
            
            set((state) => {
              state.dashboardMetrics = {
                ...metrics,
                lastUpdated: new Date()
              }
              state.isLoadingDashboard = false
              state.lastRefresh = new Date()
            })
          } catch (error) {
            set((state) => {
              state.dashboardError = error instanceof Error ? error.message : 'Failed to load dashboard metrics'
              state.isLoadingDashboard = false
            })
          }
        },
        
        refreshDashboard: async () => {
          await get().loadDashboardMetrics()
        },
        
        // =============================================================================
        // CAMPAIGN ACTIONS
        // =============================================================================
        loadCampaignPerformance: async () => {
          set((state) => {
            state.isLoadingCampaigns = true
            state.campaignError = null
          })
          
          try {
            const { timeRange } = get().filters
            const queryParams = new URLSearchParams({
              startDate: timeRange.start.toISOString(),
              endDate: timeRange.end.toISOString()
            })
            
            const response = await fetch(`/api/v1/analytics/campaigns?${queryParams}`, {
              headers: {
                'X-Tenant-ID': get().filters.tenantIds[0] || '',
                'Content-Type': 'application/json'
              }
            })
            
            if (!response.ok) {
              throw new Error(`Campaign API error: ${response.status}`)
            }
            
            const campaigns = await response.json()
            
            set((state) => {
              state.campaignPerformance = campaigns
              state.isLoadingCampaigns = false
            })
          } catch (error) {
            set((state) => {
              state.campaignError = error instanceof Error ? error.message : 'Failed to load campaign performance'
              state.isLoadingCampaigns = false
            })
          }
        },
        
        selectCampaign: (campaignId) => {
          set((state) => {
            state.selectedCampaignId = campaignId
          })
        },
        
        sortCampaigns: (sortBy, order) => {
          set((state) => {
            state.campaignPerformance.sort((a, b) => {
              const aVal = a[sortBy as keyof CampaignPerformance]
              const bVal = b[sortBy as keyof CampaignPerformance]
              
              if (typeof aVal === 'number' && typeof bVal === 'number') {
                return order === 'asc' ? aVal - bVal : bVal - aVal
              }
              
              if (typeof aVal === 'string' && typeof bVal === 'string') {
                return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
              }
              
              return 0
            })
          })
        },
        
        // =============================================================================
        // ATOM ACTIONS
        // =============================================================================
        loadAtomUsageStats: async () => {
          set((state) => {
            state.isLoadingAtoms = true
            state.atomError = null
          })
          
          try {
            const response = await fetch('/api/v1/analytics/atoms', {
              headers: {
                'X-Tenant-ID': get().filters.tenantIds[0] || '',
                'Content-Type': 'application/json'
              }
            })
            
            if (!response.ok) {
              throw new Error(`Atom API error: ${response.status}`)
            }
            
            const atoms = await response.json()
            
            set((state) => {
              state.atomUsageStats = atoms
              state.isLoadingAtoms = false
            })
          } catch (error) {
            set((state) => {
              state.atomError = error instanceof Error ? error.message : 'Failed to load atom usage stats'
              state.isLoadingAtoms = false
            })
          }
        },
        
        sortAtoms: (sortBy, order) => {
          set((state) => {
            state.atomSortBy = sortBy
            state.atomSortOrder = order
            
            state.atomUsageStats.sort((a, b) => {
              const aVal = a[sortBy]
              const bVal = b[sortBy]
              
              if (typeof aVal === 'number' && typeof bVal === 'number') {
                return order === 'asc' ? aVal - bVal : bVal - aVal
              }
              
              if (typeof aVal === 'string' && typeof bVal === 'string') {
                return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal)
              }
              
              return 0
            })
          })
        },
        
        // =============================================================================
        // MOMENT ACTIONS
        // =============================================================================
        loadMomentEffectiveness: async () => {
          set((state) => {
            state.isLoadingMoments = true
            state.momentError = null
          })
          
          try {
            const response = await fetch('/api/v1/analytics/moments', {
              headers: {
                'X-Tenant-ID': get().filters.tenantIds[0] || '',
                'Content-Type': 'application/json'
              }
            })
            
            if (!response.ok) {
              throw new Error(`Moment API error: ${response.status}`)
            }
            
            const moments = await response.json()
            
            set((state) => {
              state.momentEffectiveness = moments
              state.isLoadingMoments = false
            })
          } catch (error) {
            set((state) => {
              state.momentError = error instanceof Error ? error.message : 'Failed to load moment effectiveness'
              state.isLoadingMoments = false
            })
          }
        },
        
        // =============================================================================
        // USER INTERACTION ACTIONS
        // =============================================================================
        loadUserInteractions: async () => {
          set((state) => {
            state.isLoadingInteractions = true
            state.interactionError = null
          })
          
          try {
            const response = await fetch('/api/v1/analytics/interactions', {
              headers: {
                'X-Tenant-ID': get().filters.tenantIds[0] || '',
                'Content-Type': 'application/json'
              }
            })
            
            if (!response.ok) {
              throw new Error(`Interaction API error: ${response.status}`)
            }
            
            const interactions = await response.json()
            
            set((state) => {
              state.userInteractions = interactions
              state.isLoadingInteractions = false
            })
          } catch (error) {
            set((state) => {
              state.interactionError = error instanceof Error ? error.message : 'Failed to load user interactions'
              state.isLoadingInteractions = false
            })
          }
        },
        
        trackUserInteraction: (interaction) => {
          const fullInteraction: UserInteractionData = {
            ...interaction,
            userId: 'current-user-id', // Get from auth store
            sessionId: 'current-session-id', // Get from session
            timestamp: new Date()
          }
          
          set((state) => {
            state.userInteractions.unshift(fullInteraction)
            
            // Keep only last 1000 interactions in memory
            if (state.userInteractions.length > 1000) {
              state.userInteractions = state.userInteractions.slice(0, 1000)
            }
          })
          
          // Send to analytics API asynchronously
          fetch('/api/v1/analytics/interactions', {
            method: 'POST',
            headers: {
              'X-Tenant-ID': interaction.tenantId,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify(fullInteraction)
          }).catch(console.error) // Silent fail for tracking
        },
        
        // =============================================================================
        // CHART ACTIONS
        // =============================================================================
        addChart: (chart) => {
          set((state) => {
            state.charts[chart.id] = {
              ...chart,
              loading: false,
              error: null,
              lastUpdated: new Date()
            }
          })
        },
        
        updateChart: (chartId, data) => {
          set((state) => {
            if (state.charts[chartId]) {
              state.charts[chartId].data = data
              state.charts[chartId].lastUpdated = new Date()
              state.charts[chartId].loading = false
              state.charts[chartId].error = null
            }
          })
        },
        
        removeChart: (chartId) => {
          set((state) => {
            delete state.charts[chartId]
          })
        },
        
        refreshChart: async (chartId) => {
          const chart = get().charts[chartId]
          if (!chart) return
          
          set((state) => {
            state.charts[chartId].loading = true
            state.charts[chartId].error = null
          })
          
          try {
            // This would call specific chart data API based on chart type
            const response = await fetch(`/api/v1/analytics/charts/${chartId}`, {
              headers: {
                'X-Tenant-ID': get().filters.tenantIds[0] || '',
                'Content-Type': 'application/json'
              }
            })
            
            if (!response.ok) {
              throw new Error(`Chart API error: ${response.status}`)
            }
            
            const data = await response.json()
            get().updateChart(chartId, data)
          } catch (error) {
            set((state) => {
              state.charts[chartId].error = error instanceof Error ? error.message : 'Failed to refresh chart'
              state.charts[chartId].loading = false
            })
          }
        },
        
        // =============================================================================
        // FILTER ACTIONS
        // =============================================================================
        setTimeRange: (timeRange) => {
          set((state) => {
            state.filters.timeRange = timeRange
          })
        },
        
        setFilters: (filters) => {
          set((state) => {
            Object.assign(state.filters, filters)
          })
        },
        
        clearFilters: () => {
          set((state) => {
            state.filters = initialFilters
          })
        },
        
        applyFilters: async () => {
          // Reload all data with new filters
          await Promise.all([
            get().loadDashboardMetrics(),
            get().loadCampaignPerformance(),
            get().loadAtomUsageStats(),
            get().loadMomentEffectiveness(),
            get().loadUserInteractions()
          ])
        },
        
        // =============================================================================
        // REAL-TIME ACTIONS
        // =============================================================================
        enableRealTime: () => {
          set((state) => {
            state.realTimeEnabled = true
          })
        },
        
        disableRealTime: () => {
          set((state) => {
            state.realTimeEnabled = false
          })
        },
        
        setRefreshInterval: (interval) => {
          set((state) => {
            state.refreshInterval = interval
          })
        },
        
        // =============================================================================
        // EXPORT ACTIONS
        // =============================================================================
        exportData: async (format, dataType) => {
          set((state) => {
            state.isExporting = true
            state.exportFormat = format
          })
          
          try {
            const response = await fetch(`/api/v1/analytics/export/${dataType}`, {
              method: 'POST',
              headers: {
                'X-Tenant-ID': get().filters.tenantIds[0] || '',
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({
                format,
                filters: get().filters,
                timeRange: get().filters.timeRange
              })
            })
            
            if (!response.ok) {
              throw new Error(`Export API error: ${response.status}`)
            }
            
            // Handle file download
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const a = document.createElement('a')
            a.href = url
            a.download = `kairos-${dataType}-${new Date().toISOString().split('T')[0]}.${format}`
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
            window.URL.revokeObjectURL(url)
            
            set((state) => {
              state.isExporting = false
            })
          } catch (error) {
            set((state) => {
              state.isExporting = false
            })
            throw error
          }
        },
        
        scheduleReport: (schedule) => {
          set((state) => {
            if (!state.reportSchedules.includes(schedule)) {
              state.reportSchedules.push(schedule)
            }
          })
        },
      }))
    ),
    {
      name: 'kairos-analytics-store',
    }
  )
)

// =============================================================================
// SELECTOR HOOKS
// =============================================================================

export const useDashboard = () => useAnalyticsStore((state) => ({
  metrics: state.dashboardMetrics,
  isLoading: state.isLoadingDashboard,
  error: state.dashboardError,
  loadDashboardMetrics: state.loadDashboardMetrics,
  refreshDashboard: state.refreshDashboard,
}))

export const useCampaignAnalytics = () => useAnalyticsStore((state) => ({
  campaigns: state.campaignPerformance,
  isLoading: state.isLoadingCampaigns,
  error: state.campaignError,
  selectedCampaignId: state.selectedCampaignId,
  loadCampaignPerformance: state.loadCampaignPerformance,
  selectCampaign: state.selectCampaign,
  sortCampaigns: state.sortCampaigns,
}))

export const useAtomAnalytics = () => useAnalyticsStore((state) => ({
  atoms: state.atomUsageStats,
  isLoading: state.isLoadingAtoms,
  error: state.atomError,
  sortBy: state.atomSortBy,
  sortOrder: state.atomSortOrder,
  loadAtomUsageStats: state.loadAtomUsageStats,
  sortAtoms: state.sortAtoms,
}))

export const useMomentAnalytics = () => useAnalyticsStore((state) => ({
  moments: state.momentEffectiveness,
  isLoading: state.isLoadingMoments,
  error: state.momentError,
  loadMomentEffectiveness: state.loadMomentEffectiveness,
}))

export const useAnalyticsFilters = () => useAnalyticsStore((state) => ({
  filters: state.filters,
  setTimeRange: state.setTimeRange,
  setFilters: state.setFilters,
  clearFilters: state.clearFilters,
  applyFilters: state.applyFilters,
}))

export const useRealTimeAnalytics = () => useAnalyticsStore((state) => ({
  realTimeEnabled: state.realTimeEnabled,
  refreshInterval: state.refreshInterval,
  lastRefresh: state.lastRefresh,
  enableRealTime: state.enableRealTime,
  disableRealTime: state.disableRealTime,
  setRefreshInterval: state.setRefreshInterval,
}))

export const useAnalyticsExport = () => useAnalyticsStore((state) => ({
  isExporting: state.isExporting,
  exportFormat: state.exportFormat,
  exportData: state.exportData,
  scheduleReport: state.scheduleReport,
}))

// =============================================================================
// REAL-TIME SUBSCRIPTION HOOK
// =============================================================================

export const useAnalyticsSubscription = () => {
  const { realTimeEnabled, refreshInterval } = useRealTimeAnalytics()
  const { refreshDashboard } = useDashboard()
  
  // Set up automatic refresh when real-time is enabled
  React.useEffect(() => {
    if (!realTimeEnabled) return
    
    const interval = setInterval(() => {
      refreshDashboard()
    }, refreshInterval)
    
    return () => clearInterval(interval)
  }, [realTimeEnabled, refreshInterval, refreshDashboard])
}