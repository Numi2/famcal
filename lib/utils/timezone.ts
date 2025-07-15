/**
 * Timezone utility functions for handling event times across different timezones
 */

/**
 * Get the user's current timezone
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone
  } catch (error) {
    console.warn('Could not determine user timezone, falling back to UTC')
    return 'UTC'
  }
}

/**
 * Convert a time string (HH:MM) and date to a full datetime in user's timezone
 */
export function createDateTimeInTimezone(
  date: Date,
  timeString: string,
  timezone: string = getUserTimezone()
): Date {
  const [hours, minutes] = timeString.split(':').map(Number)
  
  // Create a date object in the user's timezone
  const dateTime = new Date(date)
  dateTime.setHours(hours, minutes, 0, 0)
  
  // Convert to UTC for storage
  const utcTime = new Date(dateTime.toLocaleString('en-US', { timeZone: 'UTC' }))
  const localTime = new Date(dateTime.toLocaleString('en-US', { timeZone: timezone }))
  const offset = utcTime.getTime() - localTime.getTime()
  
  return new Date(dateTime.getTime() + offset)
}

/**
 * Convert a UTC datetime to a time string in the user's timezone
 */
export function formatTimeInTimezone(
  dateTime: Date | string,
  timezone: string = getUserTimezone()
): string {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
  
  return date.toLocaleTimeString('en-US', {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Convert a UTC datetime to a formatted date and time string in the user's timezone
 */
export function formatDateTimeInTimezone(
  dateTime: Date | string,
  timezone: string = getUserTimezone()
): string {
  const date = typeof dateTime === 'string' ? new Date(dateTime) : dateTime
  
  return date.toLocaleString('en-US', {
    timeZone: timezone,
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

/**
 * Convert legacy time string format (HH:MM) to timezone-aware datetime
 * This is used for migrating existing events that only have time strings
 */
export function convertLegacyTimeToDateTime(
  timeString: string,
  referenceDate: Date = new Date(),
  timezone: string = getUserTimezone()
): Date {
  return createDateTimeInTimezone(referenceDate, timeString, timezone)
}

/**
 * Check if a date/time string is in the old format (just HH:MM) vs ISO format
 */
export function isLegacyTimeFormat(timeString: string): boolean {
  const timeRegex = /^([01]\d|2[0-3]):([0-5]\d)$/
  return timeRegex.test(timeString)
}

/**
 * Get the day of week number (1-7) for a date in a specific timezone
 */
export function getDayOfWeekInTimezone(
  date: Date,
  timezone: string = getUserTimezone()
): number {
  const localDate = new Date(date.toLocaleString('en-US', { timeZone: timezone }))
  return localDate.getDay() + 1 // Convert from 0-6 to 1-7
}

/**
 * Convert a day number and time string to a full datetime
 * This is used for the existing day-based event system
 */
export function dayAndTimeToDateTime(
  dayNumber: number, // 1-7 (Sunday-Saturday)
  timeString: string,
  timezone: string = getUserTimezone()
): Date {
  const now = new Date()
  const currentDay = getDayOfWeekInTimezone(now, timezone)
  
  // Calculate days to add/subtract to get to the target day
  let daysToAdd = dayNumber - currentDay
  if (daysToAdd < 0) {
    daysToAdd += 7 // Move to next week
  }
  
  const targetDate = new Date(now)
  targetDate.setDate(now.getDate() + daysToAdd)
  
  return createDateTimeInTimezone(targetDate, timeString, timezone)
}

/**
 * Extract day number from a datetime in a specific timezone
 */
export function extractDayFromDateTime(
  dateTime: Date,
  timezone: string = getUserTimezone()
): number {
  return getDayOfWeekInTimezone(dateTime, timezone)
}

/**
 * Extract time string from a datetime in a specific timezone
 */
export function extractTimeFromDateTime(
  dateTime: Date,
  timezone: string = getUserTimezone()
): string {
  return formatTimeInTimezone(dateTime, timezone)
}

/**
 * Convert a datetime to the format expected by the legacy system
 */
export function convertDateTimeToLegacyFormat(
  dateTime: Date,
  timezone: string = getUserTimezone()
): { day: number; startTime: string; endTime?: string } {
  return {
    day: extractDayFromDateTime(dateTime, timezone),
    startTime: extractTimeFromDateTime(dateTime, timezone)
  }
}

/**
 * Get available timezones for user selection
 */
export function getAvailableTimezones(): Array<{ value: string; label: string }> {
  const timezones = [
    'UTC',
    'America/New_York',
    'America/Chicago',
    'America/Denver', 
    'America/Los_Angeles',
    'America/Toronto',
    'America/Vancouver',
    'Europe/London',
    'Europe/Paris',
    'Europe/Berlin',
    'Europe/Rome',
    'Asia/Tokyo',
    'Asia/Shanghai',
    'Asia/Seoul',
    'Asia/Kolkata',
    'Australia/Sydney',
    'Australia/Melbourne',
    'Pacific/Auckland'
  ]
  
  return timezones.map(tz => ({
    value: tz,
    label: tz.replace('_', ' ').replace('/', ' / ')
  }))
}