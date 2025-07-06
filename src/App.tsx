import React from 'react'
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom'
import { 
  BarChart3, 
  Target, 
  Atom, 
  Clock, 
  Settings, 
  Menu,
  X,
  Zap,
  TrendingUp
} from 'lucide-react'
import EnhancedDashboard from './pages/EnhancedDashboard'

// Landing page component with better design
const Landing = () => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 relative overflow-hidden">
    {/* Background animation */}
    <div className="absolute inset-0 overflow-hidden">
      <div className="absolute -top-40 -right-32 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute -bottom-40 -left-32 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute top-40 left-40 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
    </div>
    
    <div className="relative min-h-screen flex items-center justify-center p-4">
      <div className="max-w-6xl mx-auto text-center text-white">
        {/* Hero Section */}
        <div className="mb-16">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white/10 backdrop-blur-sm rounded-2xl mb-8 animate-float">
            <span className="text-4xl">⏰</span>
          </div>
          <h1 className="text-7xl md:text-8xl font-black mb-6 bg-gradient-to-r from-white via-purple-200 to-blue-200 bg-clip-text text-transparent">
            Kairos
          </h1>
          <p className="text-2xl md:text-3xl text-gray-300 mb-4 font-light">
            The Perfect Moment Delivery Interface
          </p>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Harness the power of AI-driven decision engines to deliver personalized experiences 
            at precisely the right moment, every time.
          </p>
        </div>
        
        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <BarChart3 className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Real-time Analytics</h3>
            <p className="text-gray-400 leading-relaxed">
              Monitor campaign performance, decision metrics, and user engagement with 
              live dashboards and intelligent insights.
            </p>
          </div>
          
          <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Atom className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">EligibilityAtoms™</h3>
            <p className="text-gray-400 leading-relaxed">
              Build sophisticated decision logic with reusable, composable components 
              that adapt to your business rules.
            </p>
          </div>
          
          <div className="group bg-white/5 backdrop-blur-sm rounded-2xl p-8 border border-white/10 hover:bg-white/10 transition-all duration-300">
            <div className="bg-gradient-to-br from-green-500 to-teal-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-4">Perfect Timing</h3>
            <p className="text-gray-400 leading-relaxed">
              Leverage AI to identify and deliver content at the optimal moment 
              for maximum engagement and conversion.
            </p>
          </div>
        </div>
        
        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link 
            to="/dashboard"
            className="group relative inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl shadow-2xl hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur opacity-75 group-hover:opacity-100 transition-opacity"></div>
            <div className="relative flex items-center">
              <BarChart3 className="mr-3 h-6 w-6" />
              Launch Dashboard
            </div>
          </Link>
          
          <Link 
            to="/campaigns"
            className="inline-flex items-center justify-center px-10 py-4 text-lg font-bold text-white bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl hover:bg-white/20 transition-all duration-300"
          >
            <Target className="mr-3 h-6 w-6" />
            Explore Features
          </Link>
        </div>
        
        {/* Stats */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">24ms</div>
            <div className="text-gray-400">Avg Response Time</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">92.4%</div>
            <div className="text-gray-400">Success Rate</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">847K</div>
            <div className="text-gray-400">Decisions Today</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-white mb-2">18</div>
            <div className="text-gray-400">Active Campaigns</div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

// Navigation component
const Navigation = () => {
  const location = useLocation()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false)
  
  if (location.pathname === '/') {
    return null // Hide navigation on landing page
  }

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: BarChart3 },
    { name: 'Campaigns', path: '/campaigns', icon: Target },
    { name: 'Atoms', path: '/atoms', icon: Atom },
    { name: 'Settings', path: '/settings', icon: Settings },
  ]

  return (
    <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white text-lg">⏰</span>
              </div>
              <span className="text-2xl font-black text-gray-900">Kairos</span>
            </Link>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navItems.map(({ name, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
                  location.pathname === path
                    ? 'bg-blue-100 text-blue-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{name}</span>
              </Link>
            ))}
          </div>
          
          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 p-2 rounded-md"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
            {navItems.map(({ name, path, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-base font-medium transition-colors ${
                  location.pathname === path
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Icon className="h-5 w-5" />
                <span>{name}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  )
}

// Enhanced placeholder pages
const Campaigns = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Campaign Management</h1>
        <p className="text-xl text-gray-600">Create, manage, and optimize your marketing campaigns</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-br from-blue-500 to-purple-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">A/B Testing</h3>
          <p className="text-gray-600 mb-4">Test different variants and optimize for maximum performance</p>
          <div className="text-sm text-blue-600 font-medium">Coming in Block I</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-br from-green-500 to-teal-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
            <TrendingUp className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Multi-Armed Bandit</h3>
          <p className="text-gray-600 mb-4">Automatically optimize traffic allocation based on performance</p>
          <div className="text-sm text-blue-600 font-medium">Coming in Block I</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 text-center hover:shadow-xl transition-shadow">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
            <BarChart3 className="h-8 w-8 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-3">Performance Analytics</h3>
          <p className="text-gray-600 mb-4">Deep insights into campaign performance and ROI</p>
          <div className="text-sm text-green-600 font-medium">Available Now</div>
        </div>
      </div>
    </div>
  </div>
)

const Atoms = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">EligibilityAtoms™ Library</h1>
        <p className="text-xl text-gray-600">Reusable decision components for intelligent targeting</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-12 text-center">
        <div className="bg-gradient-to-br from-purple-500 to-pink-600 w-24 h-24 rounded-2xl flex items-center justify-center mx-auto mb-8">
          <Atom className="h-12 w-12 text-white" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Atom Library Coming Soon</h3>
        <p className="text-lg text-gray-600 mb-6 max-w-2xl mx-auto">
          Browse, compose, and manage reusable decision components that power your campaigns.
          Connected to Hades Block D: EligibilityAtoms Core.
        </p>
        <div className="inline-flex items-center px-6 py-3 bg-purple-100 text-purple-700 rounded-xl font-medium">
          <Clock className="h-5 w-5 mr-2" />
          Integration with Hades Backend in Progress
        </div>
      </div>
    </div>
  </div>
)

const SettingsPage = () => (
  <div className="min-h-screen bg-gray-50 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Settings</h1>
        <p className="text-xl text-gray-600">Configure your Kairos experience</p>
      </div>
      
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Theme Preferences</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="radio" name="theme" className="mr-3" defaultChecked />
                <span>Light Mode</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="theme" className="mr-3" />
                <span>Dark Mode</span>
              </label>
              <label className="flex items-center">
                <input type="radio" name="theme" className="mr-3" />
                <span>Auto (System)</span>
              </label>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Notifications</h3>
            <div className="space-y-3">
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span>Email notifications</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" defaultChecked />
                <span>Real-time alerts</span>
              </label>
              <label className="flex items-center">
                <input type="checkbox" className="mr-3" />
                <span>Performance reports</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
)

function App() {
  return (
    <Router>
      <div className="min-h-screen">
        <Navigation />
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/dashboard" element={<EnhancedDashboard />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/atoms" element={<Atoms />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App