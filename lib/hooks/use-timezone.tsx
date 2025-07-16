/**
 * Timezone context for managing user timezone preferences
 */
"use client"

import React from "react"
import { createContext, useContext, useEffect, useState } from 'react'
import { getUserTimezone } from '@/lib/utils/timezone'
import { useAuth } from '@/lib/auth/use-auth'

interface TimezoneContextType {
  timezone: string
  setTimezone: (timezone: string) => void
  isLoading: boolean
}

const TimezoneContext = createContext<TimezoneContextType | undefined>(undefined)

export function TimezoneProvider({ children }: { children: React.ReactNode }) {
  const [timezone, setTimezoneState] = useState<string>('UTC')
  const [isLoading, setIsLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const initializeTimezone = async () => {
      try {
        // First, try to get from user preferences (if stored in database)
        if (user) {
          // TODO: Fetch from user preferences in database
          // For now, use browser timezone
        }
        
        // Fall back to browser timezone
        const browserTimezone = getUserTimezone()
        setTimezoneState(browserTimezone)
        
        // Store in localStorage for persistence
        localStorage.setItem('user-timezone', browserTimezone)
      } catch (error) {
        console.error('Failed to initialize timezone:', error)
        setTimezoneState('UTC')
      } finally {
        setIsLoading(false)
      }
    }

    initializeTimezone()
  }, [user])

  const setTimezone = (newTimezone: string) => {
    setTimezoneState(newTimezone)
    localStorage.setItem('user-timezone', newTimezone)
    
    // TODO: Update user preferences in database
    if (user) {
      // Save to database
    }
  }

  const value = {
    timezone,
    setTimezone,
    isLoading
  }

  return (
    <TimezoneContext.Provider value={value}>
      {children}
    </TimezoneContext.Provider>
  )
}

export function useTimezone() {
  const context = useContext(TimezoneContext)
  if (context === undefined) {
    throw new Error('useTimezone must be used within a TimezoneProvider')
  }
  return context
}
