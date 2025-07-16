"use client"

import React, { createContext, useContext, useState, useEffect } from "react"
import { localStorageService } from "./storage-service"

interface LocalAuthContextType {
  isAuthenticated: boolean
  isLoading: boolean
  user: { id: string; email: string } | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  signUp: () => Promise<void>
}

const LocalAuthContext = createContext<LocalAuthContextType>({
  isAuthenticated: true,
  isLoading: false,
  user: { id: "local-user", email: "user@local.com" },
  signIn: async () => {},
  signOut: async () => {},
  signUp: async () => {},
})

export function LocalAuthProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initialize demo data on first load
    const initializeData = async () => {
      try {
        await localStorageService.initializeDemoData()
      } catch (error) {
        console.error("Failed to initialize demo data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    initializeData()
  }, [])

  // Always authenticated in local storage mode
  const value: LocalAuthContextType = {
    isAuthenticated: true,
    isLoading,
    user: { id: "local-user", email: "user@local.com" },
    signIn: async () => {
      // No-op for local storage
    },
    signOut: async () => {
      // No-op for local storage
    },
    signUp: async () => {
      // No-op for local storage
    },
  }

  return (
    <LocalAuthContext.Provider value={value}>
      {children}
    </LocalAuthContext.Provider>
  )
}

export function useLocalAuth() {
  const context = useContext(LocalAuthContext)
  if (!context) {
    throw new Error("useLocalAuth must be used within LocalAuthProvider")
  }
  return context
}