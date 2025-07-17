"use client"

import { useState, useEffect, useCallback } from "react"
import { localStorageService } from "./storage-service"
import { Family, FamilyMember, CalendarEvent } from "./types"

// Hook to get current family ID
export function useLocalFamilyId() {
  const [familyId, setFamilyId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadFamilyId = async () => {
      try {
        const family = await localStorageService.getCurrentFamily()
        setFamilyId(family?.id || null)
      } catch (error) {
        console.error("Failed to load family ID:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadFamilyId()
  }, [])

  return { familyId, isLoading }
}

// Hook to get family data
export function useLocalFamilyData(familyId: string | null) {
  const [family, setFamily] = useState<Family | null>(null)
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadFamilyData = useCallback(async () => {
    if (!familyId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const [familyData, membersData] = await Promise.all([
        localStorageService.getFamily(familyId),
        localStorageService.getFamilyMembers(familyId),
      ])
      
      setFamily(familyData)
      setMembers(membersData)
    } catch (error) {
      console.error("Failed to load family data:", error)
    } finally {
      setIsLoading(false)
    }
  }, [familyId])

  useEffect(() => {
    loadFamilyData()
  }, [loadFamilyData])

  return { 
    family, 
    members, 
    isLoading,
    refetch: loadFamilyData
  }
}

// Hook to manage calendar events
export function useLocalCalendarEvents(familyId: string | null) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadEvents = useCallback(async () => {
    if (!familyId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const eventsData = await localStorageService.getEvents({ familyId })
      setEvents(eventsData)
    } catch (error) {
      console.error("Failed to load events:", error)
    } finally {
      setIsLoading(false)
    }
  }, [familyId])

  useEffect(() => {
    loadEvents()
  }, [loadEvents])

  const createEvent = useCallback(async (eventData: Omit<CalendarEvent, 'id' | 'created_at' | 'updated_at'>) => {
    try {
      const newEvent = await localStorageService.createEvent(eventData)
      await loadEvents()
      return newEvent
    } catch (error) {
      console.error("Failed to create event:", error)
      throw error
    }
  }, [loadEvents])

  const updateEvent = useCallback(async (eventId: string, updates: Partial<CalendarEvent>) => {
    try {
      const updatedEvent = await localStorageService.updateEvent(eventId, updates)
      await loadEvents()
      return updatedEvent
    } catch (error) {
      console.error("Failed to update event:", error)
      throw error
    }
  }, [loadEvents])

  const deleteEvent = useCallback(async (eventId: string) => {
    try {
      await localStorageService.deleteEvent(eventId)
      await loadEvents()
    } catch (error) {
      console.error("Failed to delete event:", error)
      throw error
    }
  }, [loadEvents])

  return {
    events,
    isLoading,
    createEvent,
    updateEvent,
    deleteEvent,
    refetch: loadEvents
  }
}

// Hook to manage family members
export function useLocalFamilyMembers(familyId: string | null) {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const loadMembers = useCallback(async () => {
    if (!familyId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      const membersData = await localStorageService.getFamilyMembers(familyId)
      setMembers(membersData)
    } catch (error) {
      console.error("Failed to load members:", error)
    } finally {
      setIsLoading(false)
    }
  }, [familyId])

  useEffect(() => {
    loadMembers()
  }, [loadMembers])

  const createMember = useCallback(async (memberData: Omit<FamilyMember, 'id' | 'created_at'>) => {
    try {
      const newMember = await localStorageService.createFamilyMember(memberData)
      await loadMembers()
      return newMember
    } catch (error) {
      console.error("Failed to create member:", error)
      throw error
    }
  }, [loadMembers])

  const updateMember = useCallback(async (memberId: string, updates: Partial<FamilyMember>) => {
    try {
      const updatedMember = await localStorageService.updateFamilyMember(memberId, updates)
      await loadMembers()
      return updatedMember
    } catch (error) {
      console.error("Failed to update member:", error)
      throw error
    }
  }, [loadMembers])

  const deleteMember = useCallback(async (memberId: string) => {
    try {
      await localStorageService.deleteFamilyMember(memberId)
      await loadMembers()
    } catch (error) {
      console.error("Failed to delete member:", error)
      throw error
    }
  }, [loadMembers])

  return {
    members,
    isLoading,
    createMember,
    updateMember,
    deleteMember,
    refetch: loadMembers
  }
}