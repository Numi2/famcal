/**
 * Basic test file to verify timezone functionality
 * Run with: node -r ts-node/register lib/utils/timezone.test.ts
 */

import {
  getUserTimezone,
  createDateTimeInTimezone,
  formatTimeInTimezone,
  isLegacyTimeFormat,
  dayAndTimeToDateTime,
  extractTimeFromDateTime,
  convertDateTimeToLegacyFormat
} from './timezone'

function testBasicTimezone() {
  console.log('=== Testing Basic Timezone Functions ===')
  
  // Test getUserTimezone
  const userTz = getUserTimezone()
  console.log('User timezone:', userTz)
  
  // Test isLegacyTimeFormat
  console.log('isLegacyTimeFormat("09:30"):', isLegacyTimeFormat("09:30"))
  console.log('isLegacyTimeFormat("2023-01-01T09:30:00Z"):', isLegacyTimeFormat("2023-01-01T09:30:00Z"))
  
  // Test time formatting
  const now = new Date()
  console.log('Current time in user timezone:', formatTimeInTimezone(now))
  console.log('Current time in UTC:', formatTimeInTimezone(now, 'UTC'))
  console.log('Current time in EST:', formatTimeInTimezone(now, 'America/New_York'))
  
  console.log('')
}

function testTimezoneConversion() {
  console.log('=== Testing Timezone Conversion ===')
  
  // Test creating timezone-aware datetime
  const today = new Date()
  const timeString = "14:30"
  
  const utcDateTime = createDateTimeInTimezone(today, timeString, 'UTC')
  const estDateTime = createDateTimeInTimezone(today, timeString, 'America/New_York')
  
  console.log('Today at 14:30 UTC:', utcDateTime.toISOString())
  console.log('Today at 14:30 EST:', estDateTime.toISOString())
  
  // Test extracting time from datetime
  const extractedUTC = extractTimeFromDateTime(utcDateTime, 'UTC')
  const extractedEST = extractTimeFromDateTime(estDateTime, 'America/New_York')
  
  console.log('Extracted time from UTC datetime:', extractedUTC)
  console.log('Extracted time from EST datetime:', extractedEST)
  
  console.log('')
}

function testLegacyConversion() {
  console.log('=== Testing Legacy Format Conversion ===')
  
  // Test day and time to datetime
  const dayNumber = 2 // Monday
  const timeString = "09:00"
  
  const utcDateTime = dayAndTimeToDateTime(dayNumber, timeString, 'UTC')
  const estDateTime = dayAndTimeToDateTime(dayNumber, timeString, 'America/New_York')
  
  console.log('Monday 09:00 UTC:', utcDateTime.toISOString())
  console.log('Monday 09:00 EST:', estDateTime.toISOString())
  
  // Test converting back to legacy format
  const legacyUTC = convertDateTimeToLegacyFormat(utcDateTime, 'UTC')
  const legacyEST = convertDateTimeToLegacyFormat(estDateTime, 'America/New_York')
  
  console.log('Back to legacy format (UTC):', legacyUTC)
  console.log('Back to legacy format (EST):', legacyEST)
  
  console.log('')
}

function testCrossTzimezoneDiffferences() {
  console.log('=== Testing Cross-Timezone Differences ===')
  
  // Create an event at 3 PM EST
  const eventDate = new Date()
  const eventTime = "15:00"
  
  const estDateTime = createDateTimeInTimezone(eventDate, eventTime, 'America/New_York')
  
  console.log('Event created at 3 PM EST:', estDateTime.toISOString())
  
  // Show how it appears in different timezones
  const timezones = ['UTC', 'America/Los_Angeles', 'Europe/London', 'Asia/Tokyo']
  
  timezones.forEach(tz => {
    const localTime = formatTimeInTimezone(estDateTime, tz)
    console.log(`Time in ${tz}: ${localTime}`)
  })
  
  console.log('')
}

// Run all tests
if (require.main === module) {
  testBasicTimezone()
  testTimezoneConversion()
  testLegacyConversion()
  testCrossTzimezoneDiffferences()
  
  console.log('All timezone tests completed!')
}