// File: src/components/Dashboard/AnalyticsDashboard.tsx
// 🎯 Block H3: Analytics Dashboard Implementation - Main Dashboard Component
// Primary analytics dashboard consuming Hades G1 REST APIs with real-time updates
// * 📊 **Dashboard overview** with key metrics and KPIs
// * 📈 **Real-time charts** using Recharts with live data updates
// * 🎯 **Campaign performance** tracking and visualization
// * ⚛️ **Atom usage statistics** with efficiency metrics
// * 🔄 **Auto-refresh** with configurable intervals

import React, { useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RefreshCcw, 
  TrendingUp, 
  Users, 
  Target, 
  Zap,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  Settings
} from 'lucide-react'
import { useDashboard, useAnalyticsFilters, useRealTimeAnalytics } from '@/stores/analyticsStore'
import { useTheme } from '@/stores/appStore'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { MetricCard } from '@/components/Dashboard/MetricCard'
import { TimeRangeSelector } from '@/components/Dashboard/TimeRangeSelector'
import { CampaignPerformanceChart } from '@/components/Dashboard/CampaignPerformanceChart'
import { AtomUsageChart } from '@/components/Dashboard/AtomUsageChart'
import { MomentEffectivenessChart } from '@/components/Dashboard/MomentEffectivenessChart'
import { RealTimeIndicator } from '@/components/Dashboard/RealTimeIndicator'
import { cn } from '@/utils/cn'

// =============================================================================
// MAIN ANALYTICS DASHBOARD COMPONENT
// =============================================================================

export const AnalyticsDashboard: React.FC = () => {
  const { theme } = useTheme()
  const { 
    metrics, 
    isLoading, 
    error, 
    loadDashboardMetrics, 
    refreshDashboard 
  } = useDashboard()
  const { filters, setTimeRange } = useAnalyticsFilters()
  const { 
    realTimeEnabled, 
    refreshInterval, 
    lastRefresh,
    enableRealTime,
    disableRealTime 
  } = useRealTimeAnalytics()

  // =============================================================================
  // EFFECTS & CALLBACKS
  // =============================================================================

  // Load initial dashboard data
  useEffect(() => {
    loadDashboardMetrics()
  }, [loadDashboardMetrics])

  // Set up real-time refresh
  useEffect(() => {
    if (!realTimeEnabled) return

    const interval = setInterval(() => {
      refreshDashboard()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [realTimeEnabled, refreshInterval, refreshDashboard])

  // Manual refresh handler
  const handleRefresh = useCallback(async () => {
    await refreshDashboard()
  }, [refreshDashboard])

  // Real-time toggle handler
  const handleRealTimeToggle = useCallback(() => {
    if (realTimeEnabled) {
      disableRealTime()
    } else {
      enableRealTime()
    }
  }, [realTimeEnabled, enableRealTime, disableRealTime])

  // =============================================================================
  // LOADING STATE
  // =============================================================================

  if (isLoading && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" className="mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Loading Analytics Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching your latest analytics data...
          </p>
        </div>
      </div>
    )
  }

  // =============================================================================
  // ERROR STATE
  // =============================================================================

  if (error && !metrics) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <Card className="max-w-md mx-auto text-center" variant="outlined">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
            Failed to Load Dashboard
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            {error}
          </p>
          <Button onClick={handleRefresh} variant="primary">
            <RefreshCcw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </Card>
      </div>
    )
  }

  // =============================================================================
  // RENDER DASHBOARD
  // =============================================================================

  return (
    <div className={cn(
      "min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300",
      theme === 'kairos-blue' && "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900 dark:to-indigo-900",
      theme === 'moment-purple' && "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900 dark:to-pink-900"
    )}>
      {/* Dashboard Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Analytics Dashboard
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Real-time insights from your Kairos decision engine
              </p>
            </div>
            
            <div className="flex items-center space-x-4">
              <RealTimeIndicator 
                enabled={realTimeEnabled}
                lastRefresh={lastRefresh}
                onToggle={handleRealTimeToggle}
              />
              
              <TimeRangeSelector 
                value={filters.timeRange}
                onChange={setTimeRange}
              />
              
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={isLoading}
                className="flex items-center space-x-2"
              >
                <RefreshCcw className={cn(
                  "h-4 w-4",
                  isLoading && "animate-spin"
                )} />
                <span>Refresh</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2"
              >
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Dashboard Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {metrics && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-8"
            >
              {/* Key Metrics Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricCard
                  title="Active Campaigns"
                  value={metrics.activeCampaigns}
                  total={metrics.totalCampaigns}
                  icon={Target}
                  color="primary"
                  trend={{ value: 12, isPositive: true }}
                  className="animate-fade-in"
                />
                
                <MetricCard
                  title="Decisions Today"
                  value={metrics.decisionsToday.toLocaleString()}
                  icon={Zap}
                  color="accent"
                  trend={{ value: 8.5, isPositive: true }}
                  className="animate-fade-in"
                  style={{ animationDelay: '0.1s' }}
                />
                
                <MetricCard
                  title="Success Rate"
                  value={`${(metrics.successRate * 100).toFixed(1)}%`}
                  icon={CheckCircle}
                  color="success"
                  trend={{ value: 2.3, isPositive: true }}
                  className="animate-fade-in"
                  style={{ animationDelay: '0.2s' }}
                />
                
                <MetricCard
                  title="Avg Response Time"
                  value={`${metrics.averageResponseTime.toFixed(0)}ms`}
                  icon={Clock}
                  color="warning"
                  trend={{ value: 15, isPositive: false }}
                  className="animate-fade-in"
                  style={{ animationDelay: '0.3s' }}
                />
              </div>

              {/* Charts Row 1: Campaign Performance & Atom Usage */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.2 }}
                >
                  <Card className="h-96">
                    <div className="p-6 pb-2">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Campaign Performance
                        </h3>
                        <Badge variant="info" size="sm">
                          Last 24h
                        </Badge>
                      </div>
                    </div>
                    <CampaignPerformanceChart className="h-72 px-6 pb-6" />
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                >
                  <Card className="h-96">
                    <div className="p-6 pb-2">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          Atom Usage Statistics
                        </h3>
                        <Badge variant="secondary" size="sm">
                          Top 10
                        </Badge>
                      </div>
                    </div>
                    <AtomUsageChart className="h-72 px-6 pb-6" />
                  </Card>
                </motion.div>
              </div>

              {/* Charts Row 2: Moment Effectiveness */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.4 }}
              >
                <Card className="h-96">
                  <div className="p-6 pb-2">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Moment Effectiveness Over Time
                      </h3>
                      <div className="flex items-center space-x-2">
                        <Badge variant="success" size="sm">
                          Real-time
                        </Badge>
                        {realTimeEnabled && (
                          <div className="flex items-center space-x-1 text-sm text-green-600 dark:text-green-400">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span>Live</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  <MomentEffectivenessChart className="h-72 px-6 pb-6" />
                </Card>
              </motion.div>

              {/* Quick Actions & Status Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.5 }}
                >
                  <Card variant="elevated" className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Active Users
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {metrics.totalCampaigns * 15} {/* Mock calculation */}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Users interacting with moments
                      </div>
                    </div>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.6 }}
                >
                  <Card variant="elevated" className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                        <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Revenue Impact
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        $12.5K
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Generated this month
                      </div>
                    </div>
                  </Card>
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.7 }}
                >
                  <Card variant="elevated" className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        Optimization Score
                      </h4>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        87%
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        Overall performance rating
                      </div>
                    </div>
                  </Card>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

export default AnalyticsDashboard