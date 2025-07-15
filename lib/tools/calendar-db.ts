import { z } from 'zod'
import { tool } from 'ai'
import { supabase } from '../supabase/client'
import type { Database } from '../supabase/types'

type FamilyEvent = Database['public']['Tables']['family_events']['Row']
type FamilyEventInsert = Database['public']['Tables']['family_events']['Insert']
type FamilyEventUpdate = Database['public']['Tables']['family_events']['Update']

// Helper function to convert ISO datetime to the format expected by the database
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
    description: z.string().optional(),
    startTime: z.string().datetime(), // ISO-8601 UTC
    endTime: z.string().datetime(),
    location: z.string().optional(),
    type: z.string().default('general'),
    assignedTo: z.array(z.string()).default([]),
    organizer: z.string(),
    color: z.string().default('#3b82f6'),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
    isRecurring: z.boolean().default(false),
    recurrencePattern: z.any().optional(), // RFC 5545 compatible
    reminders: z.any().optional(),
    notes: z.string().optional(),
    cost: z.number().optional(),
    requiresTransport: z.boolean().optional(),
    carpoolInfo: z.any().optional(),
    weatherDependent: z.boolean().optional(),
    ageAppropriate: z.any().optional(),
    familyId: z.string()
  }),
  async execute(args) {
    try {
      const eventData: FamilyEventInsert = {
        title: args.title,
        description: args.description || null,
        start_time: formatDateTime(args.startTime),
        end_time: formatDateTime(args.endTime),
        day: getDayOfWeek(args.startTime),
        date: getDateString(args.startTime),
        location: args.location || null,
        type: args.type,
        assigned_to: args.assignedTo,
        organizer: args.organizer,
        color: args.color,
        priority: args.priority,
        is_recurring: args.isRecurring,
        recurrence_pattern: args.recurrencePattern || null,
        reminders: args.reminders || null,
        notes: args.notes || null,
        cost: args.cost || null,
        requires_transport: args.requiresTransport || null,
        carpool_info: args.carpoolInfo || null,
        weather_dependent: args.weatherDependent || null,
        age_appropriate: args.ageAppropriate || null,
        family_id: args.familyId
      }

      const { data, error } = await supabase
        .from('family_events')
        .insert(eventData)
        .select()
        .single()

      if (error) {
        throw new Error(`Failed to create event: ${error.message}`)
      }

      return data
    } catch (error) {
      console.error('Error creating event:', error)
      throw new Error(`Failed to create event: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
})

export const updateEvent = tool({
  description: 'Update an existing calendar event',
  parameters: z.object({
    eventId: z.number(),
    title: z.string().optional(),
    description: z.string().optional(),
    startTime: z.string().datetime().optional(),
    endTime: z.string().datetime().optional(),
    location: z.string().optional(),
    type: z.string().optional(),
    assignedTo: z.array(z.string()).optional(),
    organizer: z.string().optional(),
    color: z.string().optional(),
    priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
    isRecurring: z.boolean().optional(),
    recurrencePattern: z.any().optional(),
    reminders: z.any().optional(),
    notes: z.string().optional(),
    cost: z.number().optional(),
    requiresTransport: z.boolean().optional(),
    carpoolInfo: z.any().optional(),
    weatherDependent: z.boolean().optional(),
    ageAppropriate: z.any().optional()
  }),
  async execute(args) {
    const { eventId, ...updateData } = args
    
    // Convert optional fields to the expected format
    const eventUpdate: FamilyEventUpdate = {}
    
    if (updateData.title !== undefined) eventUpdate.title = updateData.title
    if (updateData.description !== undefined) eventUpdate.description = updateData.description
    if (updateData.startTime !== undefined) {
      eventUpdate.start_time = formatDateTime(updateData.startTime)
      eventUpdate.day = getDayOfWeek(updateData.startTime)
      eventUpdate.date = getDateString(updateData.startTime)
    }
    if (updateData.endTime !== undefined) eventUpdate.end_time = formatDateTime(updateData.endTime)
    if (updateData.location !== undefined) eventUpdate.location = updateData.location
    if (updateData.type !== undefined) eventUpdate.type = updateData.type
    if (updateData.assignedTo !== undefined) eventUpdate.assigned_to = updateData.assignedTo
    if (updateData.organizer !== undefined) eventUpdate.organizer = updateData.organizer
    if (updateData.color !== undefined) eventUpdate.color = updateData.color
    if (updateData.priority !== undefined) eventUpdate.priority = updateData.priority
    if (updateData.isRecurring !== undefined) eventUpdate.is_recurring = updateData.isRecurring
    if (updateData.recurrencePattern !== undefined) eventUpdate.recurrence_pattern = updateData.recurrencePattern
    if (updateData.reminders !== undefined) eventUpdate.reminders = updateData.reminders
    if (updateData.notes !== undefined) eventUpdate.notes = updateData.notes
    if (updateData.cost !== undefined) eventUpdate.cost = updateData.cost
    if (updateData.requiresTransport !== undefined) eventUpdate.requires_transport = updateData.requiresTransport
    if (updateData.carpoolInfo !== undefined) eventUpdate.carpool_info = updateData.carpoolInfo
    if (updateData.weatherDependent !== undefined) eventUpdate.weather_dependent = updateData.weatherDependent
    if (updateData.ageAppropriate !== undefined) eventUpdate.age_appropriate = updateData.ageAppropriate

    const { data, error } = await supabase
      .from('family_events')
      .update(eventUpdate)
      .eq('id', eventId)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to update event: ${error.message}`)
    }

    return data
  }
})

export const cancelEvent = tool({
  description: 'Delete a calendar event',
  parameters: z.object({
    eventId: z.number()
  }),
  async execute(args) {
    const { error } = await supabase
      .from('family_events')
      .delete()
      .eq('id', args.eventId)

    if (error) {
      throw new Error(`Failed to delete event: ${error.message}`)
    }

    return { success: true, eventId: args.eventId }
  }
})

// 2. Query Tools

export const getEvent = tool({
  description: 'Get a single event by ID',
  parameters: z.object({
    eventId: z.number()
  }),
  async execute(args) {
    const { data, error } = await supabase
      .from('family_events')
      .select('*')
      .eq('id', args.eventId)
      .single()

    if (error) {
      throw new Error(`Failed to get event: ${error.message}`)
    }

    return data
  }
})

export const listEvents = tool({
  description: 'List events within a date range',
  parameters: z.object({
    from: z.string().datetime(),
    to: z.string().datetime(),
    familyId: z.string()
  }),
  async execute(args) {
    const { data, error } = await supabase
      .from('family_events')
      .select('*')
      .eq('family_id', args.familyId)
      .gte('start_time', formatDateTime(args.from))
      .lte('end_time', formatDateTime(args.to))
      .order('start_time', { ascending: true })

    if (error) {
      throw new Error(`Failed to list events: ${error.message}`)
    }

    return data
  }
})

// 3. Availability Tools

export const freeBusy = tool({
  description: 'Get busy time ranges within a window',
  parameters: z.object({
    windowStart: z.string().datetime(),
    windowEnd: z.string().datetime(),
    familyId: z.string()
  }),
  async execute(args) {
    const { data, error } = await supabase
      .from('family_events')
      .select('start_time, end_time, title')
      .eq('family_id', args.familyId)
      .gte('start_time', formatDateTime(args.windowStart))
      .lte('end_time', formatDateTime(args.windowEnd))
      .order('start_time', { ascending: true })

    if (error) {
      throw new Error(`Failed to get busy times: ${error.message}`)
    }

    return data.map(event => ({
      start: event.start_time,
      end: event.end_time,
      title: event.title
    }))
  }
})

export const findFreeSlot = tool({
  description: 'Find a free time slot of specified duration within a window',
  parameters: z.object({
    durationMins: z.number().int().positive(),
    windowStart: z.string().datetime(),
    windowEnd: z.string().datetime(),
    familyId: z.string()
  }),
  async execute(args) {
    // First get busy times
    const busyTimes = await freeBusy.execute({
      windowStart: args.windowStart,
      windowEnd: args.windowEnd,
      familyId: args.familyId
    })

    const windowStart = new Date(args.windowStart)
    const windowEnd = new Date(args.windowEnd)
    const durationMs = args.durationMins * 60 * 1000

    // Sort busy times by start
    busyTimes.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime())

    let currentTime = windowStart

    for (const busy of busyTimes) {
      const busyStart = new Date(busy.start)
      const busyEnd = new Date(busy.end)

      // Check if there's enough time before this busy period
      if (busyStart.getTime() - currentTime.getTime() >= durationMs) {
        return {
          start: currentTime.toISOString(),
          end: new Date(currentTime.getTime() + durationMs).toISOString(),
          duration: args.durationMins
        }
      }

      // Move current time to after this busy period
      currentTime = new Date(Math.max(currentTime.getTime(), busyEnd.getTime()))
    }

    // Check if there's time after the last busy period
    if (windowEnd.getTime() - currentTime.getTime() >= durationMs) {
      return {
        start: currentTime.toISOString(),
        end: new Date(currentTime.getTime() + durationMs).toISOString(),
        duration: args.durationMins
      }
    }

    return null // No free slot found
  }
})

// 4. Helper Tools

export const parseNaturalTime = tool({
  description: 'Parse natural language time expressions to ISO datetime',
  parameters: z.object({
    timeExpression: z.string(),
    baseDate: z.string().datetime().optional() // Reference date, defaults to now
  }),
  async execute(args) {
    const baseDate = args.baseDate ? new Date(args.baseDate) : new Date()
    const expression = args.timeExpression.toLowerCase()

    // Simple natural time parsing - in production, you'd use a more sophisticated library
    let targetDate = new Date(baseDate)

    if (expression.includes('tomorrow')) {
      targetDate.setDate(targetDate.getDate() + 1)
    } else if (expression.includes('next week')) {
      targetDate.setDate(targetDate.getDate() + 7)
    } else if (expression.includes('next month')) {
      targetDate.setMonth(targetDate.getMonth() + 1)
    }

    // Handle time of day
    if (expression.includes('morning')) {
      targetDate.setHours(9, 0, 0, 0)
    } else if (expression.includes('afternoon')) {
      targetDate.setHours(14, 0, 0, 0)
    } else if (expression.includes('evening')) {
      targetDate.setHours(18, 0, 0, 0)
    } else if (expression.includes('night')) {
      targetDate.setHours(20, 0, 0, 0)
    }

    return targetDate.toISOString()
  }
})

export const guessTimeZone = tool({
  description: 'Guess timezone from IP or locale',
  parameters: z.object({
    ipAddress: z.string().optional(),
    locale: z.string().optional()
  }),
  async execute(args) {
    // Simple timezone guessing - in production, you'd use a GeoIP service
    if (args.locale) {
      // Try to extract timezone from locale
      const timezoneMap: Record<string, string> = {
        'en-us': 'America/New_York',
        'en-gb': 'Europe/London',
        'en-ca': 'America/Toronto',
        'en-au': 'Australia/Sydney',
        'en-nz': 'Pacific/Auckland'
      }
      
      const timezone = timezoneMap[args.locale.toLowerCase()]
      if (timezone) return timezone
    }

    // Default to UTC if no match
    return 'UTC'
  }
})

export const convertToUserZone = tool({
  description: 'Convert UTC datetime to user timezone',
  parameters: z.object({
    utcDateTime: z.string().datetime(),
    timezone: z.string()
  }),
  async execute(args) {
    const utcDate = new Date(args.utcDateTime)
    
    // Convert to the target timezone
    const options: Intl.DateTimeFormatOptions = {
      timeZone: args.timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    }

    const localTime = new Intl.DateTimeFormat('en-CA', options).format(utcDate)
    return localTime.replace(',', 'T') + 'Z'
  }
})
