/**
 * Type definitions for the calendar application
 */

export type CalendarEvent = {
  id: number
  title: string
  startTime: string
  endTime: string
  day: number
  description: string
  location: string
  attendees: string[]
  organizer: string
  color: string
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern
  tags?: string[]
  priority?: "low" | "medium" | "high"
  notifications?: Notification[]
}

export type RecurrencePattern = {
  frequency: "daily" | "weekly" | "monthly" | "yearly"
  interval: number
  endDate?: string
  endAfterOccurrences?: number
  daysOfWeek?: number[]
}

export type Notification = {
  type: "email" | "popup" | "sms"
  minutesBefore: number
}

export type TimeSlot = {
  start: string
  end: string
  duration: number
}

export type CalendarDay = {
  dayNumber: number
  dayName: string
  date: string
  events: CalendarEvent[]
}

export type Calendar = {
  id: string
  name: string
  color: string
  isVisible: boolean
  owner: string
}

export type User = {
  id: string
  name: string
  email: string
  preferences: UserPreferences
  calendars: Calendar[]
}

export type UserPreferences = {
  workingHours: {
    start: string
    end: string
  }
  workingDays: number[] // 0-6, where 0 is Sunday
  timeZone: string
  defaultEventDuration: number // in minutes
  defaultCalendarId: string
}

export type DateRange = {
  start: string
  end: string
}

export type EventCreationResult = {
  success: boolean
  message: string
  event?: CalendarEvent
  conflictingEvents?: CalendarEvent[]
}

export type EventUpdateResult = {
  success: boolean
  message: string
  event?: CalendarEvent
  conflictingEvents?: CalendarEvent[]
}

export type EventDeletionResult = {
  success: boolean
  message: string
  eventId?: number
}

export type ScheduleSummary = {
  totalEvents: number
  busyHours: number
  freeHours: number
  busyPercentage: number
  mostBusyDay: {
    day: number
    eventCount: number
  }
  upcomingDeadlines: CalendarEvent[]
}
