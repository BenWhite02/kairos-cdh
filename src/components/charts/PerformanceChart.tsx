// File: src/components/charts/PerformanceChart.tsx
// 🎯 Real Chart Component using Recharts
// Professional data visualization for analytics dashboard

import React from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'

// Mock time series data
const mockTimeSeriesData = [
  { time: '00:00', decisions: 450, conversions: 23, revenue: 1200 },
  { time: '04:00', decisions: 380, conversions: 19, revenue: 980 },
  { time: '08:00', decisions: 820, conversions: 45, revenue: 2400 },
  { time: '12:00', decisions: 1200, conversions: 67, revenue: 3600 },
  { time: '16:00', decisions: 950, conversions: 52, revenue: 2800 },
  { time: '20:00', decisions: 720, conversions: 38, revenue: 2100 },
]

const mockChannelData = [
  { name: 'Email', value: 35, color: '#3b82f6' },
  { name: 'SMS', value: 25, color: '#8b5cf6' },
  { name: 'Push', value: 20, color: '#06b6d4' },
  { name: 'Web', value: 15, color: '#10b981' },
  { name: 'Other', value: 5, color: '#f59e0b' },
]

interface ChartProps {
  data?: any[]
  height?: number
  className?: string
}

export const DecisionVolumeChart: React.FC<ChartProps> = ({ 
  data = mockTimeSeriesData, 
  height = 300,
  className = ""
}) => (
  <div className={`w-full ${className}`}>
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="decisionsGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="time" 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Area
          type="monotone"
          dataKey="decisions"
          stroke="#3b82f6"
          strokeWidth={2}
          fill="url(#decisionsGradient)"
        />
      </AreaChart>
    </ResponsiveContainer>
  </div>
)

export const ConversionChart: React.FC<ChartProps> = ({ 
  data = mockTimeSeriesData, 
  height = 300,
  className = ""
}) => (
  <div className={`w-full ${className}`}>
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="time" 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
        />
        <Line
          type="monotone"
          dataKey="conversions"
          stroke="#10b981"
          strokeWidth={3}
          dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
          activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  </div>
)

export const RevenueChart: React.FC<ChartProps> = ({ 
  data = mockTimeSeriesData, 
  height = 300,
  className = ""
}) => (
  <div className={`w-full ${className}`}>
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
        <XAxis 
          dataKey="time" 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
        />
        <YAxis 
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value) => [`$${value}`, 'Revenue']}
        />
        <Bar 
          dataKey="revenue" 
          fill="#8b5cf6"
          radius={[4, 4, 0, 0]}
        />
      </BarChart>
    </ResponsiveContainer>
  </div>
)

export const ChannelDistributionChart: React.FC<ChartProps> = ({ 
  data = mockChannelData, 
  height = 300,
  className = ""
}) => (
  <div className={`w-full ${className}`}>
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={100}
          paddingAngle={2}
          dataKey="value"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip 
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}
          formatter={(value) => [`${value}%`, 'Share']}
        />
      </PieChart>
    </ResponsiveContainer>
    
    {/* Legend */}
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {data.map((entry, index) => (
        <div key={index} className="flex items-center space-x-2">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600">
            {entry.name} ({entry.value}%)
          </span>
        </div>
      ))}
    </div>
  </div>
)