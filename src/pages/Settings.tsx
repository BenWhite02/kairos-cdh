/* 
 * src/pages/Settings.tsx
 * Settings page component for Kairos Frontend
 * Demonstrates form controls and configuration options using Headless UI
 */
import { useState } from 'react'
import { Switch } from '@headlessui/react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import Badge from '@/components/ui/Badge'

function Settings() {
  const [darkMode, setDarkMode] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [autoSave, setAutoSave] = useState(true)

  const handleSaveSettings = () => {
    // Handle saving settings
    console.log('Settings saved:', { darkMode, notifications, autoSave })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Page Header */}
      <div className="space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">Settings</h1>
        <p className="text-xl text-gray-600">
          Customize your application preferences
        </p>
      </div>

      {/* Appearance Settings */}
      <Card>
        <h2 className="text-2xl font-semibold mb-6">Appearance</h2>
        <div className="space-y-6">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-gray-900">Dark Mode</h3>
              <p className="text-sm text-gray-600">
                Toggle between light and dark themes
              </p>
            </div>
            <Switch
              checked={darkMode}
              onChange={setDarkMode}
              className={`${
                darkMode ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span className="sr-only">Enable dark mode</span>
              <span
                className={`${
                  darkMode ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>
      </Card>

      {/* Notification Settings */}
      <Card>
        <h2 className="text-2xl font-semibold mb-6">Notifications</h2>
        <div className="space-y-6">
          {/* Email Notifications */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-gray-900">Email Notifications</h3>
              <p className="text-sm text-gray-600">
                Receive email updates about important events
              </p>
            </div>
            <Switch
              checked={notifications}
              onChange={setNotifications}
              className={`${
                notifications ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span className="sr-only">Enable notifications</span>
              <span
                className={`${
                  notifications ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>
      </Card>

      {/* Application Settings */}
      <Card>
        <h2 className="text-2xl font-semibold mb-6">Application</h2>
        <div className="space-y-6">
          {/* Auto Save */}
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-medium text-gray-900">Auto Save</h3>
              <p className="text-sm text-gray-600">
                Automatically save your work as you type
              </p>
            </div>
            <Switch
              checked={autoSave}
              onChange={setAutoSave}
              className={`${
                autoSave ? 'bg-primary-600' : 'bg-gray-200'
              } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
            >
              <span className="sr-only">Enable auto save</span>
              <span
                className={`${
                  autoSave ? 'translate-x-6' : 'translate-x-1'
                } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
              />
            </Switch>
          </div>
        </div>
      </Card>

      {/* Current Settings Summary */}
      <Card>
        <h2 className="text-2xl font-semibold mb-6">Current Configuration</h2>
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant={darkMode ? 'primary' : 'secondary'}>
              Dark Mode: {darkMode ? 'Enabled' : 'Disabled'}
            </Badge>
            <Badge variant={notifications ? 'primary' : 'secondary'}>
              Notifications: {notifications ? 'On' : 'Off'}
            </Badge>
            <Badge variant={autoSave ? 'primary' : 'secondary'}>
              Auto Save: {autoSave ? 'On' : 'Off'}
            </Badge>
          </div>
        </div>
      </Card>

      {/* Action Buttons */}
      <div className="flex justify-end space-x-4">
        <Button variant="secondary">
          Reset to Defaults
        </Button>
        <Button variant="primary" onClick={handleSaveSettings}>
          Save Settings
        </Button>
      </div>
    </div>
  )
}

export default Settings