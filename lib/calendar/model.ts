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

// Sample family calendar data - focused on family activities and schedules
const events: CalendarEvent[] = [
  {
    id: 1,
    title: "Emma's Soccer Practice",
    startTime: "16:00",
    endTime: "17:30",
    color: "bg-green-500",
    day: 2, // Monday
    description: "Weekly soccer practice at the community center",
    location: "Riverside Community Center",
    attendees: ["Emma", "Sarah (Mom)"],
    organizer: "Sarah",
  },
  {
    id: 2,
    title: "Family Grocery Shopping",
    startTime: "10:00",
    endTime: "11:30",
    color: "bg-blue-500",
    day: 7, // Saturday
    description: "Weekly grocery shopping trip - include kids for learning",
    location: "Whole Foods Market",
    attendees: ["Sarah", "Mike", "Emma", "Lucas"],
    organizer: "Sarah",
  },
  {
    id: 3,
    title: "Lucas's Piano Lesson",
    startTime: "15:00",
    endTime: "16:00",
    color: "bg-purple-500",
    day: 4, // Wednesday
    description: "Weekly piano lesson with Mrs. Johnson",
    location: "Harmony Music Academy",
    attendees: ["Lucas", "Mike (Dad)"],
    organizer: "Mike",
  },
  {
    id: 4,
    title: "Family Movie Night",
    startTime: "19:00",
    endTime: "21:00",
    color: "bg-pink-500",
    day: 6, // Friday
    description: "Weekly family movie night with popcorn and snacks",
    location: "Home - Living Room",
    attendees: ["Sarah", "Mike", "Emma", "Lucas"],
    organizer: "Mike",
  },
  {
    id: 5,
    title: "Emma's Dance Class",
    startTime: "14:00",
    endTime: "15:00",
    color: "bg-yellow-500",
    day: 3, // Tuesday
    description: "Ballet and contemporary dance class",
    location: "Grace Dance Studio",
    attendees: ["Emma", "Sarah (Mom)"],
    organizer: "Sarah",
  },
  {
    id: 6,
    title: "Pediatrician Checkup - Lucas",
    startTime: "10:30",
    endTime: "11:30",
    color: "bg-red-500",
    day: 5, // Thursday
    description: "Annual checkup and vaccinations for Lucas",
    location: "Children's Medical Center",
    attendees: ["Lucas", "Sarah (Mom)"],
    organizer: "Sarah",
  },
  {
    id: 7,
    title: "Parent-Teacher Conference",
    startTime: "18:00",
    endTime: "18:30",
    color: "bg-indigo-500",
    day: 2, // Monday
    description: "Meeting with Emma's 3rd grade teacher",
    location: "Riverside Elementary School",
    attendees: ["Sarah", "Mike"],
    organizer: "Sarah",
  },
  {
    id: 8,
    title: "Family Bike Ride",
    startTime: "09:00",
    endTime: "11:00",
    color: "bg-green-400",
    day: 1, // Sunday
    description: "Morning bike ride through the park trails",
    location: "Riverside Park Trail",
    attendees: ["Sarah", "Mike", "Emma", "Lucas"],
    organizer: "Mike",
  },
  {
    id: 9,
    title: "Swimming Lessons - Both Kids",
    startTime: "16:30",
    endTime: "17:30",
    color: "bg-cyan-500",
    day: 4, // Wednesday
    description: "Swimming lessons at the community pool",
    location: "Community Recreation Center Pool",
    attendees: ["Emma", "Lucas", "Sarah (Mom)"],
    organizer: "Sarah",
  },
  {
    id: 10,
    title: "Family Game Night",
    startTime: "19:30",
    endTime: "21:00",
    color: "bg-orange-500",
    day: 3, // Tuesday
    description: "Board games and family fun time",
    location: "Home - Dining Room",
    attendees: ["Sarah", "Mike", "Emma", "Lucas"],
    organizer: "Mike",
  },
  {
    id: 11,
    title: "School Pickup - Emma",
    startTime: "15:15",
    endTime: "15:30",
    color: "bg-amber-500",
    day: 1, // Sunday (recurring daily)
    description: "Daily school pickup for Emma",
    location: "Riverside Elementary School",
    attendees: ["Emma", "Sarah (Mom)"],
    organizer: "Sarah",
  },
  {
    id: 12,
    title: "Bedtime Routine - Lucas",
    startTime: "19:30",
    endTime: "20:00",
    color: "bg-slate-500",
    day: 1, // Sunday (recurring daily)
    description: "Bath time, story reading, and bedtime",
    location: "Home - Lucas's Room",
    attendees: ["Lucas", "Mike (Dad)"],
    organizer: "Mike",
  },
  {
    id: 13,
    title: "Family Breakfast",
    startTime: "08:00",
    endTime: "08:30",
    color: "bg-rose-500",
    day: 1, // Sunday
    description: "Special Sunday family breakfast together",
    location: "Home - Kitchen",
    attendees: ["Sarah", "Mike", "Emma", "Lucas"],
    organizer: "Sarah",
  },
  {
    id: 14,
    title: "Dentist Appointment - Emma",
    startTime: "14:00",
    endTime: "15:00",
    color: "bg-red-400",
    day: 6, // Friday
    description: "Regular dental checkup and cleaning",
    location: "Smile Dental Care",
    attendees: ["Emma", "Sarah (Mom)"],
    organizer: "Sarah",
  },
  {
    id: 15,
    title: "Playdate at Park",
    startTime: "15:30",
    endTime: "17:00",
    color: "bg-lime-500",
    day: 7, // Saturday
    description: "Playdate with Emma's school friends",
    location: "Riverside Park Playground",
    attendees: ["Emma", "Lucas", "Sarah (Mom)"],
    organizer: "Sarah",
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
    const workdayStart = "07:00" // Family day starts earlier
    const workdayEnd = "21:00" // Family day ends later

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

    // Calculate family active hours (7 AM to 9 PM)
    const familyHoursPerDay = getMinutesBetween("07:00", "21:00") / 60
    const totalFamilyHours = familyHoursPerDay * (endDay - startDay + 1)
    const busyHours = totalBusyMinutes / 60
    const freeHours = totalFamilyHours - busyHours

    return {
      totalEvents: rangeEvents.length,
      busyHours,
      freeHours,
      busyPercentage: (busyHours / totalFamilyHours) * 100,
      mostBusyDay: {
        day: mostBusyDay,
        eventCount: maxEvents,
      },
      upcomingDeadlines: rangeEvents.filter(
        (event) =>
          event.title.toLowerCase().includes("appointment") ||
          event.title.toLowerCase().includes("checkup") ||
          event.title.toLowerCase().includes("conference") ||
          event.description.toLowerCase().includes("important"),
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
