// File: src/App.tsx
// Basic App component to get Kairos started

import React from 'react';
import { ThemeProvider } from './styles/ThemeProvider';
import { ThemeSwitcher } from './components/theme/ThemeSwitcher';
import './App.css';

function App() {
  return (
    <ThemeProvider>
      <div className="min-h-screen bg-background text-text">
        {/* Header */}
        <header className="border-b border-border bg-surface">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                <h1 className="text-xl font-semibold text-primary">
                  ⏰ Kairos
                </h1>
                <span className="ml-2 text-sm text-text-muted">
                  The Perfect Moment
                </span>
              </div>
              <ThemeSwitcher />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold mb-4">
              Welcome to Kairos
            </h2>
            <p className="text-lg text-text-secondary mb-8">
              The perfect moment delivery interface is ready for development.
            </p>
            
            {/* Demo Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
              <div className="kairos-card p-6">
                <h3 className="text-lg font-semibold mb-2">Theme System</h3>
                <p className="text-text-secondary">
                  Switch between themes using the theme switcher in the header.
                </p>
              </div>
              
              <div className="kairos-card p-6">
                <h3 className="text-lg font-semibold mb-2">Components</h3>
                <p className="text-text-secondary">
                  Pre-built components with consistent styling across themes.
                </p>
                <button className="kairos-button mt-4">
                  Sample Button
                </button>
              </div>
              
              <div className="kairos-card p-6">
                <h3 className="text-lg font-semibold mb-2">Ready to Build</h3>
                <p className="text-text-secondary">
                  Start building your perfect moment delivery interface.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="border-t border-border bg-surface mt-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <p className="text-center text-text-muted text-sm">
              Kairos - Delivering the perfect moment, every time.
            </p>
          </div>
        </footer>
      </div>
    </ThemeProvider>
  );
}

export default App;