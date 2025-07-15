/**
 * Calendar Controller - Handles business logic and validation
 */
import { CalendarModel } from "./model"
import { 
  getUserTimezone, 
  isLegacyTimeFormat, 
  dayAndTimeToDateTime, 
  convertDateTimeToLegacyFormat,
  formatTimeInTimezone,
  extractDayFromDateTime,
  extractTimeFromDateTime
} from "@/lib/utils/timezone"
import type {
  CalendarEvent,
  TimeSlot,
  EventCreationResult,
  EventUpdateResult,
  EventDeletionResult,
  ScheduleSummary,
} from "./types"

export const CalendarController = {
  /**
   * Get all events, converting legacy time format to timezone-aware format
   */
  getAllEvents() {
    const events = CalendarModel.getAllEvents()
    return events.map(event => this.enhanceEventWithTimezone(event))
  },

  /**
   * Get events for a specific day
   */
  getEventsByDay(day: number) {
    // Validate day
    if (day < 1 || day > 7) {
      throw new Error("Day must be between 1 and 7")
    }

    const events = CalendarModel.getEventsByDay(day)
    return events.map(event => this.enhanceEventWithTimezone(event))
  },

  /**
   * Get events for a date range
   */
  getEventsByDateRange(startDay: number, endDay: number) {
    // Validate days
    if (startDay < 1 || startDay > 7 || endDay < 1 || endDay > 7) {
      throw new Error("Days must be between 1 and 7")
    }

    if (startDay > endDay) {
      throw new Error("Start day must be before or equal to end day")
    }

    const events = CalendarModel.getEventsByDateRange(startDay, endDay)
    return events.map(event => this.enhanceEventWithTimezone(event))
  },

  /**
   * Get a specific event by ID
   */
  getEventById(id: number) {
    if (id <= 0) {
      throw new Error("Invalid event ID")
    }

    const event = CalendarModel.getEventById(id)

    if (!event) {
      throw new Error("Event not found")
    }

    return this.enhanceEventWithTimezone(event)
  },

  /**
   * Create a new event with timezone awareness
   */
  createEvent(eventData: Omit<CalendarEvent, "id">, userTimezone?: string): EventCreationResult {
    // Get user's timezone
    const timezone = userTimezone || getUserTimezone()
    
    // Validate required fields
    if (!eventData.title) {
      return {
        success: false,
        message: "Event title is required",
      }
    }

    if (!eventData.startTime || !eventData.endTime) {
      return {
        success: false,
        message: "Event start and end times are required",
      }
    }

    // Handle timezone-aware datetime creation
    let processedEventData = { ...eventData }
    
    if (isLegacyTimeFormat(eventData.startTime) && isLegacyTimeFormat(eventData.endTime)) {
      // Convert legacy format to timezone-aware datetimes
      const startDateTime = dayAndTimeToDateTime(eventData.day, eventData.startTime, timezone)
      const endDateTime = dayAndTimeToDateTime(eventData.day, eventData.endTime, timezone)
      
      processedEventData = {
        ...eventData,
        startDateTime,
        endDateTime,
        timezone,
        // Keep legacy format for backward compatibility
        day: extractDayFromDateTime(startDateTime, timezone),
        startTime: extractTimeFromDateTime(startDateTime, timezone),
        endTime: extractTimeFromDateTime(endDateTime, timezone)
      }
    }

    if (processedEventData.day < 1 || processedEventData.day > 7) {
      return {
        success: false,
        message: "Day must be between 1 and 7",
      }
    }

    // Validate time format and logic
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

    if (!timeRegex.test(processedEventData.startTime) || !timeRegex.test(processedEventData.endTime)) {
      return {
        success: false,
        message: "Times must be in HH:MM format",
      }
    }

    // Check that end time is after start time
    const [startHour, startMinute] = processedEventData.startTime.split(":").map(Number)
    const [endHour, endMinute] = processedEventData.endTime.split(":").map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    if (endMinutes <= startMinutes) {
      return {
        success: false,
        message: "End time must be after start time",
      }
    }

    // Create the event
    const result = CalendarModel.createEvent(processedEventData)
    
    if (result.success && result.event) {
      result.event = this.enhanceEventWithTimezone(result.event)
    }
    
    return result
  },

  /**
   * Update an existing event with timezone awareness
   */
  updateEvent(id: number, eventData: Partial<CalendarEvent>, userTimezone?: string): EventUpdateResult {
    // Validate ID
    if (id <= 0) {
      return {
        success: false,
        message: "Invalid event ID",
      }
    }

    // Get user's timezone
    const timezone = userTimezone || getUserTimezone()
    
    // Handle timezone-aware datetime updates
    let processedEventData = { ...eventData }
    
    if (eventData.startTime && eventData.endTime && eventData.day) {
      if (isLegacyTimeFormat(eventData.startTime) && isLegacyTimeFormat(eventData.endTime)) {
        // Convert legacy format to timezone-aware datetimes
        const startDateTime = dayAndTimeToDateTime(eventData.day, eventData.startTime, timezone)
        const endDateTime = dayAndTimeToDateTime(eventData.day, eventData.endTime, timezone)
        
        processedEventData = {
          ...eventData,
          startDateTime,
          endDateTime,
          timezone,
          // Update legacy format for backward compatibility
          day: extractDayFromDateTime(startDateTime, timezone),
          startTime: extractTimeFromDateTime(startDateTime, timezone),
          endTime: extractTimeFromDateTime(endDateTime, timezone)
        }
      }
    }

    // Validate time format if provided
    if (processedEventData.startTime || processedEventData.endTime) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

      if (
        (processedEventData.startTime && !timeRegex.test(processedEventData.startTime)) ||
        (processedEventData.endTime && !timeRegex.test(processedEventData.endTime))
      ) {
        return {
          success: false,
          message: "Times must be in HH:MM format",
        }
      }

      // If both times are provided, check that end time is after start time
      if (processedEventData.startTime && processedEventData.endTime) {
        const [startHour, startMinute] = processedEventData.startTime.split(":").map(Number)
        const [endHour, endMinute] = processedEventData.endTime.split(":").map(Number)

        const startMinutes = startHour * 60 + startMinute
        const endMinutes = endHour * 60 + endMinute

        if (endMinutes <= startMinutes) {
          return {
            success: false,
            message: "End time must be after start time",
          }
        }
      }
    }

    // Validate day if provided
    if (processedEventData.day !== undefined && (processedEventData.day < 1 || processedEventData.day > 7)) {
      return {
        success: false,
        message: "Day must be between 1 and 7",
      }
    }

    // Update the event
    const result = CalendarModel.updateEvent(id, processedEventData)
    
    if (result.success && result.event) {
      result.event = this.enhanceEventWithTimezone(result.event)
    }
    
    return result
  },

  /**
   * Delete an event
   */
  deleteEvent(id: number): EventDeletionResult {
    // Validate ID
    if (id <= 0) {
      return {
        success: false,
        message: "Invalid event ID",
      }
    }

    return CalendarModel.deleteEvent(id)
  },

  /**
   * Find free time slots on a specific day
   */
  findFreeTimeSlots(day: number, durationMinutes: number): TimeSlot[] {
    // Validate day
    if (day < 1 || day > 7) {
      throw new Error("Day must be between 1 and 7")
    }

    // Validate duration
    if (durationMinutes <= 0) {
      throw new Error("Duration must be positive")
    }

    return CalendarModel.findFreeTimeSlots(day, durationMinutes)
  },

  /**
   * Get a summary of the schedule for a date range
   */
  getScheduleSummary(startDay: number, endDay: number): ScheduleSummary {
    // Validate days
    if (startDay < 1 || startDay > 7 || endDay < 1 || endDay > 7) {
      throw new Error("Days must be between 1 and 7")
    }

    if (startDay > endDay) {
      throw new Error("Start day must be before or equal to end day")
    }

    return CalendarModel.getScheduleSummary(startDay, endDay)
  },

  /**
   * Search for events by query
   */
  searchEvents(query: string): CalendarEvent[] {
    if (!query || query.trim() === "") {
      throw new Error("Search query cannot be empty")
    }

    const events = CalendarModel.searchEvents(query)
    return events.map(event => this.enhanceEventWithTimezone(event))
  },

  /**
   * Get day name from day number
   */
  getDayName(day: number): string {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

    if (day < 1 || day > 7) {
      throw new Error("Day must be between 1 and 7")
    }

    return dayNames[day - 1]
  },

  /**
   * Get events for display in user's timezone
   */
  getEventsForDisplay(userTimezone?: string): CalendarEvent[] {
    const timezone = userTimezone || getUserTimezone()
    const events = this.getAllEvents()
    
    return events.map(event => {
      if (event.startDateTime && event.endDateTime) {
        // Convert to user's timezone for display
        return {
          ...event,
          startTime: formatTimeInTimezone(event.startDateTime, timezone),
          endTime: formatTimeInTimezone(event.endDateTime, timezone),
          day: extractDayFromDateTime(event.startDateTime, timezone)
        }
      }
      return event
    })
  },

  /**
   * Private helper to enhance event with timezone information
   */
  enhanceEventWithTimezone(event: CalendarEvent): CalendarEvent {
    // If event already has timezone-aware datetimes, return as-is
    if (event.startDateTime && event.endDateTime) {
      return event
    }

    // Convert legacy format to timezone-aware if needed
    if (isLegacyTimeFormat(event.startTime) && isLegacyTimeFormat(event.endTime)) {
      const timezone = event.timezone || getUserTimezone()
      const startDateTime = dayAndTimeToDateTime(event.day, event.startTime, timezone)
      const endDateTime = dayAndTimeToDateTime(event.day, event.endTime, timezone)
      
      return {
        ...event,
        startDateTime,
        endDateTime,
        timezone
      }
    }

    return event
  }
}
