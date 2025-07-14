/**
 * Calendar Controller - Handles business logic and validation
 */
import { CalendarModel } from "./model"
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
   * Get all events
   */
  getAllEvents() {
    return CalendarModel.getAllEvents()
  },

  /**
   * Get events for a specific day
   */
  getEventsByDay(day: number) {
    // Validate day
    if (day < 1 || day > 7) {
      throw new Error("Day must be between 1 and 7")
    }

    return CalendarModel.getEventsByDay(day)
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

    return CalendarModel.getEventsByDateRange(startDay, endDay)
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

    return event
  },

  /**
   * Create a new event
   */
  createEvent(eventData: Omit<CalendarEvent, "id">): EventCreationResult {
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

    if (eventData.day < 1 || eventData.day > 7) {
      return {
        success: false,
        message: "Day must be between 1 and 7",
      }
    }

    // Validate time format and logic
    const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

    if (!timeRegex.test(eventData.startTime) || !timeRegex.test(eventData.endTime)) {
      return {
        success: false,
        message: "Times must be in HH:MM format",
      }
    }

    // Check that end time is after start time
    const [startHour, startMinute] = eventData.startTime.split(":").map(Number)
    const [endHour, endMinute] = eventData.endTime.split(":").map(Number)

    const startMinutes = startHour * 60 + startMinute
    const endMinutes = endHour * 60 + endMinute

    if (endMinutes <= startMinutes) {
      return {
        success: false,
        message: "End time must be after start time",
      }
    }

    // Create the event
    return CalendarModel.createEvent(eventData)
  },

  /**
   * Update an existing event
   */
  updateEvent(id: number, eventData: Partial<CalendarEvent>): EventUpdateResult {
    // Validate ID
    if (id <= 0) {
      return {
        success: false,
        message: "Invalid event ID",
      }
    }

    // Validate time format if provided
    if (eventData.startTime || eventData.endTime) {
      const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/

      if (
        (eventData.startTime && !timeRegex.test(eventData.startTime)) ||
        (eventData.endTime && !timeRegex.test(eventData.endTime))
      ) {
        return {
          success: false,
          message: "Times must be in HH:MM format",
        }
      }

      // If both times are provided, check that end time is after start time
      if (eventData.startTime && eventData.endTime) {
        const [startHour, startMinute] = eventData.startTime.split(":").map(Number)
        const [endHour, endMinute] = eventData.endTime.split(":").map(Number)

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
    if (eventData.day !== undefined && (eventData.day < 1 || eventData.day > 7)) {
      return {
        success: false,
        message: "Day must be between 1 and 7",
      }
    }

    // Update the event
    return CalendarModel.updateEvent(id, eventData)
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

    return CalendarModel.searchEvents(query)
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
}
