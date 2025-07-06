// File: src/main.tsx (Simplified version for testing)
import React from 'react'
import ReactDOM from 'react-dom/client'
import './styles/index.css'
import { SimpleThemeProvider } from './components/SimpleThemeProvider'

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-background text-text-primary">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8 text-primary">
          🎨 KAIROS Frontend
        </h1>
        <div className="text-center">
          <p className="text-lg text-text-secondary mb-4">
            The Perfect Moment Delivery Interface
          </p>
          <p className="text-sm text-text-tertiary">
            Theme system is working! ✅
          </p>
        </div>
      </div>
    </div>
  )
}

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <SimpleThemeProvider>
      <App />
    </SimpleThemeProvider>
  </React.StrictMode>
)