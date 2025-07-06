// File: src/graphql/analytics.ts
// 🎯 Block H4: GraphQL Integration - Analytics Query Definitions
// Complete GraphQL queries and mutations for Hades analytics APIs
// * 📊 **Dashboard queries** for metrics and KPIs
// * 📈 **Campaign performance** queries with filtering
// * ⚛️ **Atom usage statistics** with efficiency metrics
// * 🔄 **Real-time subscriptions** for live updates
// * 📤 **Export mutations** for data download

import { gql } from '@apollo/client'

// =============================================================================
// FRAGMENT DEFINITIONS
// =============================================================================

export const DASHBOARD_METRICS_FRAGMENT = gql`
  fragment DashboardMetricsFields on DashboardMetrics {
    totalCampaigns
    activeCampaigns
    totalMoments
    activeMoments
    totalAtoms
    activeAtoms
    decisionsToday
    averageResponseTime
    successRate
    errorRate
    lastUpdated
    trends {
      campaignGrowth
      decisionVelocity
      successRateTrend
      responseTimeTrend
    }
  }
`

export const CAMPAIGN_PERFORMANCE_FRAGMENT = gql`
  fragment CampaignPerformanceFields on CampaignPerformance {
    id
    name
    description
    status
    startDate
    endDate
    momentsDelivered
    uniqueUsers
    impressions
    clicks
    conversions
    conversionRate
    clickThroughRate
    revenue
    cost
    roi
    efficiency
    channels
    audiences
    lastActivity
    performance {
      hourly
      daily
      weekly
    }
  }
`

export const ATOM_USAGE_FRAGMENT = gql`
  fragment AtomUsageFields on AtomUsageStats {
    id
    name
    type
    category
    description
    usageCount
    successRate
    errorCount
    averageExecutionTime
    minExecutionTime
    maxExecutionTime
    lastUsed
    popularityRank
    efficiency
    performanceScore
    trends {
      usageTrend
      performanceTrend
      errorTrend
    }
    relatedAtoms {
      id
      name
      relationshipType
    }
  }
`

export const MOMENT_EFFECTIVENESS_FRAGMENT = gql`
  fragment MomentEffectivenessFields on MomentEffectiveness {
    id
    name
    type
    description
    deliveryCount
    uniqueRecipients
    engagementRate
    conversionRate
    averageTimeToConversion
    bounceRate
    revenue
    cost
    profitability
    channels
    audiences
    lastDelivery
    performance {
      byChannel
      byAudience
      byTimeOfDay
      byDayOfWeek
    }
  }
`

export const TIME_SERIES_FRAGMENT = gql`
  fragment TimeSeriesFields on TimeSeriesData {
    timestamp
    value
    label
    metadata
    aggregationType
  }
`

export const USER_INTERACTION_FRAGMENT = gql`
  fragment UserInteractionFields on UserInteraction {
    id
    userId
    sessionId
    timestamp
    action
    componentId
    componentType
    metadata
    tenantId
    workspaceId
    duration
    success
  }
`

// =============================================================================
// DASHBOARD QUERIES
// =============================================================================

export const DASHBOARD_METRICS_QUERY = gql`
  ${DASHBOARD_METRICS_FRAGMENT}
  query GetDashboardMetrics(
    $tenantId: ID!
    $timeRange: TimeRangeInput!
    $workspaceId: ID
  ) {
    dashboardMetrics(
      tenantId: $tenantId
      timeRange: $timeRange
      workspaceId: $workspaceId
    ) {
      ...DashboardMetricsFields
    }
  }
`

export const DASHBOARD_OVERVIEW_QUERY = gql`
  ${DASHBOARD_METRICS_FRAGMENT}
  ${TIME_SERIES_FRAGMENT}
  query GetDashboardOverview(
    $tenantId: ID!
    $timeRange: TimeRangeInput!
    $workspaceId: ID
  ) {
    dashboardMetrics(
      tenantId: $tenantId
      timeRange: $timeRange
      workspaceId: $workspaceId
    ) {
      ...DashboardMetricsFields
    }
    
    performanceTrends(
      tenantId: $tenantId
      timeRange: $timeRange
      workspaceId: $workspaceId
    ) {
      ...TimeSeriesFields
    }
    
    topPerformingCampaigns(
      tenantId: $tenantId
      timeRange: $timeRange
      limit: 5
    ) {
      id
      name
      roi
      conversionRate
      revenue
    }
    
    topUsedAtoms(
      tenantId: $tenantId
      timeRange: $timeRange
      limit: 10
    ) {
      id
      name
      usageCount
      successRate
      efficiency
    }
  }
`

// =============================================================================
// CAMPAIGN ANALYTICS QUERIES
// =============================================================================

export const CAMPAIGN_PERFORMANCE_QUERY = gql`
  ${CAMPAIGN_PERFORMANCE_FRAGMENT}
  query GetCampaignPerformance(
    $tenantId: ID!
    $filters: AnalyticsFiltersInput!
    $sortBy: CampaignSortField = ROI
    $sortOrder: SortOrder = DESC
    $limit: Int = 50
    $offset: Int = 0
  ) {
    campaignPerformance(
      tenantId: $tenantId
      filters: $filters
      sortBy: $sortBy
      sortOrder: $sortOrder
      limit: $limit
      offset: $offset
    ) {
      totalCount
      campaigns {
        ...CampaignPerformanceFields
      }
      aggregations {
        totalRevenue
        totalCost
        averageROI
        averageConversionRate
        totalImpressions
        totalClicks
      }
    }
  }
`

export const CAMPAIGN_DETAILS_QUERY = gql`
  ${CAMPAIGN_PERFORMANCE_FRAGMENT}
  ${TIME_SERIES_FRAGMENT}
  query GetCampaignDetails(
    $campaignId: ID!
    $tenantId: ID!
    $timeRange: TimeRangeInput!
  ) {
    campaign(id: $campaignId, tenantId: $tenantId) {
      ...CampaignPerformanceFields
      
      moments {
        id
        name
        deliveryCount
        engagementRate
        conversionRate
      }
      
      atoms {
        id
        name
        usageCount
        successRate
        averageExecutionTime
      }
      
      performanceTimeSeries(timeRange: $timeRange) {
        impressions: ...TimeSeriesFields
        clicks: ...TimeSeriesFields
        conversions: ...TimeSeriesFields
        revenue: ...TimeSeriesFields
      }
      
      audienceBreakdown {
        audienceId
        audienceName
        impressions
        conversions
        conversionRate
        revenue
      }
      
      channelBreakdown {
        channel
        impressions
        conversions
        conversionRate
        revenue
        cost
      }
    }
  }
`

// =============================================================================
// ATOM ANALYTICS QUERIES
// =============================================================================

export const ATOM_USAGE_STATS_QUERY = gql`
  ${ATOM_USAGE_FRAGMENT}
  query GetAtomUsageStats(
    $tenantId: ID!
    $filters: AnalyticsFiltersInput!
    $sortBy: AtomSortField = USAGE_COUNT
    $sortOrder: SortOrder = DESC
    $limit: Int = 50
  ) {
    atomUsageStats(
      tenantId: $tenantId
      filters: $filters
      sortBy: $sortBy
      sortOrder: $sortOrder
      limit: $limit
    ) {
      totalCount
      atoms {
        ...AtomUsageFields
      }
      aggregations {
        totalUsage
        averageSuccessRate
        averageExecutionTime
        mostPopularType
        leastUsedType
      }
    }
  }
`

export const ATOM_PERFORMANCE_DETAILS_QUERY = gql`
  ${ATOM_USAGE_FRAGMENT}
  ${TIME_SERIES_FRAGMENT}
  query GetAtomPerformanceDetails(
    $atomId: ID!
    $tenantId: ID!
    $timeRange: TimeRangeInput!
  ) {
    atom(id: $atomId, tenantId: $tenantId) {
      ...AtomUsageFields
      
      usageTimeSeries(timeRange: $timeRange) {
        ...TimeSeriesFields
      }
      
      performanceTimeSeries(timeRange: $timeRange) {
        successRate: ...TimeSeriesFields
        executionTime: ...TimeSeriesFields
        errorRate: ...TimeSeriesFields
      }
      
      campaignUsage {
        campaignId
        campaignName
        usageCount
        successRate
        averageExecutionTime
      }
      
      momentUsage {
        momentId
        momentName
        usageCount
        deliveryCount
        effectiveness
      }
      
      errorBreakdown {
        errorType
        count
        percentage
        lastOccurrence
      }
    }
  }
`

// =============================================================================
// MOMENT EFFECTIVENESS QUERIES
// =============================================================================

export const MOMENT_EFFECTIVENESS_QUERY = gql`
  ${MOMENT_EFFECTIVENESS_FRAGMENT}
  query GetMomentEffectiveness(
    $tenantId: ID!
    $filters: AnalyticsFiltersInput!
    $sortBy: MomentSortField = CONVERSION_RATE
    $sortOrder: SortOrder = DESC
    $limit: Int = 50
  ) {
    momentEffectiveness(
      tenantId: $tenantId
      filters: $filters
      sortBy: $sortBy
      sortOrder: $sortOrder
      limit: $limit
    ) {
      totalCount
      moments {
        ...MomentEffectivenessFields
      }
      aggregations {
        totalDeliveries
        averageEngagementRate
        averageConversionRate
        totalRevenue
        averageTimeToConversion
      }
    }
  }
`

// =============================================================================
// USER INTERACTION QUERIES
// =============================================================================

export const USER_INTERACTIONS_QUERY = gql`
  ${USER_INTERACTION_FRAGMENT}
  query GetUserInteractions(
    $tenantId: ID!
    $filters: AnalyticsFiltersInput!
    $limit: Int = 100
    $offset: Int = 0
  ) {
    userInteractions(
      tenantId: $tenantId
      filters: $filters
      limit: $limit
      offset: $offset
    ) {
      totalCount
      interactions {
        ...UserInteractionFields
      }
      aggregations {
        totalSessions
        averageSessionDuration
        bounceRate
        topActions
        topComponents
      }
    }
  }
`

export const USER_BEHAVIOR_ANALYTICS_QUERY = gql`
  ${TIME_SERIES_FRAGMENT}
  query GetUserBehaviorAnalytics(
    $tenantId: ID!
    $timeRange: TimeRangeInput!
    $workspaceId: ID
  ) {
    userBehaviorAnalytics(
      tenantId: $tenantId
      timeRange: $timeRange
      workspaceId: $workspaceId
    ) {
      sessionsTimeSeries {
        ...TimeSeriesFields
      }
      
      pageViewsTimeSeries {
        ...TimeSeriesFields
      }
      
      engagementTimeSeries {
        ...TimeSeriesFields
      }
      
      conversionFunnel {
        step
        users
        conversionRate
        dropoffRate
      }
      
      topPages {
        page
        views
        uniqueUsers
        averageTimeOnPage
        bounceRate
      }
      
      deviceBreakdown {
        device
        sessions
        percentage
      }
      
      geographicBreakdown {
        country
        region
        sessions
        conversionRate
      }
    }
  }
`

// =============================================================================
// REAL-TIME SUBSCRIPTIONS
// =============================================================================

export const DASHBOARD_UPDATES_SUBSCRIPTION = gql`
  ${DASHBOARD_METRICS_FRAGMENT}
  subscription DashboardUpdates($tenantId: ID!) {
    dashboardUpdates(tenantId: $tenantId) {
      updateType
      timestamp
      significantChange
      metrics {
        ...DashboardMetricsFields
      }
      changedFields
    }
  }
`

export const CAMPAIGN_UPDATES_SUBSCRIPTION = gql`
  subscription CampaignUpdates($tenantId: ID!, $campaignId: ID) {
    campaignUpdates(tenantId: $tenantId, campaignId: $campaignId) {
      campaignId
      updateType
      timestamp
      metrics {
        impressions
        clicks
        conversions
        revenue
        conversionRate
        clickThroughRate
        roi
      }
      significantChange
    }
  }
`

export const ATOM_UPDATES_SUBSCRIPTION = gql`
  subscription AtomUpdates($tenantId: ID!, $atomId: ID) {
    atomUpdates(tenantId: $tenantId, atomId: $atomId) {
      atomId
      updateType
      timestamp
      metrics {
        usageCount
        successRate
        averageExecutionTime
        errorCount
        efficiency
      }
      significantChange
    }
  }
`

export const REAL_TIME_ANALYTICS_SUBSCRIPTION = gql`
  ${TIME_SERIES_FRAGMENT}
  subscription RealTimeAnalytics($tenantId: ID!) {
    realTimeAnalytics(tenantId: $tenantId) {
      timestamp
      
      liveMetrics {
        activeUsers
        decisionsPerMinute
        currentSuccessRate
        averageResponseTime
      }
      
      recentActivity {
        campaigns {
          id
          name
          recentImpressions
          recentConversions
        }
        
        atoms {
          id
          name
          recentUsage
          recentSuccessRate
        }
        
        moments {
          id
          name
          recentDeliveries
          recentEngagement
        }
      }
      
      alerts {
        type
        severity
        message
        timestamp
        affectedEntity
      }
    }
  }
`

// =============================================================================
// EXPORT MUTATIONS
// =============================================================================

export const EXPORT_ANALYTICS_MUTATION = gql`
  mutation ExportAnalytics($input: ExportAnalyticsInput!) {
    exportAnalytics(input: $input) {
      success
      message
      downloadUrl
      filename
      expiresAt
      fileSize
      format
    }
  }
`

export const SCHEDULE_REPORT_MUTATION = gql`
  mutation ScheduleReport($input: ScheduleReportInput!) {
    scheduleReport(input: $input) {
      id
      name
      schedule
      recipients
      dataTypes
      format
      filters
      nextRun
      active
    }
  }
`

// =============================================================================
// SETTINGS MUTATIONS
// =============================================================================

export const UPDATE_DASHBOARD_SETTINGS_MUTATION = gql`
  mutation UpdateDashboardSettings($input: DashboardSettingsInput!) {
    updateDashboardSettings(input: $input) {
      refreshInterval
      defaultTimeRange
      enableRealTime
      enableNotifications
      chartSettings {
        theme
        animations
        defaultChartType
      }
      layoutSettings {
        sidebarOpen
        compactMode
        defaultView
      }
    }
  }
`

export const UPDATE_ANALYTICS_PREFERENCES_MUTATION = gql`
  mutation UpdateAnalyticsPreferences($input: AnalyticsPreferencesInput!) {
    updateAnalyticsPreferences(input: $input) {
      userId
      defaultFilters {
        timeRange
        campaigns
        atoms
        channels
      }
      notificationSettings {
        enableEmail
        enableInApp
        thresholds {
          conversionRate
          successRate
          responseTime
        }
      }
      displaySettings {
        currency
        timezone
        dateFormat
        numberFormat
      }
    }
  }
`

// =============================================================================
// ALERT QUERIES AND MUTATIONS
// =============================================================================

export const ANALYTICS_ALERTS_QUERY = gql`
  query GetAnalyticsAlerts(
    $tenantId: ID!
    $severity: AlertSeverity
    $status: AlertStatus = ACTIVE
    $limit: Int = 50
  ) {
    analyticsAlerts(
      tenantId: $tenantId
      severity: $severity
      status: $status
      limit: $limit
    ) {
      id
      type
      severity
      status
      title
      message
      timestamp
      affectedEntity {
        type
        id
        name
      }
      threshold {
        metric
        operator
        value
        currentValue
      }
      actions {
        label
        type
        url
      }
    }
  }
`

export const CREATE_ALERT_RULE_MUTATION = gql`
  mutation CreateAlertRule($input: CreateAlertRuleInput!) {
    createAlertRule(input: $input) {
      id
      name
      description
      metric
      threshold {
        operator
        value
        duration
      }
      severity
      enabled
      notifications {
        email
        webhook
        inApp
      }
    }
  }
`

export const ACKNOWLEDGE_ALERT_MUTATION = gql`
  mutation AcknowledgeAlert($alertId: ID!, $tenantId: ID!) {
    acknowledgeAlert(alertId: $alertId, tenantId: $tenantId) {
      id
      status
      acknowledgedBy
      acknowledgedAt
    }
  }
`

// =============================================================================
// TYPE DEFINITIONS FOR INPUTS
// =============================================================================

export interface TimeRangeInput {
  start: string
  end: string
}

export interface AnalyticsFiltersInput {
  timeRange: TimeRangeInput
  tenantIds?: string[]
  workspaceIds?: string[]
  campaignIds?: string[]
  atomTypes?: string[]
  channels?: string[]
  audiences?: string[]
  customFilters?: Record<string, any>
}

export interface ExportAnalyticsInput {
  dataType: 'DASHBOARD' | 'CAMPAIGNS' | 'ATOMS' | 'MOMENTS' | 'USER_INTERACTIONS'
  format: 'CSV' | 'EXCEL' | 'PDF' | 'JSON'
  filters: AnalyticsFiltersInput
  includeCharts?: boolean
  customFields?: string[]
}

export interface DashboardSettingsInput {
  refreshInterval?: number
  defaultTimeRange?: string
  enableRealTime?: boolean
  enableNotifications?: boolean
  chartSettings?: {
    theme?: string
    animations?: boolean
    defaultChartType?: string
  }
  layoutSettings?: {
    sidebarOpen?: boolean
    compactMode?: boolean
    defaultView?: string
  }
}