// File: src/components/theme/ThemeSwitcher.tsx
// Simple theme switcher component

import React, { useState } from 'react';
import { useTheme } from '../../styles/ThemeProvider';

interface ThemeSwitcherProps {
  className?: string;
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  className = '',
}) => {
  const { currentTheme, setTheme, availableThemes } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const handleThemeSelect = (themeName: string) => {
    setTheme(themeName);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium bg-surface border border-border rounded-md hover:bg-surface-hover transition-colors"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Switch theme"
      >
        <span className="w-4 h-4">🎨</span>
        <span className="hidden sm:inline">
          {currentTheme.displayName}
        </span>
        <span className={`w-4 h-4 transition-transform ${
          isOpen ? 'rotate-180' : ''
        }`}>
          ▼
        </span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-1 w-64 bg-surface border border-border rounded-md shadow-lg z-50">
          <div className="p-3 border-b border-border">
            <h3 className="text-sm font-semibold text-text">Choose Theme</h3>
            <p className="text-xs text-text-muted mt-1">
              Select a theme for the perfect moment interface
            </p>
          </div>
          
          <div className="max-h-64 overflow-y-auto">
            {Object.entries(availableThemes).map(([themeName, theme]) => (
              <button
                key={themeName}
                className={`w-full px-3 py-2 text-left hover:bg-surface-hover transition-colors ${
                  currentTheme.name === themeName ? 'bg-primary/10 text-primary' : 'text-text'
                }`}
                onClick={() => handleThemeSelect(themeName)}
              >
                <div className="flex items-center gap-3">
                  <div 
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ 
                      backgroundColor: themeName === 'dark' ? '#3b82f6' : 
                                     themeName === 'high-contrast' ? '#0000ff' : '#2563eb'
                    }}
                  />
                  <div className="flex-1">
                    <div className="text-sm font-medium">{theme.displayName}</div>
                    {theme.description && (
                      <div className="text-xs text-text-muted">{theme.description}</div>
                    )}
                  </div>
                  {theme.isCustom && (
                    <span className="text-xs px-2 py-1 bg-accent/20 text-accent rounded">
                      Custom
                    </span>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {isOpen && (
        <div 
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};