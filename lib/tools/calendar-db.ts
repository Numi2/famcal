import { z } from 'zod'
import { tool } from 'ai'
import { localStorageService } from '../local-storage/storage-service'
import type { CalendarEvent } from '../local-storage/types'

// Helper function to convert ISO datetime to the format expected
const formatDateTime = (isoString: string): string => {
  return new Date(isoString).toISOString()
}

// Helper function to get day of week from date
const getDayOfWeek = (date: string): number => {
  return new Date(date).getDay()
}

// Helper function to get date string from ISO
const getDateString = (isoString: string): string => {
  return new Date(isoString).toISOString().split('T')[0]
}

// 1. CRUD Tools

export const createEvent = tool({
  description: 'Create a calendar event in the family database',
  parameters: z.object({
    title: z.string(),
    startTime: z.string().describe('ISO 8601 datetime string'),
    endTime: z.string().describe('ISO 8601 datetime string'),
    familyId: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    category: z.enum(['appointment', 'school', 'activity', 'meal', 'other']).default('other'),
    attendees: z.array(z.string()).default([]),
    recurring: z.boolean().default(false),
    recurrencePattern: z.string().optional(),
    color: z.string().optional()
  }),
  execute: async ({ title, startTime, endTime, familyId, description, location, category, attendees, recurring, recurrencePattern, color }) => {
    try {
      const event = await localStorageService.createEvent({
        family_id: familyId,
        title,
        description,
        start_time: formatDateTime(startTime),
        end_time: formatDateTime(endTime),
        location,
        category,
        attendees,
        recurring,
        recurrence_pattern: recurrencePattern,
        color
      })

      return {
        success: true,
        data: event
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event'
      }
    }
  }
})

export const getEvent = tool({
  description: 'Get a calendar event by ID',
  parameters: z.object({
    eventId: z.string()
  }),
  execute: async ({ eventId }) => {
    try {
      const event = await localStorageService.getEvent(eventId)
      
      if (!event) {
        return {
          success: false,
          error: 'Event not found'
        }
      }

      return {
        success: true,
        data: event
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to get event'
      }
    }
  }
})

export const updateEvent = tool({
  description: 'Update a calendar event',
  parameters: z.object({
    eventId: z.string(),
    updates: z.object({
      title: z.string().optional(),
      startTime: z.string().optional(),
      endTime: z.string().optional(),
      description: z.string().optional(),
      location: z.string().optional(),
      category: z.enum(['appointment', 'school', 'activity', 'meal', 'other']).optional(),
      attendees: z.array(z.string()).optional(),
      recurring: z.boolean().optional(),
      recurrencePattern: z.string().optional(),
      color: z.string().optional()
    })
  }),
  execute: async ({ eventId, updates }) => {
    try {
      const updateData: Partial<CalendarEvent> = {}
      
      if (updates.title) updateData.title = updates.title
      if (updates.startTime) updateData.start_time = formatDateTime(updates.startTime)
      if (updates.endTime) updateData.end_time = formatDateTime(updates.endTime)
      if (updates.description !== undefined) updateData.description = updates.description
      if (updates.location !== undefined) updateData.location = updates.location
      if (updates.category) updateData.category = updates.category
      if (updates.attendees) updateData.attendees = updates.attendees
      if (updates.recurring !== undefined) updateData.recurring = updates.recurring
      if (updates.recurrencePattern !== undefined) updateData.recurrence_pattern = updates.recurrencePattern
      if (updates.color !== undefined) updateData.color = updates.color

      const event = await localStorageService.updateEvent(eventId, updateData)

      return {
        success: true,
        data: event
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update event'
      }
    }
  }
})

export const deleteEvent = tool({
  description: 'Delete a calendar event',
  parameters: z.object({
    eventId: z.string()
  }),
  execute: async ({ eventId }) => {
    try {
      await localStorageService.deleteEvent(eventId)
      
      return {
        success: true
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete event'
      }
    }
  }
})

// 2. Query Tools

export const queryEventsByDateRange = tool({
  description: 'Query events within a date range',
  parameters: z.object({
    familyId: z.string(),
    startDate: z.string().describe('ISO 8601 date string'),
    endDate: z.string().describe('ISO 8601 date string')
  }),
  execute: async ({ familyId, startDate, endDate }) => {
    try {
      const events = await localStorageService.getEvents({
        familyId,
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      })

      return {
        success: true,
        data: events
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query events'
      }
    }
  }
})

export const queryEventsByCategory = tool({
  description: 'Query events by category',
  parameters: z.object({
    familyId: z.string(),
    category: z.enum(['appointment', 'school', 'activity', 'meal', 'other'])
  }),
  execute: async ({ familyId, category }) => {
    try {
      const events = await localStorageService.getEvents({
        familyId,
        category
      })

      return {
        success: true,
        data: events
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query events'
      }
    }
  }
})

export const queryEventsByAttendee = tool({
  description: 'Query events by attendee',
  parameters: z.object({
    familyId: z.string(),
    attendeeId: z.string()
  }),
  execute: async ({ familyId, attendeeId }) => {
    try {
      const events = await localStorageService.getEvents({
        familyId,
        attendeeId
      })

      return {
        success: true,
        data: events
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to query events'
      }
    }
  }
})

// Export all tools
export const calendarTools = {
  createEvent,
  getEvent,
  updateEvent,
  deleteEvent,
  queryEventsByDateRange,
  queryEventsByCategory,
  queryEventsByAttendee
}
