// File: src/hooks/graphql/useAnalyticsQueries.ts
// 🎯 Block H4: GraphQL Integration - Custom Analytics Hooks
// React hooks for consuming Hades GraphQL APIs with efficient data fetching and caching
// * 📊 **Dashboard queries** with real-time updates
// * 📈 **Campaign analytics** with performance tracking
// * ⚛️ **Atom usage queries** with efficiency metrics
// * 🔄 **Real-time subscriptions** for live dashboard updates
// * 💾 **Optimistic updates** and error handling

import { 
  useQuery, 
  useMutation, 
  useSubscription, 
  useLazyQuery,
  QueryHookOptions,
  MutationHookOptions,
  SubscriptionHookOptions,
} from '@apollo/client'
import { useCallback, useEffect, useMemo } from 'react'
import { useAppStore } from '@/stores/appStore'
import { useAnalyticsStore } from '@/stores/analyticsStore'
import { 
  DASHBOARD_METRICS_QUERY,
  CAMPAIGN_PERFORMANCE_QUERY,
  ATOM_USAGE_STATS_QUERY,
  MOMENT_EFFECTIVENESS_QUERY,
  USER_INTERACTIONS_QUERY,
  DASHBOARD_UPDATES_SUBSCRIPTION,
  CAMPAIGN_UPDATES_SUBSCRIPTION,
  ATOM_UPDATES_SUBSCRIPTION,
  EXPORT_ANALYTICS_MUTATION,
  UPDATE_DASHBOARD_SETTINGS_MUTATION,
} from '@/graphql/analytics'

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

interface DashboardMetricsData {
  dashboardMetrics: {
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
    lastUpdated: string
  }
}

interface CampaignPerformanceData {
  campaignPerformance: Array<{
    id: string
    name: string
    momentsDelivered: number
    uniqueUsers: number
    conversionRate: number
    clickThroughRate: number
    impressions: number
    revenue: number
    cost: number
    roi: number
    status: string
    startDate: string
    endDate?: string
  }>
}

interface AtomUsageData {
  atomUsageStats: Array<{
    id: string
    name: string
    type: string
    usageCount: number
    successRate: number
    averageExecutionTime: number
    errorCount: number
    lastUsed: string
    popularityRank: number
    efficiency: number
  }>
}

interface TimeRangeInput {
  start: string
  end: string
}

interface AnalyticsFilters {
  timeRange: TimeRangeInput
  tenantIds?: string[]
  workspaceIds?: string[]
  campaignIds?: string[]
  atomTypes?: string[]
}

// =============================================================================
// DASHBOARD METRICS HOOK
// =============================================================================

export const useDashboardMetrics = (
  options?: QueryHookOptions<DashboardMetricsData>
) => {
  const { currentTenant } = useAppStore()
  const { filters } = useAnalyticsStore()
  
  const variables = useMemo(() => ({
    tenantId: currentTenant?.id,
    timeRange: {
      start: filters.timeRange.start.toISOString(),
      end: filters.timeRange.end.toISOString(),
    },
    workspaceId: filters.workspaceIds?.[0],
  }), [currentTenant?.id, filters.timeRange, filters.workspaceIds])
  
  const result = useQuery<DashboardMetricsData>(DASHBOARD_METRICS_QUERY, {
    variables,
    pollInterval: import.meta.env.VITE_ANALYTICS_REFRESH_INTERVAL || 30000,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    ...options,
  })
  
  // Update analytics store when data changes
  useEffect(() => {
    if (result.data?.dashboardMetrics) {
      const metrics = result.data.dashboardMetrics
      useAnalyticsStore.setState((state) => {
        state.dashboardMetrics = {
          ...metrics,
          lastUpdated: new Date(metrics.lastUpdated),
        }
        state.isLoadingDashboard = result.loading
        state.dashboardError = result.error?.message || null
      })
    }
  }, [result.data, result.loading, result.error])
  
  return {
    ...result,
    metrics: result.data?.dashboardMetrics,
    isLoading: result.loading,
    error: result.error,
    refetch: result.refetch,
  }
}

// =============================================================================
// CAMPAIGN PERFORMANCE HOOK
// =============================================================================

export const useCampaignPerformance = (
  options?: QueryHookOptions<CampaignPerformanceData>
) => {
  const { currentTenant } = useAppStore()
  const { filters } = useAnalyticsStore()
  
  const variables = useMemo(() => ({
    tenantId: currentTenant?.id,
    filters: {
      timeRange: {
        start: filters.timeRange.start.toISOString(),
        end: filters.timeRange.end.toISOString(),
      },
      campaignIds: filters.campaignIds.length > 0 ? filters.campaignIds : undefined,
      workspaceIds: filters.workspaceIds.length > 0 ? filters.workspaceIds : undefined,
    },
  }), [currentTenant?.id, filters])
  
  const result = useQuery<CampaignPerformanceData>(CAMPAIGN_PERFORMANCE_QUERY, {
    variables,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    ...options,
  })
  
  // Update analytics store
  useEffect(() => {
    if (result.data?.campaignPerformance) {
      useAnalyticsStore.setState((state) => {
        state.campaignPerformance = result.data!.campaignPerformance.map(campaign => ({
          campaignId: campaign.id,
          campaignName: campaign.name,
          momentsDelivered: campaign.momentsDelivered,
          uniqueUsers: campaign.uniqueUsers,
          conversionRate: campaign.conversionRate,
          clickThroughRate: campaign.clickThroughRate,
          impressions: campaign.impressions,
          revenue: campaign.revenue,
          cost: campaign.cost,
          roi: campaign.roi,
          status: campaign.status as any,
          startDate: new Date(campaign.startDate),
          endDate: campaign.endDate ? new Date(campaign.endDate) : undefined,
        }))
        state.isLoadingCampaigns = result.loading
        state.campaignError = result.error?.message || null
      })
    }
  }, [result.data, result.loading, result.error])
  
  return {
    ...result,
    campaigns: result.data?.campaignPerformance,
    isLoading: result.loading,
    error: result.error,
  }
}

// =============================================================================
// ATOM USAGE STATISTICS HOOK
// =============================================================================

export const useAtomUsageStats = (
  options?: QueryHookOptions<AtomUsageData>
) => {
  const { currentTenant } = useAppStore()
  const { filters, atomSortBy, atomSortOrder } = useAnalyticsStore()
  
  const variables = useMemo(() => ({
    tenantId: currentTenant?.id,
    filters: {
      timeRange: {
        start: filters.timeRange.start.toISOString(),
        end: filters.timeRange.end.toISOString(),
      },
      atomTypes: filters.atomTypes.length > 0 ? filters.atomTypes : undefined,
    },
    sortBy: atomSortBy,
    sortOrder: atomSortOrder.toUpperCase(),
    limit: 50, // Limit to top 50 atoms
  }), [currentTenant?.id, filters, atomSortBy, atomSortOrder])
  
  const result = useQuery<AtomUsageData>(ATOM_USAGE_STATS_QUERY, {
    variables,
    errorPolicy: 'all',
    notifyOnNetworkStatusChange: true,
    ...options,
  })
  
  // Update analytics store
  useEffect(() => {
    if (result.data?.atomUsageStats) {
      useAnalyticsStore.setState((state) => {
        state.atomUsageStats = result.data!.atomUsageStats.map(atom => ({
          atomId: atom.id,
          atomName: atom.name,
          atomType: atom.type,
          usageCount: atom.usageCount,
          successRate: atom.successRate,
          averageExecutionTime: atom.averageExecutionTime,
          errorCount: atom.errorCount,
          lastUsed: new Date(atom.lastUsed),
          popularityRank: atom.popularityRank,
          efficiency: atom.efficiency,
        }))
        state.isLoadingAtoms = result.loading
        state.atomError = result.error?.message || null
      })
    }
  }, [result.data, result.loading, result.error])
  
  return {
    ...result,
    atoms: result.data?.atomUsageStats,
    isLoading: result.loading,
    error: result.error,
  }
}

// =============================================================================
// REAL-TIME DASHBOARD SUBSCRIPTION HOOK
// =============================================================================

export const useDashboardUpdates = (
  options?: SubscriptionHookOptions
) => {
  const { currentTenant } = useAppStore()
  const { realTimeEnabled } = useAnalyticsStore()
  
  const variables = useMemo(() => ({
    tenantId: currentTenant?.id,
  }), [currentTenant?.id])
  
  const subscription = useSubscription(DASHBOARD_UPDATES_SUBSCRIPTION, {
    variables,
    skip: !realTimeEnabled || !currentTenant?.id,
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.dashboardUpdates) {
        const updates = subscriptionData.data.dashboardUpdates
        
        // Update analytics store with real-time data
        useAnalyticsStore.setState((state) => {
          if (state.dashboardMetrics) {
            Object.assign(state.dashboardMetrics, updates)
            state.dashboardMetrics.lastUpdated = new Date()
          }
          state.lastRefresh = new Date()
        })
        
        // Show notification for significant changes
        if (updates.significantChange) {
          useAppStore.getState().addNotification({
            type: 'info',
            title: 'Dashboard Updated',
            message: 'New analytics data is available',
          })
        }
      }
    },
    onSubscriptionComplete: () => {
      console.log('Dashboard subscription completed')
    },
    onError: (error) => {
      console.error('Dashboard subscription error:', error)
      useAppStore.getState().addNotification({
        type: 'warning',
        title: 'Real-time Updates',
        message: 'Connection to real-time updates lost. Retrying...',
      })
    },
    ...options,
  })
  
  return {
    data: subscription.data,
    loading: subscription.loading,
    error: subscription.error,
  }
}

// =============================================================================
// CAMPAIGN UPDATES SUBSCRIPTION HOOK
// =============================================================================

export const useCampaignUpdates = (
  campaignId?: string,
  options?: SubscriptionHookOptions
) => {
  const { currentTenant } = useAppStore()
  const { realTimeEnabled } = useAnalyticsStore()
  
  const variables = useMemo(() => ({
    tenantId: currentTenant?.id,
    campaignId,
  }), [currentTenant?.id, campaignId])
  
  return useSubscription(CAMPAIGN_UPDATES_SUBSCRIPTION, {
    variables,
    skip: !realTimeEnabled || !currentTenant?.id,
    onSubscriptionData: ({ subscriptionData }) => {
      if (subscriptionData.data?.campaignUpdates) {
        const updates = subscriptionData.data.campaignUpdates
        
        // Update specific campaign in analytics store
        useAnalyticsStore.setState((state) => {
          const campaignIndex = state.campaignPerformance.findIndex(
            c => c.campaignId === updates.campaignId
          )
          
          if (campaignIndex !== -1) {
            Object.assign(state.campaignPerformance[campaignIndex], updates.metrics)
          }
        })
      }
    },
    ...options,
  })
}

// =============================================================================
// LAZY QUERY HOOKS FOR ON-DEMAND DATA
// =============================================================================

export const useExportAnalytics = () => {
  const [exportMutation, { data, loading, error }] = useMutation(
    EXPORT_ANALYTICS_MUTATION
  )
  
  const exportData = useCallback(async (
    dataType: string,
    format: 'CSV' | 'EXCEL' | 'PDF' | 'JSON',
    filters: AnalyticsFilters
  ) => {
    try {
      const result = await exportMutation({
        variables: {
          input: {
            dataType,
            format,
            filters,
          },
        },
      })
      
      if (result.data?.exportAnalytics?.downloadUrl) {
        // Trigger download
        const link = document.createElement('a')
        link.href = result.data.exportAnalytics.downloadUrl
        link.download = result.data.exportAnalytics.filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        
        useAppStore.getState().addNotification({
          type: 'success',
          title: 'Export Complete',
          message: `Your ${dataType} report has been downloaded`,
        })
      }
      
      return result
    } catch (error) {
      useAppStore.getState().addNotification({
        type: 'error',
        title: 'Export Failed',
        message: 'Failed to export analytics data',
      })
      throw error
    }
  }, [exportMutation])
  
  return {
    exportData,
    loading,
    error,
  }
}

// =============================================================================
// DASHBOARD SETTINGS MUTATION
// =============================================================================

export const useDashboardSettings = () => {
  const [updateSettings, { loading, error }] = useMutation(
    UPDATE_DASHBOARD_SETTINGS_MUTATION
  )
  
  const updateDashboardSettings = useCallback(async (settings: {
    refreshInterval?: number
    defaultTimeRange?: string
    enableRealTime?: boolean
    chartSettings?: Record<string, any>
  }) => {
    try {
      const result = await updateSettings({
        variables: {
          input: settings,
        },
        optimisticResponse: {
          updateDashboardSettings: {
            __typename: 'DashboardSettings',
            ...settings,
          },
        },
      })
      
      useAppStore.getState().addNotification({
        type: 'success',
        title: 'Settings Updated',
        message: 'Dashboard settings have been saved',
      })
      
      return result
    } catch (error) {
      useAppStore.getState().addNotification({
        type: 'error',
        title: 'Settings Error',
        message: 'Failed to update dashboard settings',
      })
      throw error
    }
  }, [updateSettings])
  
  return {
    updateDashboardSettings,
    loading,
    error,
  }
}

// =============================================================================
// COMBINED ANALYTICS HOOK
// =============================================================================

export const useAnalytics = () => {
  const dashboardMetrics = useDashboardMetrics()
  const campaignPerformance = useCampaignPerformance()
  const atomUsageStats = useAtomUsageStats()
  const dashboardUpdates = useDashboardUpdates()
  const exportAnalytics = useExportAnalytics()
  
  const isLoading = useMemo(() => 
    dashboardMetrics.loading || 
    campaignPerformance.loading || 
    atomUsageStats.loading,
    [dashboardMetrics.loading, campaignPerformance.loading, atomUsageStats.loading]
  )
  
  const hasError = useMemo(() => 
    dashboardMetrics.error || 
    campaignPerformance.error || 
    atomUsageStats.error,
    [dashboardMetrics.error, campaignPerformance.error, atomUsageStats.error]
  )
  
  const refetchAll = useCallback(async () => {
    await Promise.all([
      dashboardMetrics.refetch(),
      campaignPerformance.refetch(),
      atomUsageStats.refetch(),
    ])
  }, [dashboardMetrics.refetch, campaignPerformance.refetch, atomUsageStats.refetch])
  
  return {
    // Individual query results
    dashboardMetrics,
    campaignPerformance,
    atomUsageStats,
    
    // Real-time updates
    dashboardUpdates,
    
    // Actions
    exportAnalytics,
    refetchAll,
    
    // Combined states
    isLoading,
    hasError,
  }
}