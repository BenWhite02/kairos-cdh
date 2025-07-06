// File: src/pages/EnhancedDashboard.tsx
// 🎯 Complete Professional Analytics Dashboard
// Full-featured dashboard with real charts, animations, and professional UI

import React, { useState, useEffect } from 'react'
import { 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target, 
  Zap, 
  Clock, 
  DollarSign, 
  BarChart3,
  Filter,
  Download,
  Refresh,
  Settings,
  ChevronDown,
  Play,
  Pause,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

// Import chart components
import {
  DecisionVolumeChart,
  ConversionChart,
  RevenueChart,
  ChannelDistributionChart
} from '../components/charts/PerformanceChart'

// Enhanced mock data with real-looking metrics
const mockMetrics = {
  totalCampaigns: 24,
  activeCampaigns: 18,
  totalDecisions: 847293,
  decisionsToday: 12847,
  successRate: 0.924,
  avgResponseTime: 24,
  totalRevenue: 2847293,
  conversionRate: 0.034,
  activeUsers: 8429,
  atomsExecuted: 156789
}

const mockCampaigns = [
  { 
    id: 1, 
    name: "Q4 Holiday Promotion", 
    status: "active", 
    impressions: 245000, 
    conversions: 8470, 
    ctr: 0.034, 
    revenue: 423000, 
    roi: 3.2,
    change: 12.5,
    isPositive: true
  },
  { 
    id: 2, 
    name: "New User Onboarding", 
    status: "active", 
    impressions: 128000, 
    conversions: 4230, 
    ctr: 0.033, 
    revenue: 189000, 
    roi: 2.8,
    change: 8.3,
    isPositive: true
  },
  { 
    id: 3, 
    name: "Product Launch Campaign", 
    status: "paused", 
    impressions: 89000, 
    conversions: 2890, 
    ctr: 0.032, 
    revenue: 145000, 
    roi: 2.1,
    change: -5.2,
    isPositive: false
  },
  { 
    id: 4, 
    name: "Retention Email Series", 
    status: "active", 
    impressions: 156000, 
    conversions: 6240, 
    ctr: 0.040, 
    revenue: 312000, 
    roi: 4.1,
    change: 15.7,
    isPositive: true
  },
]

const mockAtoms = [
  { id: 1, name: "TimeBasedEligibility", type: "temporal", usage: 2847, successRate: 0.96, avgTime: 12, trend: "up" },
  { id: 2, name: "GeographicTargeting", type: "location", usage: 1923, successRate: 0.91, avgTime: 18, trend: "up" },
  { id: 3, name: "BehaviorScoring", type: "behavioral", usage: 3421, successRate: 0.89, avgTime: 34, trend: "down" },
  { id: 4, name: "DemographicFilter", type: "demographic", usage: 1567, successRate: 0.94, avgTime: 8, trend: "up" },
  { id: 5, name: "DeviceTargeting", type: "technical", usage: 892, successRate: 0.87, avgTime: 15, trend: "stable" },
]

const mockAlerts = [
  { id: 1, type: "warning", message: "Campaign 'Product Launch' conversion rate below threshold", time: "2 minutes ago" },
  { id: 2, type: "success", message: "Holiday Promotion exceeded revenue target", time: "15 minutes ago" },
  { id: 3, type: "info", message: "New atom 'SeasonalTargeting' deployed successfully", time: "1 hour ago" },
]

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h')
  const [isRealTime, setIsRealTime] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())
  const [selectedTab, setSelectedTab] = useState('overview')

  // Simulate real-time updates
  useEffect(() => {
    if (!isRealTime) return
    
    const interval = setInterval(() => {
      setLastUpdate(new Date())
    }, 5000)
    
    return () => clearInterval(interval)
  }, [isRealTime])

  const MetricCard = ({ 
    title, 
    value, 
    change, 
    isPositive, 
    icon: Icon, 
    format = 'number',
    subtitle
  }: {
    title: string
    value: number
    change: number
    isPositive: boolean
    icon: any
    format?: 'number' | 'currency' | 'percentage' | 'time'
    subtitle?: string
  }) => {
    const formatValue = (val: number) => {
      switch (format) {
        case 'currency':
          return `$${(val / 1000).toFixed(0)}K`
        case 'percentage':
          return `${(val * 100).toFixed(1)}%`
        case 'time':
          return `${val}ms`
        default:
          return val.toLocaleString()
      }
    }

    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl group-hover:from-blue-100 group-hover:to-blue-200 transition-colors">
            <Icon className="h-6 w-6 text-blue-600" />
          </div>
          <div className={`flex items-center space-x-1 text-sm font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mb-1">{formatValue(value)}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        </div>
      </div>
    )
  }

  const AlertItem = ({ alert }: { alert: any }) => (
    <div className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
      <div className={`flex-shrink-0 w-2 h-2 rounded-full mt-2 ${
        alert.type === 'success' ? 'bg-green-400' :
        alert.type === 'warning' ? 'bg-yellow-400' : 
        'bg-blue-400'
      }`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">{alert.message}</p>
        <p className="text-xs text-gray-500 mt-1">{alert.time}</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time insights from your Kairos decision engine</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Real-time indicator */}
              <div className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium ${
                isRealTime ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
              }`}>
                <div className={`w-2 h-2 rounded-full ${isRealTime ? 'bg-green-400 animate-pulse' : 'bg-gray-400'}`} />
                <span>{isRealTime ? 'Live' : 'Paused'}</span>
              </div>
              
              {/* Time range selector */}
              <div className="relative">
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-8 text-sm font-medium text-gray-700 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1h">Last Hour</option>
                  <option value="24h">Last 24 Hours</option>
                  <option value="7d">Last 7 Days</option>
                  <option value="30d">Last 30 Days</option>
                </select>
                <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              
              <button 
                onClick={() => setIsRealTime(!isRealTime)}
                className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                {isRealTime ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                <span>{isRealTime ? 'Pause' : 'Resume'}</span>
              </button>
              
              <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                <Download className="h-4 w-4" />
                <span>Export</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Metrics Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Active Campaigns"
            value={mockMetrics.activeCampaigns}
            change={12.5}
            isPositive={true}
            icon={Target}
            subtitle={`${mockMetrics.totalCampaigns} total campaigns`}
          />
          <MetricCard
            title="Decisions Today"
            value={mockMetrics.decisionsToday}
            change={8.3}
            isPositive={true}
            icon={Zap}
            subtitle={`${mockMetrics.atomsExecuted.toLocaleString()} atoms executed`}
          />
          <MetricCard
            title="Success Rate"
            value={mockMetrics.successRate}
            change={2.1}
            isPositive={true}
            icon={TrendingUp}
            format="percentage"
            subtitle="Above industry average"
          />
          <MetricCard
            title="Avg Response Time"
            value={mockMetrics.avgResponseTime}
            change={15.2}
            isPositive={false}
            icon={Clock}
            format="time"
            subtitle="Within SLA threshold"
          />
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {[
                { id: 'overview', name: 'Overview', icon: BarChart3 },
                { id: 'campaigns', name: 'Campaigns', icon: Target },
                { id: 'atoms', name: 'Atoms', icon: Zap },
              ].map(({ id, name, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setSelectedTab(id)}
                  className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                    selectedTab === id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Decision Volume</h3>
              <div className="text-sm text-gray-500">Last 24 hours</div>
            </div>
            <DecisionVolumeChart height={250} />
          </div>
          
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-gray-900">Conversion Trends</h3>
              <div className="text-sm text-gray-500">Real-time</div>
            </div>
            <ConversionChart height={250} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Revenue Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Revenue Performance</h3>
                <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">View Details</button>
              </div>
              <RevenueChart height={200} />
            </div>

            {/* Campaign Performance Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Top Performing Campaigns</h3>
                  <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700 font-medium">
                    <Filter className="h-4 w-4" />
                    <span>Filter</span>
                  </button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performance</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockCampaigns.map((campaign) => (
                      <tr key={campaign.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className={`flex-shrink-0 h-3 w-3 rounded-full mr-3 ${
                              campaign.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
                            }`} />
                            <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{campaign.conversions.toLocaleString()} conversions</div>
                          <div className="text-sm text-gray-500">{(campaign.ctr * 100).toFixed(2)}% CTR</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(campaign.revenue / 1000).toFixed(0)}K
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            campaign.roi > 3 ? 'bg-green-100 text-green-800' :
                            campaign.roi > 2 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {campaign.roi.toFixed(1)}x
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`flex items-center space-x-1 text-sm ${
                            campaign.isPositive ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {campaign.isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
                            <span>{Math.abs(campaign.change)}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Channel Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Channel Distribution</h3>
              <ChannelDistributionChart height={200} />
            </div>

            {/* Top Atoms */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Top Performing Atoms</h3>
              <div className="space-y-3">
                {mockAtoms.slice(0, 4).map((atom) => (
                  <div key={atom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{atom.name}</p>
                      <p className="text-xs text-gray-500 capitalize">{atom.type}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900">{(atom.successRate * 100).toFixed(1)}%</p>
                      <div className="flex items-center space-x-1">
                        {atom.trend === 'up' && <ArrowUpRight className="h-3 w-3 text-green-500" />}
                        {atom.trend === 'down' && <ArrowDownRight className="h-3 w-3 text-red-500" />}
                        <span className="text-xs text-gray-500">{atom.usage}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Alerts */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Alerts</h3>
              <div className="space-y-1">
                {mockAlerts.map((alert) => (
                  <AlertItem key={alert.id} alert={alert} />
                ))}
              </div>
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hades API</span>
                  <span className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Operational</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">WebSocket</span>
                  <span className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Connected</span>
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Analytics Engine</span>
                  <span className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium text-green-600">Processing</span>
                  </span>
                </div>
                <div className="pt-3 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Update</span>
                    <span className="text-sm text-gray-500">{lastUpdate.toLocaleTimeString()}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard