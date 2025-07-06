// File: src/components/ThemeCreator/ThemeCreator.tsx
// 🎨 Advanced Theme Creator Component for Kairos Frontend
// Visual theme editor with real-time preview and comprehensive customization
// All styles kept in classes as per project requirements

import React, { useState, useEffect, useCallback } from 'react'
import { 
  X, 
  Save, 
  RotateCcw, 
  Eye, 
  EyeOff, 
  Download, 
  Upload, 
  Copy, 
  Palette,
  Type,
  Layout,
  Sparkles,
  ChevronRight,
  Check,
  AlertCircle
} from 'lucide-react'
import { useThemeCreator } from '@/stores/themeStore'
import { ThemeDefinition } from '@/config/theme.config'
import { ColorPicker } from './ColorPicker'
import { ThemePreview } from './ThemePreview'
import { TypographyEditor } from './TypographyEditor'
import { SpacingEditor } from './SpacingEditor'

interface ThemeCreatorProps {
  className?: string
}

type TabType = 'colors' | 'typography' | 'spacing' | 'preview'

interface ValidationError {
  field: string
  message: string
}

export const ThemeCreator: React.FC<ThemeCreatorProps> = ({ className = '' }) => {
  const [activeTab, setActiveTab] = useState<TabType>('colors')
  const [isPreviewMode, setIsPreviewMode] = useState(false)
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([])
  const [isSaving, setIsSaving] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle')
  
  const {
    isOpen,
    editingTheme,
    previewTheme,
    close,
    setEditing,
    setPreview,
    save,
    reset
  } = useThemeCreator()

  // Validate theme data
  const validateTheme = useCallback((theme: ThemeDefinition): ValidationError[] => {
    const errors: ValidationError[] = []

    if (!theme.name || theme.name.trim().length === 0) {
      errors.push({ field: 'name', message: 'Theme name is required' })
    }

    if (theme.name && theme.name.length > 50) {
      errors.push({ field: 'name', message: 'Theme name must be 50 characters or less' })
    }

    // Validate color hex values
    const colorGroups = ['primary', 'secondary', 'accent', 'success', 'warning', 'error', 'info', 'gray']
    colorGroups.forEach(group => {
      const colorGroup = theme.colors[group as keyof typeof theme.colors]
      if (typeof colorGroup === 'object') {
        Object.entries(colorGroup).forEach(([shade, value]) => {
          if (typeof value === 'string' && !isValidHexColor(value)) {
            errors.push({ 
              field: `colors.${group}.${shade}`, 
              message: `Invalid color value: ${value}` 
            })
          }
        })
      }
    })

    return errors
  }, [])

  const isValidHexColor = (color: string): boolean => {
    return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color)
  }

  // Update validation when editing theme changes
  useEffect(() => {
    if (editingTheme) {
      const errors = validateTheme(editingTheme)
      setValidationErrors(errors)
    }
  }, [editingTheme, validateTheme])

  // Handle theme preview
  useEffect(() => {
    if (isPreviewMode && editingTheme) {
      setPreview(editingTheme)
    } else {
      setPreview(undefined)
    }
  }, [isPreviewMode, editingTheme, setPreview])

  const handleSave = async () => {
    if (!editingTheme) return

    const errors = validateTheme(editingTheme)
    if (errors.length > 0) {
      setValidationErrors(errors)
      return
    }

    setIsSaving(true)
    setSaveStatus('idle')

    try {
      await save()
      setSaveStatus('success')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } catch (error) {
      setSaveStatus('error')
      console.error('Failed to save theme:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleClose = () => {
    setPreview(undefined)
    setIsPreviewMode(false)
    setActiveTab('colors')
    setValidationErrors([])
    setSaveStatus('idle')
    close()
  }

  const handleReset = () => {
    reset()
    setValidationErrors([])
    setSaveStatus('idle')
  }

  const handleExport = () => {
    if (!editingTheme) return

    const themeData = JSON.stringify({
      version: '1.0',
      theme: editingTheme,
      exportedAt: new Date().toISOString(),
      exportedBy: 'Kairos Theme Creator'
    }, null, 2)

    const blob = new Blob([themeData], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${editingTheme.name.toLowerCase().replace(/\s+/g, '-')}-theme.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const themeData = JSON.parse(e.target?.result as string)
        if (themeData.theme) {
          setEditing({
            ...themeData.theme,
            id: editingTheme?.id || 'new',
            isCustom: true
          })
        }
      } catch (error) {
        console.error('Failed to import theme:', error)
      }
    }
    reader.readAsText(file)
    event.target.value = ''
  }

  const handleDuplicate = () => {
    if (!editingTheme) return

    setEditing({
      ...editingTheme,
      id: 'new',
      name: `${editingTheme.name} Copy`,
      isCustom: true
    })
  }

  const updateTheme = (updates: Partial<ThemeDefinition>) => {
    if (!editingTheme) return

    const updatedTheme = { ...editingTheme, ...updates }
    setEditing(updatedTheme)
  }

  const tabs = [
    { id: 'colors' as TabType, label: 'Colors', icon: Palette },
    { id: 'typography' as TabType, label: 'Typography', icon: Type },
    { id: 'spacing' as TabType, label: 'Spacing', icon: Layout },
    { id: 'preview' as TabType, label: 'Preview', icon: Eye }
  ]

  if (!isOpen || !editingTheme) return null

  return (
    <div className={`theme-creator-overlay ${className}`}>
      <div className="theme-creator-container">
        {/* Header */}
        <div className="theme-creator-header">
          <div className="theme-creator-header-content">
            <div className="theme-creator-title-section">
              <Sparkles className="theme-creator-title-icon" />
              <h2 className="theme-creator-title">Theme Creator</h2>
              {saveStatus === 'success' && (
                <div className="theme-creator-save-status theme-creator-save-success">
                  <Check className="theme-creator-status-icon" />
                  <span>Saved</span>
                </div>
              )}
              {saveStatus === 'error' && (
                <div className="theme-creator-save-status theme-creator-save-error">
                  <AlertCircle className="theme-creator-status-icon" />
                  <span>Error</span>
                </div>
              )}
            </div>
            <div className="theme-creator-header-actions">
              <button
                onClick={() => setIsPreviewMode(!isPreviewMode)}
                className={`theme-creator-action-button ${
                  isPreviewMode ? 'theme-creator-action-active' : ''
                }`}
                title={isPreviewMode ? 'Exit Preview' : 'Preview Theme'}
              >
                {isPreviewMode ? <EyeOff className="theme-creator-action-icon" /> : <Eye className="theme-creator-action-icon" />}
              </button>
              <button
                onClick={handleDuplicate}
                className="theme-creator-action-button"
                title="Duplicate Theme"
              >
                <Copy className="theme-creator-action-icon" />
              </button>
              <button
                onClick={handleExport}
                className="theme-creator-action-button"
                title="Export Theme"
              >
                <Download className="theme-creator-action-icon" />
              </button>
              <label className="theme-creator-action-button" title="Import Theme">
                <Upload className="theme-creator-action-icon" />
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImport}
                  className="theme-creator-file-input"
                />
              </label>
              <button
                onClick={handleClose}
                className="theme-creator-close-button"
                title="Close"
              >
                <X className="theme-creator-close-icon" />
              </button>
            </div>
          </div>

          {/* Theme Info */}
          <div className="theme-creator-info">
            <div className="theme-creator-info-field">
              <label className="theme-creator-label">Theme Name</label>
              <input
                type="text"
                value={editingTheme.name}
                onChange={(e) => updateTheme({ name: e.target.value })}
                className="theme-creator-input"
                placeholder="Enter theme name"
              />
            </div>
            <div className="theme-creator-info-field">
              <label className="theme-creator-label">Description</label>
              <input
                type="text"
                value={editingTheme.description || ''}
                onChange={(e) => updateTheme({ description: e.target.value })}
                className="theme-creator-input"
                placeholder="Enter theme description"
              />
            </div>
            <div className="theme-creator-info-field">
              <label className="theme-creator-checkbox-label">
                <input
                  type="checkbox"
                  checked={editingTheme.isDark}
                  onChange={(e) => updateTheme({ isDark: e.target.checked })}
                  className="theme-creator-checkbox"
                />
                <span>Dark Theme</span>
              </label>
            </div>
          </div>

          {/* Validation Errors */}
          {validationErrors.length > 0 && (
            <div className="theme-creator-errors">
              {validationErrors.map((error, index) => (
                <div key={index} className="theme-creator-error">
                  <AlertCircle className="theme-creator-error-icon" />
                  <span>{error.message}</span>
                </div>
              ))}
            </div>
          )}

          {/* Tabs */}
          <div className="theme-creator-tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`theme-creator-tab ${
                    activeTab === tab.id ? 'theme-creator-tab-active' : ''
                  }`}
                >
                  <Icon className="theme-creator-tab-icon" />
                  <span className="theme-creator-tab-label">{tab.label}</span>
                  {activeTab === tab.id && (
                    <ChevronRight className="theme-creator-tab-indicator" />
                  )}
                </button>
              )
            })}
          </div>
        </div>

        {/* Content */}
        <div className="theme-creator-content">
          {activeTab === 'colors' && (
            <ColorPicker
              theme={editingTheme}
              onChange={updateTheme}
              className="theme-creator-color-section"
            />
          )}

          {activeTab === 'typography' && (
            <TypographyEditor
              theme={editingTheme}
              onChange={updateTheme}
              className="theme-creator-typography-section"
            />
          )}

          {activeTab === 'spacing' && (
            <SpacingEditor
              theme={editingTheme}
              onChange={updateTheme}
              className="theme-creator-spacing-section"
            />
          )}

          {activeTab === 'preview' && (
            <ThemePreview
              theme={editingTheme}
              className="theme-creator-preview-section"
            />
          )}
        </div>

        {/* Footer */}
        <div className="theme-creator-footer">
          <div className="theme-creator-footer-info">
            <span className="theme-creator-footer-text">
              {editingTheme.id === 'new' ? 'Creating new theme' : `Editing: ${editingTheme.name}`}
            </span>
          </div>
          <div className="theme-creator-footer-actions">
            <button
              onClick={handleReset}
              className="theme-creator-button theme-creator-button-secondary"
              disabled={isSaving}
            >
              <RotateCcw className="theme-creator-button-icon" />
              Reset
            </button>
            <button
              onClick={handleClose}
              className="theme-creator-button theme-creator-button-ghost"
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="theme-creator-button theme-creator-button-primary"
              disabled={isSaving || validationErrors.length > 0}
            >
              <Save className="theme-creator-button-icon" />
              {isSaving ? 'Saving...' : editingTheme.id === 'new' ? 'Create Theme' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ThemeCreator