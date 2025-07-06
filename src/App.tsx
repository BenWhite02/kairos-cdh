import React from 'react'

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-2xl mx-auto text-center">
        {/* Header Section */}
        <div className="mb-8">
          <div className="w-24 h-24 bg-gradient-kairos rounded-full flex items-center justify-center mx-auto mb-6 shadow-kairos animate-pulse-soft">
            <span className="text-3xl text-white">⏰</span>
          </div>
          <h1 className="text-5xl font-bold text-gray-900 mb-4 animate-fade-in">
            Kairos Frontend
          </h1>
          <p className="text-xl text-gray-600 mb-8 animate-slide-up">
            The Perfect Moment Delivery Interface
          </p>
        </div>
        
        {/* Status Card */}
        <div className="card animate-scale-in mb-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-900">
            🎯 Block H: Frontend Core Interface
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-500 text-xl">✅</span>
              <span className="text-sm font-medium">React 18 + Vite + TypeScript</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-500 text-xl">✅</span>
              <span className="text-sm font-medium">Tailwind CSS Theme System</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-500 text-xl">✅</span>
              <span className="text-sm font-medium">Zustand State Management</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-500 text-xl">✅</span>
              <span className="text-sm font-medium">Apollo GraphQL Integration</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg">
              <span className="text-green-500 text-xl">✅</span>
              <span className="text-sm font-medium">Analytics Dashboard Ready</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
              <span className="text-blue-500 text-xl">🔄</span>
              <span className="text-sm font-medium">Development Server Running</span>
            </div>
          </div>
          
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-center space-x-2 text-gray-600">
              <span>Ready to consume Hades backend APIs</span>
              <span className="text-2xl">🔥</span>
            </div>
          </div>
        </div>
        
        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-gray-900 mb-1">Analytics Dashboard</h3>
            <p className="text-sm text-gray-600">Real-time metrics and KPIs</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">⚛️</div>
            <h3 className="font-semibold text-gray-900 mb-1">EligibilityAtoms</h3>
            <p className="text-sm text-gray-600">Reusable decision components</p>
          </div>
          
          <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
            <div className="text-2xl mb-2">⏰</div>
            <h3 className="font-semibold text-gray-900 mb-1">Perfect Moments</h3>
            <p className="text-sm text-gray-600">Optimal delivery timing</p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
          <button className="btn btn-primary px-8 py-3 text-base font-semibold">
            <span className="mr-2">📊</span>
            View Dashboard
          </button>
          <button className="btn btn-outline px-8 py-3 text-base font-semibold">
            <span className="mr-2">📚</span>
            Documentation
          </button>
        </div>
        
        {/* Dependencies Status */}
        <div className="bg-white rounded-lg p-6 shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">🔧 Dependencies Loaded</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="flex items-center space-x-1">
              <span className="text-green-500">✅</span>
              <span>Apollo Client</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-500">✅</span>
              <span>Framer Motion</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-500">✅</span>
              <span>React Query</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-500">✅</span>
              <span>React Router</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-500">✅</span>
              <span>Zustand</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-500">✅</span>
              <span>Lucide Icons</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-500">✅</span>
              <span>Recharts</span>
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-green-500">✅</span>
              <span>Headless UI</span>
            </div>
          </div>
        </div>
        
        {/* Footer Info */}
        <div className="mt-8 text-gray-500 text-sm">
          <p>Kairos v1.0.0 • Built with React 18, TypeScript & Tailwind CSS</p>
          <p className="mt-2">🏗️ Ready for Block I: Basic Experimentation</p>
        </div>
      </div>
    </div>
  )
}

export default App