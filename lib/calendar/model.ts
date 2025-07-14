/**
 * Calendar Model - Handles data operations and business logic
 */
import type {
  CalendarEvent,
  TimeSlot,
  EventCreationResult,
  EventUpdateResult,
  EventDeletionResult,
  ScheduleSummary,
} from "./types"

// Sample calendar data - in a real implementation, this would come from a database
const events: CalendarEvent[] = [
  {
    id: 1,
    title: "Team Meeting",
    startTime: "09:00",
    endTime: "10:00",
    color: "bg-blue-500",
    day: 1,
    description: "Weekly team sync-up",
    location: "Conference Room A",
    attendees: ["John Doe", "Jane Smith", "Bob Johnson"],
    organizer: "Alice Brown",
  },
  {
    id: 2,
    title: "Lunch with Sarah",
    startTime: "12:30",
    endTime: "13:30",
    color: "bg-green-500",
    day: 1,
    description: "Discuss project timeline",
    location: "Cafe Nero",
    attendees: ["Sarah Lee"],
    organizer: "You",
  },
  {
    id: 3,
    title: "Project Review",
    startTime: "14:00",
    endTime: "15:30",
    color: "bg-purple-500",
    day: 3,
    description: "Q2 project progress review",
    location: "Meeting Room 3",
    attendees: ["Team Alpha", "Stakeholders"],
    organizer: "Project Manager",
  },
  {
    id: 4,
    title: "Client Call",
    startTime: "10:00",
    endTime: "11:00",
    color: "bg-yellow-500",
    day: 2,
    description: "Quarterly review with major client",
    location: "Zoom Meeting",
    attendees: ["Client Team", "Sales Team"],
    organizer: "Account Manager",
  },
  {
    id: 5,
    title: "Team Brainstorm",
    startTime: "13:00",
    endTime: "14:30",
    color: "bg-indigo-500",
    day: 4,
    description: "Ideation session for new product features",
    location: "Creative Space",
    attendees: ["Product Team", "Design Team"],
    organizer: "Product Owner",
  },
]

// Helper functions for time calculations
function compareTime(time1: string, time2: string): number {
  const [hour1, minute1] = time1.split(":").map(Number)
  const [hour2, minute2] = time2.split(":").map(Number)

  if (hour1 !== hour2) {
    return hour1 - hour2
  }
  return minute1 - minute2
}

function getMinutesBetween(time1: string, time2: string): number {
  const [hour1, minute1] = time1.split(":").map(Number)
  const [hour2, minute2] = time2.split(":").map(Number)

  return hour2 * 60 + minute2 - (hour1 * 60 + minute1)
}

function hasTimeConflict(event1: CalendarEvent, event2: CalendarEvent): boolean {
  if (event1.day !== event2.day) return false

  // Check if one event starts during another event
  if (
    (compareTime(event1.startTime, event2.startTime) >= 0 && compareTime(event1.startTime, event2.endTime) < 0) ||
    (compareTime(event2.startTime, event1.startTime) >= 0 && compareTime(event2.startTime, event1.endTime) < 0)
  ) {
    return true
  }

  return false
}

export const CalendarModel = {
  /**
   * Get all events
   */
  getAllEvents(): CalendarEvent[] {
    return [...events]
  },

  /**
   * Get events for a specific day
   */
  getEventsByDay(day: number): CalendarEvent[] {
    return events.filter((event) => event.day === day)
  },

  /**
   * Get events for a date range
   */
  getEventsByDateRange(startDay: number, endDay: number): CalendarEvent[] {
    return events.filter((event) => event.day >= startDay && event.day <= endDay)
  },

  /**
   * Get a specific event by ID
   */
  getEventById(id: number): CalendarEvent | undefined {
    return events.find((event) => event.id === id)
  },

  /**
   * Create a new event
   */
  createEvent(eventData: Omit<CalendarEvent, "id">): EventCreationResult {
    // Check for conflicts
    const conflictingEvents = events.filter((existingEvent) => hasTimeConflict(existingEvent, { ...eventData, id: 0 }))

    if (conflictingEvents.length > 0) {
      return {
        success: false,
        message: "Event conflicts with existing events",
        conflictingEvents,
      }
    }

    // Generate a new ID
    const newId = Math.max(...events.map((e) => e.id), 0) + 1

    // Create the new event
    const newEvent: CalendarEvent = {
      ...eventData,
      id: newId,
    }

    // In a real app, we would persist this to a database
    events.push(newEvent)

    return {
      success: true,
      message: "Event created successfully",
      event: newEvent,
    }
  },

  /**
   * Update an existing event
   */
  updateEvent(id: number, eventData: Partial<CalendarEvent>): EventUpdateResult {
    const eventIndex = events.findIndex((event) => event.id === id)

    if (eventIndex === -1) {
      return {
        success: false,
        message: "Event not found",
      }
    }

    const updatedEvent: CalendarEvent = {
      ...events[eventIndex],
      ...eventData,
    }

    // Check for conflicts with other events (excluding this one)
    const conflictingEvents = events.filter(
      (existingEvent) => existingEvent.id !== id && hasTimeConflict(existingEvent, updatedEvent),
    )

    if (conflictingEvents.length > 0) {
      return {
        success: false,
        message: "Updated event conflicts with existing events",
        conflictingEvents,
      }
    }

    // Update the event
    events[eventIndex] = updatedEvent

    return {
      success: true,
      message: "Event updated successfully",
      event: updatedEvent,
    }
  },

  /**
   * Delete an event
   */
  deleteEvent(id: number): EventDeletionResult {
    const eventIndex = events.findIndex((event) => event.id === id)

    if (eventIndex === -1) {
      return {
        success: false,
        message: "Event not found",
      }
    }

    // Remove the event
    events.splice(eventIndex, 1)

    return {
      success: true,
      message: "Event deleted successfully",
      eventId: id,
    }
  },

  /**
   * Find free time slots on a specific day
   */
  findFreeTimeSlots(day: number, durationMinutes: number): TimeSlot[] {
    // Get events for the specified day
    const dayEvents = events.filter((event) => event.day === day)

    // Sort events by start time
    dayEvents.sort((a, b) => compareTime(a.startTime, b.startTime))

    // Find free time slots
    const freeSlots: TimeSlot[] = []
    const workdayStart = "08:00"
    const workdayEnd = "17:00"

    let currentTime = workdayStart

    for (const event of dayEvents) {
      if (compareTime(event.startTime, currentTime) > 0) {
        // There's a gap between current time and next event
        const minutesAvailable = getMinutesBetween(currentTime, event.startTime)
        if (minutesAvailable >= durationMinutes) {
          freeSlots.push({
            start: currentTime,
            end: event.startTime,
            duration: minutesAvailable,
          })
        }
      }
      currentTime = event.endTime
    }

    // Check if there's free time after the last event
    if (compareTime(workdayEnd, currentTime) > 0) {
      const minutesAvailable = getMinutesBetween(currentTime, workdayEnd)
      if (minutesAvailable >= durationMinutes) {
        freeSlots.push({
          start: currentTime,
          end: workdayEnd,
          duration: minutesAvailable,
        })
      }
    }

    return freeSlots
  },

  /**
   * Get a summary of the schedule for a date range
   */
  getScheduleSummary(startDay: number, endDay: number): ScheduleSummary {
    const rangeEvents = this.getEventsByDateRange(startDay, endDay)

    // Calculate busy hours
    let totalBusyMinutes = 0
    rangeEvents.forEach((event) => {
      totalBusyMinutes += getMinutesBetween(event.startTime, event.endTime)
    })

    // Find most busy day
    const eventsByDay = new Map<number, number>()
    for (let day = startDay; day <= endDay; day++) {
      eventsByDay.set(day, 0)
    }

    rangeEvents.forEach((event) => {
      eventsByDay.set(event.day, (eventsByDay.get(event.day) || 0) + 1)
    })

    let mostBusyDay = startDay
    let maxEvents = 0

    eventsByDay.forEach((count, day) => {
      if (count > maxEvents) {
        mostBusyDay = day
        maxEvents = count
      }
    })

    // Calculate working hours in the range
    const workingHoursPerDay = getMinutesBetween("08:00", "17:00") / 60
    const totalWorkingHours = workingHoursPerDay * (endDay - startDay + 1)
    const busyHours = totalBusyMinutes / 60
    const freeHours = totalWorkingHours - busyHours

    return {
      totalEvents: rangeEvents.length,
      busyHours,
      freeHours,
      busyPercentage: (busyHours / totalWorkingHours) * 100,
      mostBusyDay: {
        day: mostBusyDay,
        eventCount: maxEvents,
      },
      upcomingDeadlines: rangeEvents.filter(
        (event) =>
          event.title.toLowerCase().includes("deadline") ||
          event.title.toLowerCase().includes("due") ||
          event.description.toLowerCase().includes("deadline") ||
          event.description.toLowerCase().includes("due"),
      ),
    }
  },

  /**
   * Search for events by query
   */
  searchEvents(query: string): CalendarEvent[] {
    const lowercaseQuery = query.toLowerCase()

    return events.filter(
      (event) =>
        event.title.toLowerCase().includes(lowercaseQuery) ||
        event.description.toLowerCase().includes(lowercaseQuery) ||
        event.location.toLowerCase().includes(lowercaseQuery) ||
        event.attendees.some((attendee) => attendee.toLowerCase().includes(lowercaseQuery)),
    )
  },
}
