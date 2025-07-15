/**
 * Timezone selector component for user preferences
 */
"use client"

import { useState } from 'react'
import { Globe, ChevronDown, Check } from 'lucide-react'
import { useTimezone } from '@/lib/hooks/use-timezone'
import { getAvailableTimezones } from '@/lib/utils/timezone'

export default function TimezoneSelector() {
  const { timezone, setTimezone } = useTimezone()
  const [isOpen, setIsOpen] = useState(false)
  const availableTimezones = getAvailableTimezones()
  
  const currentTimezone = availableTimezones.find(tz => tz.value === timezone)
  
  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors w-full justify-between"
      >
        <div className="flex items-center gap-2">
          <Globe className="h-4 w-4 text-gray-500" />
          <span className="text-sm text-gray-700">
            {currentTimezone?.label || timezone}
          </span>
        </div>
        <ChevronDown className={`h-4 w-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      
      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-20 max-h-60 overflow-y-auto">
            {availableTimezones.map((tz) => (
              <button
                key={tz.value}
                onClick={() => {
                  setTimezone(tz.value)
                  setIsOpen(false)
                }}
                className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors flex items-center justify-between ${
                  timezone === tz.value ? 'bg-purple-50 text-purple-700' : 'text-gray-700'
                }`}
              >
                <span>{tz.label}</span>
                {timezone === tz.value && (
                  <Check className="h-4 w-4 text-purple-600" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

// Helper component for displaying timezone info
export function TimezoneInfo({ className = '' }: { className?: string }) {
  const { timezone } = useTimezone()
  
  return (
    <div className={`flex items-center gap-2 text-sm text-gray-600 ${className}`}>
      <Globe className="h-4 w-4" />
      <span>
        {timezone} (UTC{new Date().toLocaleString('en-US', { 
          timeZone: timezone, 
          timeZoneName: 'short' 
        }).match(/GMT([+-]\d{1,2})/)?.[1] || ''})
      </span>
    </div>
  )
}
