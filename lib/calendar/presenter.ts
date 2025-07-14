/**
 * Calendar Presenter - Formats data for presentation and handles UI interactions
 */
import { CalendarController } from "./controller"
import type { CalendarEvent, TimeSlot, EventCreationResult, EventUpdateResult, ScheduleSummary } from "./types"

export const CalendarPresenter = {
  /**
   * Format events for display
   */
  formatEvents(events: CalendarEvent[]) {
    return events.map((event) => ({
      ...event,
      formattedTime: `${event.startTime} - ${event.endTime}`,
      dayName: CalendarController.getDayName(event.day),
      attendeeCount: event.attendees.length,
    }))
  },

  /**
   * Format a single event for display
   */
  formatEvent(event: CalendarEvent) {
    return {
      ...event,
      formattedTime: `${event.startTime} - ${event.endTime}`,
      dayName: CalendarController.getDayName(event.day),
      attendeeCount: event.attendees.length,
    }
  },

  /**
   * Format free time slots for display
   */
  formatFreeTimeSlots(slots: TimeSlot[]) {
    return slots.map((slot) => ({
      ...slot,
      formattedTime: `${slot.start} - ${slot.end}`,
      formattedDuration: `${Math.floor(slot.duration / 60)}h ${slot.duration % 60}m`,
    }))
  },

  /**
   * Format schedule summary for display
   */
  formatScheduleSummary(summary: ScheduleSummary) {
    return {
      ...summary,
      formattedBusyHours: `${Math.floor(summary.busyHours)}h ${Math.round((summary.busyHours % 1) * 60)}m`,
      formattedFreeHours: `${Math.floor(summary.freeHours)}h ${Math.round((summary.freeHours % 1) * 60)}m`,
      formattedBusyPercentage: `${Math.round(summary.busyPercentage)}%`,
      mostBusyDayName: CalendarController.getDayName(summary.mostBusyDay.day),
    }
  },

  /**
   * Get events for a specific day with formatting
   */
  getFormattedEventsByDay(day: number) {
    const events = CalendarController.getEventsByDay(day)
    return this.formatEvents(events)
  },

  /**
   * Get events for a date range with formatting
   */
  getFormattedEventsByDateRange(startDay: number, endDay: number) {
    const events = CalendarController.getEventsByDateRange(startDay, endDay)
    return this.formatEvents(events)
  },

  /**
   * Find free time slots with formatting
   */
  getFormattedFreeTimeSlots(day: number, durationMinutes: number) {
    const slots = CalendarController.findFreeTimeSlots(day, durationMinutes)
    return this.formatFreeTimeSlots(slots)
  },

  /**
   * Get formatted schedule summary
   */
  getFormattedScheduleSummary(startDay: number, endDay: number) {
    const summary = CalendarController.getScheduleSummary(startDay, endDay)
    return this.formatScheduleSummary(summary)
  },

  /**
   * Create a new event and return formatted result
   */
  createEvent(eventData: Omit<CalendarEvent, "id">): EventCreationResult {
    const result = CalendarController.createEvent(eventData)

    if (result.success && result.event) {
      return {
        ...result,
        event: this.formatEvent(result.event),
      }
    }

    return result
  },

  /**
   * Update an event and return formatted result
   */
  updateEvent(id: number, eventData: Partial<CalendarEvent>): EventUpdateResult {
    const result = CalendarController.updateEvent(id, eventData)

    if (result.success && result.event) {
      return {
        ...result,
        event: this.formatEvent(result.event),
      }
    }

    return result
  },

  /**
   * Search for events with formatting
   */
  searchFormattedEvents(query: string) {
    const events = CalendarController.searchEvents(query)
    return this.formatEvents(events)
  },

  /**
   * Generate natural language summary of a day's schedule
   */
  generateDaySummary(day: number): string {
    const events = CalendarController.getEventsByDay(day)
    const dayName = CalendarController.getDayName(day)

    if (events.length === 0) {
      return `You have no events scheduled for ${dayName}.`
    }

    events.sort((a, b) => {
      const [aHour, aMinute] = a.startTime.split(":").map(Number)
      const [bHour, bMinute] = b.startTime.split(":").map(Number)

      if (aHour !== bHour) {
        return aHour - bHour
      }

      return aMinute - bMinute
    })

    const firstEvent = events[0]
    const lastEvent = events[events.length - 1]

    let summary = `You have ${events.length} event${events.length > 1 ? "s" : ""} scheduled for ${dayName}. `
    summary += `Your day starts at ${firstEvent.startTime} with "${firstEvent.title}" `

    if (events.length > 1) {
      summary += `and ends at ${lastEvent.endTime} with "${lastEvent.title}". `
    } else {
      summary += `which ends at ${firstEvent.endTime}. `
    }

    // Add information about free time
    const freeSlots = CalendarController.findFreeTimeSlots(day, 30) // Find slots with at least 30 minutes

    if (freeSlots.length > 0) {
      if (freeSlots.length === 1) {
        summary += `You have one free time slot from ${freeSlots[0].start} to ${freeSlots[0].end}.`
      } else {
        summary += `You have ${freeSlots.length} free time slots available.`
      }
    } else {
      summary += `Your schedule is completely booked.`
    }

    return summary
  },

  /**
   * Generate natural language summary of the week's schedule
   */
  generateWeekSummary(): string {
    const summary = CalendarController.getScheduleSummary(1, 7)
    const formattedSummary = this.formatScheduleSummary(summary)

    let weekSummary = `This week you have ${summary.totalEvents} events scheduled. `
    weekSummary += `You'll be busy for ${formattedSummary.formattedBusyHours} (${formattedSummary.formattedBusyPercentage} of your working hours). `
    weekSummary += `${formattedSummary.mostBusyDayName} is your busiest day with ${summary.mostBusyDay.eventCount} events. `

    if (summary.upcomingDeadlines.length > 0) {
      weekSummary += `You have ${summary.upcomingDeadlines.length} upcoming deadline${summary.upcomingDeadlines.length > 1 ? "s" : ""} this week.`
    }

    return weekSummary
  },
}
