import { tool } from 'ai';
import { z } from 'zod';

export const calendarTools = {
  createEvent: tool({
    description: 'Create a new calendar event for the family',
    parameters: z.object({
      title: z.string().describe('The title of the event'),
      startTime: z.string().describe('ISO 8601 datetime string for start time'),
      endTime: z.string().describe('ISO 8601 datetime string for end time'),
      participants: z.array(z.string()).describe('Array of family member IDs'),
      location: z.string().optional().describe('Location of the event'),
      description: z.string().optional().describe('Additional details about the event'),
      category: z.enum(['appointment', 'activity', 'meal', 'chore', 'school', 'other']).optional(),
      recurring: z.object({
        frequency: z.enum(['daily', 'weekly', 'biweekly', 'monthly']),
        until: z.string().optional().describe('ISO 8601 date string for recurrence end'),
        daysOfWeek: z.array(z.number().min(0).max(6)).optional().describe('0=Sunday, 6=Saturday'),
      }).optional(),
      reminders: z.array(z.object({
        minutes: z.number().describe('Minutes before event to send reminder'),
        type: z.enum(['notification', 'email', 'sms']).optional()
      })).optional()
    }),
    execute: async (params) => {
      // This will be implemented in the CalendarActions class
      return { success: true, eventId: 'temp-id', params };
    }
  }),

  updateEvent: tool({
    description: 'Update an existing calendar event',
    parameters: z.object({
      eventId: z.string().describe('The ID of the event to update'),
      updates: z.object({
        title: z.string().optional(),
        startTime: z.string().optional(),
        endTime: z.string().optional(),
        participants: z.array(z.string()).optional(),
        location: z.string().optional(),
        description: z.string().optional(),
        category: z.enum(['appointment', 'activity', 'meal', 'chore', 'school', 'other']).optional(),
      })
    }),
    execute: async (params) => {
      return { success: true, params };
    }
  }),

  deleteEvent: tool({
    description: 'Delete a calendar event',
    parameters: z.object({
      eventId: z.string().describe('The ID of the event to delete'),
      deleteRecurring: z.enum(['single', 'all', 'future']).optional().describe('How to handle recurring events')
    }),
    execute: async (params) => {
      return { success: true, params };
    }
  }),

  searchEvents: tool({
    description: 'Search for events in the family calendar',
    parameters: z.object({
      query: z.string().optional().describe('Text to search for in event titles/descriptions'),
      startDate: z.string().optional().describe('ISO 8601 date string for range start'),
      endDate: z.string().optional().describe('ISO 8601 date string for range end'),
      participants: z.array(z.string()).optional().describe('Filter by participant IDs'),
      categories: z.array(z.enum(['appointment', 'activity', 'meal', 'chore', 'school', 'other'])).optional(),
      limit: z.number().min(1).max(100).default(20)
    }),
    execute: async (params) => {
      return { events: [], params };
    }
  }),

  findAvailableSlot: tool({
    description: 'Find available time slots for all specified family members',
    parameters: z.object({
      duration: z.number().describe('Duration needed in minutes'),
      participants: z.array(z.string()).describe('Family member IDs who need to be available'),
      startDate: z.string().describe('ISO 8601 date string for search start'),
      endDate: z.string().describe('ISO 8601 date string for search end'),
      preferredTimes: z.object({
        morningStart: z.string().optional().default('08:00'),
        morningEnd: z.string().optional().default('12:00'),
        afternoonStart: z.string().optional().default('12:00'),
        afternoonEnd: z.string().optional().default('17:00'),
        eveningStart: z.string().optional().default('17:00'),
        eveningEnd: z.string().optional().default('21:00'),
      }).optional(),
      constraints: z.object({
        avoidMealTimes: z.boolean().optional().default(true),
        avoidBedtime: z.boolean().optional().default(true),
        preferWeekend: z.boolean().optional().default(false),
        minimumBreak: z.number().optional().default(15).describe('Minimum minutes between events')
      }).optional()
    }),
    execute: async (params) => {
      return { availableSlots: [], params };
    }
  }),

  checkConflicts: tool({
    description: 'Check if a proposed event would conflict with existing events',
    parameters: z.object({
      startTime: z.string().describe('ISO 8601 datetime string'),
      endTime: z.string().describe('ISO 8601 datetime string'),
      participants: z.array(z.string()).describe('Family member IDs to check'),
      excludeEventId: z.string().optional().describe('Event ID to exclude from conflict check (for updates)')
    }),
    execute: async (params) => {
      return { hasConflicts: false, conflicts: [], params };
    }
  }),

  suggestReschedule: tool({
    description: 'Suggest alternative times for an event that has conflicts',
    parameters: z.object({
      eventId: z.string().describe('The event that needs rescheduling'),
      searchDays: z.number().min(1).max(30).default(7).describe('Number of days to search for alternatives'),
      maxSuggestions: z.number().min(1).max(10).default(3)
    }),
    execute: async (params) => {
      return { suggestions: [], params };
    }
  })
};