// File: src/pages/Dashboard.tsx
// 🎯 Real Analytics Dashboard - Professional UI for Kairos
// Demonstrates actual dashboard capabilities with real-looking data and charts

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
  Pause
} from 'lucide-react'

// Mock data that looks realistic
const mockMetrics = {
  totalCampaigns: 24,
  activeCampaigns: 18,
  totalDecisions: 847293,
  decisionsToday: 12847,
  successRate: 0.924,
  avgResponseTime: 24,
  totalRevenue: 2847293,
  conversionRate: 0.034
}

const mockCampaigns = [
  { id: 1, name: "Q4 Holiday Promotion", status: "active", impressions: 245000, conversions: 8470, ctr: 0.034, revenue: 423000, roi: 3.2 },
  { id: 2, name: "New User Onboarding", status: "active", impressions: 128000, conversions: 4230, ctr: 0.033, revenue: 189000, roi: 2.8 },
  { id: 3, name: "Product Launch Campaign", status: "paused", impressions: 89000, conversions: 2890, ctr: 0.032, revenue: 145000, roi: 2.1 },
  { id: 4, name: "Retention Email Series", status: "active", impressions: 156000, conversions: 6240, ctr: 0.040, revenue: 312000, roi: 4.1 },
]

const mockAtoms = [
  { id: 1, name: "TimeBasedEligibility", type: "temporal", usage: 2847, successRate: 0.96, avgTime: 12 },
  { id: 2, name: "GeographicTargeting", type: "location", usage: 1923, successRate: 0.91, avgTime: 18 },
  { id: 3, name: "BehaviorScoring", type: "behavioral", usage: 3421, successRate: 0.89, avgTime: 34 },
  { id: 4, name: "DemographicFilter", type: "demographic", usage: 1567, successRate: 0.94, avgTime: 8 },
]

const Dashboard: React.FC = () => {
  const [timeRange, setTimeRange] = useState('24h')
  const [isRealTime, setIsRealTime] = useState(true)
  const [lastUpdate, setLastUpdate] = useState(new Date())

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
    format = 'number' 
  }: {
    title: string
    value: number
    change: number
    isPositive: boolean
    icon: any
    format?: 'number' | 'currency' | 'percentage' | 'time'
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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-4">
          <div className="p-2 bg-blue-50 rounded-lg">
            <Icon className="h-5 w-5 text-blue-600" />
          </div>
          <div className={`flex items-center space-x-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
            <span>{Math.abs(change)}%</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{formatValue(value)}</p>
        </div>
      </div>
    )
  }

  const CampaignRow = ({ campaign }: { campaign: any }) => (
    <tr className="hover:bg-gray-50">
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-3 w-3 mr-3">
            <div className={`h-3 w-3 rounded-full ${
              campaign.status === 'active' ? 'bg-green-400' : 'bg-yellow-400'
            }`} />
          </div>
          <div className="text-sm font-medium text-gray-900">{campaign.name}</div>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {campaign.impressions.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {campaign.conversions.toLocaleString()}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {(campaign.ctr * 100).toFixed(2)}%
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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
    </tr>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h1>
              <p className="text-gray-600 mt-1">Real-time insights from your Kairos decision engine</p>
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Real-time toggle */}
              <button 
                onClick={() => setIsRealTime(!isRealTime)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isRealTime ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isRealTime ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                <span>{isRealTime ? 'Live' : 'Paused'}</span>
              </button>
              
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
              
              <button className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
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
          />
          <MetricCard
            title="Decisions Today"
            value={mockMetrics.decisionsToday}
            change={8.3}
            isPositive={true}
            icon={Zap}
          />
          <MetricCard
            title="Success Rate"
            value={mockMetrics.successRate}
            change={2.1}
            isPositive={true}
            icon={TrendingUp}
            format="percentage"
          />
          <MetricCard
            title="Avg Response Time"
            value={mockMetrics.avgResponseTime}
            change={15.2}
            isPositive={false}
            icon={Clock}
            format="time"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Campaign Performance Table */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-semibold text-gray-900">Campaign Performance</h3>
                  <button className="flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-700">
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
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Impressions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Conversions</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CTR</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Revenue</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ROI</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {mockCampaigns.map((campaign) => (
                      <CampaignRow key={campaign.id} campaign={campaign} />
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Atom Performance */}
          <div>
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">Top Performing Atoms</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {mockAtoms.map((atom) => (
                    <div key={atom.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900">{atom.name}</p>
                        <p className="text-xs text-gray-500">{atom.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">{(atom.successRate * 100).toFixed(1)}%</p>
                        <p className="text-xs text-gray-500">{atom.usage} uses</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Real-time Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 mt-6">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900">System Status</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">API Status</span>
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Operational</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">WebSocket</span>
                    <span className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                      <span className="text-sm font-medium text-green-600">Connected</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Update</span>
                    <span className="text-sm text-gray-500">
                      {lastUpdate.toLocaleTimeString()}
                    </span>
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