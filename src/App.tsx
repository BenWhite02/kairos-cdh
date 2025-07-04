/* 
 * src/App.tsx
 * Main App component for Kairos Frontend
 * Includes React Router setup and basic layout with Tailwind CSS
 */
import { useState } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { HomeIcon, UserIcon, CogIcon } from '@heroicons/react/24/outline'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

// Import pages
import Home from './pages/Home'
import About from './pages/About'
import Settings from './pages/Settings'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation */}
      <nav className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-2">
                <img src={viteLogo} className="h-8 w-8" alt="Vite logo" />
                <img src={reactLogo} className="h-8 w-8" alt="React logo" />
                <span className="text-xl font-bold text-gray-900">Kairos</span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link 
                to="/" 
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              >
                <HomeIcon className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link 
                to="/about" 
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              >
                <UserIcon className="h-4 w-4" />
                <span>About</span>
              </Link>
              <Link 
                to="/settings" 
                className="flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-primary-600 hover:bg-gray-100"
              >
                <CogIcon className="h-4 w-4" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Routes>
          <Route path="/" element={<Home count={count} setCount={setCount} />} />
          <Route path="/about" element={<About />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </main>
    </div>
  )
}

export default App