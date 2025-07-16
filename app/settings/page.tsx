/**
 * Settings page for timezone and other preferences
 */
"use client"

import { useState } from 'react'
import { Settings, Globe, Clock, Save, ArrowLeft } from 'lucide-react'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { useAuth } from '@/lib/auth/use-auth'
import TimezoneSelector, { TimezoneInfo } from '@/components/ui/timezone-selector'

export default function SettingsPage() {
  const { user } = useAuth()
  const { timezone } = useTimezone()
  const [showTimezoneTest, setShowTimezoneTest] = useState(false)
  
  const currentTime = new Date()
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto p-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <button 
                onClick={() => window.history.back()}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <Settings className="h-6 w-6 text-gray-700" />
              <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
            </div>
          </div>
        </div>
        
        {/* Timezone Settings */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-purple-600" />
              <h2 className="text-lg font-medium text-gray-900">Timezone Settings</h2>
            </div>
          </div>
          
          <div className="p-6">
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Current Timezone
                </label>
                <TimezoneSelector />
                <p className="mt-2 text-sm text-gray-600">
                  This timezone will be used to display all event times in your local time.
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Current Time
                </label>
                <div className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                  <Clock className="h-5 w-5 text-gray-500" />
                  <div>
                    <div className="text-lg font-mono text-gray-900">
                      {currentTime.toLocaleString('en-US', {
                        timeZone: timezone,
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                        hour12: false
                      })}
                    </div>
                    <div className="text-sm text-gray-600">
                      {currentTime.toLocaleDateString('en-US', {
                        timeZone: timezone,
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </div>
                  </div>
                </div>
              </div>
              
              <div>
                <TimezoneInfo className="p-3 bg-blue-50 rounded-lg" />
              </div>
              
              <div>
                <button
                  onClick={() => setShowTimezoneTest(!showTimezoneTest)}
                  className="text-sm text-purple-600 hover:text-purple-700 underline"
                >
                  {showTimezoneTest ? 'Hide' : 'Show'} timezone test
                </button>
                
                {showTimezoneTest && (
                  <div className="mt-3 p-4 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-3">
                      Sample event times in your timezone
                    </h4>
                    <div className="space-y-2 text-sm">
                      {[
                        { time: '09:00', label: 'Morning standup' },
                        { time: '14:00', label: 'Lunch meeting' },
                        { time: '17:00', label: 'End of day sync' }
                      ].map(event => {
                        const eventDate = new Date()
                        const [hour, minute] = event.time.split(':').map(Number)
                        eventDate.setHours(hour, minute, 0, 0)
                        
                        const localTime = eventDate.toLocaleString('en-US', {
                          timeZone: timezone,
                          hour: '2-digit',
                          minute: '2-digit',
                          hour12: false
                        })
                        
                        return (
                          <div key={event.time} className="flex justify-between">
                            <span className="text-gray-700">{event.label}</span>
                            <span className="font-mono text-gray-900">{localTime}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* User Info */}
        {user && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Account Information</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <div className="text-sm text-gray-900">{user.email}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    User ID
                  </label>
                  <div className="text-sm text-gray-600 font-mono">{user.id}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Account Created
                  </label>
                  <div className="text-sm text-gray-600">
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      timeZone: timezone,
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Timezone settings are automatically saved and applied to all your events.</p>
        </div>
      </div>
    </div>
  )
}
