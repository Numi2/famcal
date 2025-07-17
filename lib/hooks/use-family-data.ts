"use client"

import { useMemo } from 'react'
import { useLocalFamilyId, useLocalFamilyData, useLocalCalendarEvents } from '@/lib/local-storage/hooks'

export function useFamilyData() {
  const { familyId, isLoading: familyIdLoading } = useLocalFamilyId()
  const { family, members, isLoading: familyDataLoading } = useLocalFamilyData(familyId)
  const { events, isLoading: eventsLoading } = useLocalCalendarEvents(familyId)

  // Transform local storage data to match the expected format
  const familyMembers = useMemo(() => {
    return members.map(member => ({
      id: member.id,
      name: member.name,
      role: member.role,
      age: undefined,
      grade: undefined,
      school: undefined,
      color: member.color || 'bg-blue-500',
      allergies: [],
      preferences: {},
      avatarUrl: member.avatar_url
    }))
  }, [members])

  const familyEvents = useMemo(() => {
    return events.map(event => ({
      id: event.id,
      title: event.title,
      startTime: event.start_time,
      endTime: event.end_time,
      day: new Date(event.start_time).getDate(),
      date: event.start_time,
      description: event.description || '',
      location: event.location || '',
      type: event.category,
      assignedTo: event.attendees || [],
      organizer: members.find(m => m.role === 'parent')?.id || '',
      color: event.color || 'bg-blue-500',
      priority: 'medium' as const
    }))
  }, [events, members])

  // For now, return empty arrays for meal plans and chore assignments
  // These features can be added to local storage later if needed
  const mealPlans: any[] = []
  const choreAssignments: any[] = []

  return {
    familyMembers,
    familyEvents,
    mealPlans,
    choreAssignments,
    loading: familyIdLoading || familyDataLoading || eventsLoading,
    error: null
  }
}
