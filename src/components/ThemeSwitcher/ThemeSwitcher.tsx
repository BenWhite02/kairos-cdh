// File: src/components/ThemeSwitcher/ThemeSwitcher.tsx
// 🎨 Theme Switcher Component for Kairos Frontend
// Provides quick theme switching with visual preview and custom theme support
// All styles kept in classes as per project requirements

import React, { useState, useRef, useEffect } from 'react'
import { 
  Palette, 
  Sun, 
  Moon, 
  Monitor, 
  Check, 
  Plus, 
  Settings, 
  Download, 
  Upload,
  ChevronDown,
  Sparkles
} from 'lucide-react'
import { useThemeStore, useCurrentTheme, useThemeActions } from '@/stores/themeStore'
import { getAllThemes, getTheme } from '@/config/theme.config'

interface ThemeSwitcherProps {
  variant?: 'compact' | 'expanded' | 'dropdown'
  showCustomThemes?: boolean
  showThemeCreator?: boolean
  showImportExport?: boolean
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
  className?: string
}

export const ThemeSwitcher: React.FC<ThemeSwitcherProps> = ({
  variant = 'dropdown',
  showCustomThemes = true,
  showThemeCreator = true,
  showImportExport = false,
  position = 'bottom-right',
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [hoveredTheme, setHoveredTheme] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  const {
    currentTheme,
    isDarkMode,
    isSystemTheme,
    availableThemes,
    customThemes,
    isTransitioning,
    enableCustomColors,
    customColors
  } = useThemeStore()
  
  const { setTheme, toggleDarkMode, openThemeCreator } = useThemeActions()
  const currentThemeData = useCurrentTheme()

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const getThemeIcon = (themeId: string) => {
    switch (themeId) {
      case 'light':
        return <Sun className="theme-switcher-icon" />
      case 'dark':
        return <Moon className="theme-switcher-icon" />
      case 'system':
        return <Monitor className="theme-switcher-icon" />
      default:
        return <Palette className="theme-switcher-icon" />
    }
  }

  const getThemePreview = (themeId: string) => {
    const theme = getTheme(themeId) || customThemes.find(t => t.id === themeId)
    if (!theme) return null

    return (
      <div className="theme-switcher-preview">
        <div 
          className="theme-switcher-preview-primary"
          style={{ backgroundColor: theme.colors.primary[500] }}
        />
        <div 
          className="theme-switcher-preview-secondary"
          style={{ backgroundColor: theme.colors.secondary[500] }}
        />
        <div 
          className="theme-switcher-preview-accent"
          style={{ backgroundColor: theme.colors.accent[500] }}
        />
      </div>
    )
  }

  const handleThemeSelect = (themeId: string) => {
    setTheme(themeId)
    setIsOpen(false)
  }

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = async (e) => {
      try {
        const themeData = e.target?.result as string
        await useThemeStore.getState().importTheme(themeData)
      } catch (error) {
        console.error('Failed to import theme:', error)
      }
    }
    reader.readAsText(file)
    event.target.value = '' // Reset file input
  }

  const handleThemeExport = (themeId: string) => {
    const themeData = useThemeStore.getState().exportTheme(themeId)
    const blob = new Blob([themeData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `kairos-theme-${themeId}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  // Compact variant - just the current theme icon
  if (variant === 'compact') {
    return (
      <button
        onClick={toggleDarkMode}
        className={`theme-switcher-compact ${className}`}
        disabled={isTransitioning}
      >
        {getThemeIcon(currentTheme)}
        {isTransitioning && (
          <div className="theme-switcher-loading" />
        )}
      </button>
    )
  }

  // Expanded variant - horizontal theme options
  if (variant === 'expanded') {
    return (
      <div className={`theme-switcher-expanded ${className}`}>
        {getAllThemes().map((theme) => (
          <button
            key={theme.id}
            onClick={() => handleThemeSelect(theme.id)}
            className={`theme-switcher-option ${
              currentTheme === theme.id ? 'theme-switcher-option-active' : ''
            }`}
            disabled={isTransitioning}
          >
            {getThemeIcon(theme.id)}
            <span className="theme-switcher-option-label">{theme.name}</span>
            {getThemePreview(theme.id)}
          </button>
        ))}
        
        {showThemeCreator && (
          <button
            onClick={() => openThemeCreator()}
            className="theme-switcher-option theme-switcher-create"
          >
            <Plus className="theme-switcher-icon" />
            <span className="theme-switcher-option-label">Create</span>
          </button>
        )}
      </div>
    )
  }

  // Dropdown variant - default
  return (
    <div className={`theme-switcher-dropdown ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`theme-switcher-trigger ${isOpen ? 'theme-switcher-trigger-open' : ''}`}
        disabled={isTransitioning}
      >
        <div className="theme-switcher-trigger-content">
          {getThemeIcon(currentTheme)}
          <span className="theme-switcher-trigger-label">
            {currentThemeData?.name || 'Theme'}
          </span>
          {enableCustomColors && (
            <Sparkles className="theme-switcher-custom-indicator" />
          )}
        </div>
        <ChevronDown className="theme-switcher-chevron" />
        {isTransitioning && (
          <div className="theme-switcher-loading" />
        )}
      </button>

      {isOpen && (
        <div className={`theme-switcher-menu theme-switcher-menu-${position}`}>
          {/* Built-in Themes */}
          <div className="theme-switcher-section">
            <div className="theme-switcher-section-header">
              <span className="theme-switcher-section-title">Built-in Themes</span>
            </div>
            <div className="theme-switcher-options">
              {getAllThemes()
                .filter(theme => !theme.isCustom)
                .map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    onMouseEnter={() => setHoveredTheme(theme.id)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    className={`theme-switcher-menu-option ${
                      currentTheme === theme.id ? 'theme-switcher-menu-option-active' : ''
                    }`}
                  >
                    <div className="theme-switcher-menu-option-content">
                      {getThemeIcon(theme.id)}
                      <div className="theme-switcher-menu-option-info">
                        <span className="theme-switcher-menu-option-name">{theme.name}</span>
                        <span className="theme-switcher-menu-option-description">
                          {theme.description}
                        </span>
                      </div>
                      {getThemePreview(theme.id)}
                    </div>
                    {currentTheme === theme.id && (
                      <Check className="theme-switcher-check" />
                    )}
                  </button>
                ))}
            </div>
          </div>

          {/* Custom Themes */}
          {showCustomThemes && customThemes.length > 0 && (
            <div className="theme-switcher-section">
              <div className="theme-switcher-section-header">
                <span className="theme-switcher-section-title">Custom Themes</span>
              </div>
              <div className="theme-switcher-options">
                {customThemes.map((theme) => (
                  <button
                    key={theme.id}
                    onClick={() => handleThemeSelect(theme.id)}
                    onMouseEnter={() => setHoveredTheme(theme.id)}
                    onMouseLeave={() => setHoveredTheme(null)}
                    className={`theme-switcher-menu-option ${
                      currentTheme === theme.id ? 'theme-switcher-menu-option-active' : ''
                    }`}
                  >
                    <div className="theme-switcher-menu-option-content">
                      {getThemeIcon(theme.id)}
                      <div className="theme-switcher-menu-option-info">
                        <span className="theme-switcher-menu-option-name">{theme.name}</span>
                        <span className="theme-switcher-menu-option-description">
                          {theme.description}
                        </span>
                      </div>
                      {getThemePreview(theme.id)}
                    </div>
                    {currentTheme === theme.id && (
                      <Check className="theme-switcher-check" />
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="theme-switcher-section">
            <div className="theme-switcher-actions">
              {showThemeCreator && (
                <button
                  onClick={() => {
                    openThemeCreator()
                    setIsOpen(false)
                  }}
                  className="theme-switcher-action"
                >
                  <Plus className="theme-switcher-action-icon" />
                  <span className="theme-switcher-action-label">Create Theme</span>
                </button>
              )}
              
              <button
                onClick={() => {
                  openThemeCreator(currentTheme)
                  setIsOpen(false)
                }}
                className="theme-switcher-action"
              >
                <Settings className="theme-switcher-action-icon" />
                <span className="theme-switcher-action-label">Customize</span>
              </button>

              {showImportExport && (
                <>
                  <label className="theme-switcher-action theme-switcher-action-file">
                    <Upload className="theme-switcher-action-icon" />
                    <span className="theme-switcher-action-label">Import</span>
                    <input
                      type="file"
                      accept=".json"
                      onChange={handleFileImport}
                      className="theme-switcher-file-input"
                    />
                  </label>
                  
                  <button
                    onClick={() => {
                      handleThemeExport(currentTheme)
                      setIsOpen(false)
                    }}
                    className="theme-switcher-action"
                  >
                    <Download className="theme-switcher-action-icon" />
                    <span className="theme-switcher-action-label">Export</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ThemeSwitcher