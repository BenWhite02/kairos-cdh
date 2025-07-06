// File: src/styles/ThemeProvider.tsx
// Theme provider with style switcher and creator capabilities
// All styles kept in classes as requested for Kairos

import React, { createContext, useContext, useState, useEffect } from 'react';

// Basic theme type for now
interface KairosTheme {
  name: string;
  displayName: string;
  description?: string;
  isCustom?: boolean;
}

interface ThemeContextType {
  currentTheme: KairosTheme;
  setTheme: (themeName: string) => void;
  availableThemes: Record<string, KairosTheme>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

// Default themes
const defaultThemes: Record<string, KairosTheme> = {
  default: {
    name: 'default',
    displayName: 'Kairos Default',
    description: 'The perfect moment delivery interface theme',
  },
  dark: {
    name: 'dark',
    displayName: 'Kairos Dark',
    description: 'Dark mode for focused nighttime work',
  },
  'high-contrast': {
    name: 'high-contrast',
    displayName: 'Kairos High Contrast',
    description: 'High contrast theme for better accessibility',
  },
};

interface ThemeProviderProps {
  children: React.ReactNode;
  initialTheme?: string;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ 
  children, 
  initialTheme = 'default' 
}) => {
  const [availableThemes] = useState<Record<string, KairosTheme>>(defaultThemes);
  const [currentThemeName, setCurrentThemeName] = useState<string>(initialTheme);
  const [currentTheme, setCurrentTheme] = useState<KairosTheme>(defaultThemes[initialTheme] || defaultThemes.default);

  // Load saved theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('kairos-current-theme');
    if (savedTheme && availableThemes[savedTheme]) {
      setCurrentThemeName(savedTheme);
      setCurrentTheme(availableThemes[savedTheme]);
    }
  }, [availableThemes]);

  // Apply theme to document
  useEffect(() => {
    const root = document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove(...Array.from(root.classList).filter(cls => cls.startsWith('theme-')));
    
    // Add current theme class
    root.classList.add(`theme-${currentTheme.name}`);

    // Save current theme preference
    localStorage.setItem('kairos-current-theme', currentThemeName);
  }, [currentTheme, currentThemeName]);

  const setTheme = (themeName: string) => {
    if (availableThemes[themeName]) {
      setCurrentThemeName(themeName);
      setCurrentTheme(availableThemes[themeName]);
    }
  };

  return (
    <ThemeContext.Provider
      value={{
        currentTheme,
        setTheme,
        availableThemes,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
};