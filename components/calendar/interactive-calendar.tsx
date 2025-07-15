"use client"

import { useState, useEffect } from "react"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarIcon,
  Clock,
  MapPin,
  Users,
  X,
  Edit,
  Trash2,
} from "lucide-react"
import { CalendarController } from "@/lib/calendar/controller"
import { FamilyCalendarController } from "@/lib/family/controller"
import type { CalendarEvent } from "@/lib/calendar/types"

interface InteractiveCalendarProps {
  onEventClick?: (event: CalendarEvent) => void
  onDateSelect?: (date: Date) => void
  onAddEvent?: (date: Date, timeSlot?: string) => void
  currentView?: "week" | "month" | "day"
  onViewChange?: (view: "week" | "month" | "day") => void
  currentDate?: Date
  selectedDate?: Date | null
  onNavigation?: (direction: 'previous' | 'next' | 'today') => void
}

export default function InteractiveCalendar({
  onEventClick,
  onDateSelect,
  onAddEvent,
  currentView = "week",
  onViewChange,
  currentDate: externalCurrentDate,
  selectedDate: externalSelectedDate,
  onNavigation,
}: InteractiveCalendarProps) {
  const [internalCurrentDate, setInternalCurrentDate] = useState(new Date())
  const [internalSelectedDate, setInternalSelectedDate] = useState<Date | null>(null)
  
  // Use external state if provided, otherwise use internal state
  const currentDate = externalCurrentDate || internalCurrentDate
  const selectedDate = externalSelectedDate !== undefined ? externalSelectedDate : internalSelectedDate
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [familyEvents, setFamilyEvents] = useState<CalendarEvent[]>([])
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [showEventModal, setShowEventModal] = useState(false)

  // Get current week dates
  const getWeekDates = (date: Date) => {
    const startOfWeek = new Date(date)
    startOfWeek.setDate(date.getDate() - date.getDay())
    
    const weekDates = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      weekDates.push(day)
    }
    return weekDates
  }

  // Get current month dates
  const getMonthDates = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())
    
    const dates = []
    const current = new Date(startDate)
    
    while (current <= lastDay || dates.length < 42) {
      dates.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }
    
    return dates
  }

  // Load events for the current period
  useEffect(() => {
    const loadEvents = () => {
      try {
        // Load calendar events
        const allEvents = CalendarController.getAllEvents()
        setEvents(allEvents)
        
        // Load family events
        const familyEventsData = FamilyCalendarController.getAllFamilyEvents()
        setFamilyEvents(familyEventsData as any)
      } catch (error) {
        console.error("Error loading events:", error)
      }
    }
    
    loadEvents()
  }, [currentDate])

  // Navigation functions
  const goToPreviousPeriod = () => {
    if (onNavigation) {
      onNavigation('previous')
    } else {
      const newDate = new Date(currentDate)
      if (currentView === "week") {
        newDate.setDate(currentDate.getDate() - 7)
      } else if (currentView === "month") {
        newDate.setMonth(currentDate.getMonth() - 1)
      } else {
        newDate.setDate(currentDate.getDate() - 1)
      }
      setInternalCurrentDate(newDate)
    }
  }

  const goToNextPeriod = () => {
    if (onNavigation) {
      onNavigation('next')
    } else {
      const newDate = new Date(currentDate)
      if (currentView === "week") {
        newDate.setDate(currentDate.getDate() + 7)
      } else if (currentView === "month") {
        newDate.setMonth(currentDate.getMonth() + 1)
      } else {
        newDate.setDate(currentDate.getDate() + 1)
      }
      setInternalCurrentDate(newDate)
    }
  }

  const goToToday = () => {
    if (onNavigation) {
      onNavigation('today')
    } else {
      setInternalCurrentDate(new Date())
      setInternalSelectedDate(new Date())
    }
  }

  // Date selection handler
  const handleDateClick = (date: Date) => {
    if (externalSelectedDate === undefined) {
      setInternalSelectedDate(date)
    }
    onDateSelect?.(date)
  }

  // Time slot click handler for adding events
  const handleTimeSlotClick = (date: Date, hour: number) => {
    const timeSlot = `${hour.toString().padStart(2, '0')}:00`
    onAddEvent?.(date, timeSlot)
  }

  // Event click handler
  const handleEventClick = (event: CalendarEvent) => {
    // Normalize the event data to ensure all required properties exist
    const normalizedEvent = {
      ...event,
      title: event.title || 'Untitled Event',
      startTime: event.startTime || '00:00',
      endTime: event.endTime || '01:00',
      description: event.description || '',
      location: event.location || '',
      attendees: event.attendees || [],
      organizer: event.organizer || '',
      color: event.color || 'bg-blue-500',
      type: (event as any).type || 'event',
      typeIcon: (event as any).typeIcon || '📅',
      priority: event.priority || null,
      priorityColor: (event as any).priorityColor || 'bg-gray-100 text-gray-800',
      formattedTime: (event as any).formattedTime || `${event.startTime || '00:00'} - ${event.endTime || '01:00'}`,
      assignedMemberNames: (event as any).assignedMemberNames || event.attendees || []
    }
    setSelectedEvent(normalizedEvent as any)
    setShowEventModal(true)
    onEventClick?.(normalizedEvent as any)
  }

  // Format date for display
  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric' 
    })    
  }

  // Check if date is today
  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  // Check if date is selected
  const isSelected = (date: Date) => {
    return selectedDate && date.toDateString() === selectedDate.toDateString()
  }

  // Get events for a specific date
  const getEventsForDate = (date: Date) => {
    const dayOfWeek = date.getDay() + 1 // Convert to 1-7 format
    return events.filter(event => event.day === dayOfWeek)
  }

  // Time slots for day view
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 7) // 7 AM to 6 PM

  // Calculate event position and height
  const calculateEventStyle = (startTime: string, endTime: string) => {
    const start = parseInt(startTime.split(":")[0]) + parseInt(startTime.split(":")[1]) / 60
    const end = parseInt(endTime.split(":")[0]) + parseInt(endTime.split(":")[1]) / 60
    const top = (start - 7) * 60 // 60px per hour
    const height = (end - start) * 60
    return { top: `${top}px`, height: `${height}px` }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Calendar Header */}
      <div className="flex items-center justify-between p-4 bg-white/5 backdrop-blur-sm">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">
            {currentView === "week" && "Week View"}
            {currentView === "month" && "Month View"}
            {currentView === "day" && "Day View"}
          </h2>
          
          {/* View Toggle */}
          <div className="flex gap-1 bg-white/20 rounded-full p-1">
            {[
              { id: "week", label: "Week" },
              { id: "month", label: "Month" },
              { id: "day", label: "Day" },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => onViewChange?.(view.id as "week" | "month" | "day")}
                className={`px-3 py-1 rounded-full text-sm transition-all touch-manipulation active:scale-95 ${
                  currentView === view.id
                    ? "bg-white text-purple-600 shadow-sm"
                    : "text-white hover:bg-white/10"
                }`}
              >
                {view.label}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={goToToday}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors text-sm touch-manipulation active:scale-95"
          >
            Today
          </button>
          <div className="flex gap-1">
            <button
              onClick={goToPreviousPeriod}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors touch-manipulation active:scale-95"
            >
              <ChevronLeft className="h-4 w-4 text-white" />
            </button>
            <button
              onClick={goToNextPeriod}
              className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors touch-manipulation active:scale-95"
            >
              <ChevronRight className="h-4 w-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="flex-1 overflow-auto bg-white/5 backdrop-blur-sm m-2 rounded-2xl">
        {currentView === "week" && (
          <WeekView
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            familyEvents={familyEvents}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
            timeSlots={timeSlots}
            calculateEventStyle={calculateEventStyle}
          />
        )}
        
        {currentView === "month" && (
          <MonthView
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            onDateClick={handleDateClick}
            onEventClick={handleEventClick}
          />
        )}
        
        {currentView === "day" && (
          <DayView
            currentDate={currentDate}
            selectedDate={selectedDate}
            events={events}
            onEventClick={handleEventClick}
            onTimeSlotClick={handleTimeSlotClick}
            timeSlots={timeSlots}
            calculateEventStyle={calculateEventStyle}
          />
        )}
      </div>

      {/* Event Detail Modal */}
      {showEventModal && selectedEvent && (
        <EventDetailModal
          event={selectedEvent}
          onClose={() => {
            setShowEventModal(false)
            setSelectedEvent(null)
          }}
          onEdit={() => {
            // Handle edit event
            console.log("Edit event:", selectedEvent)
          }}
          onDelete={() => {
            // Handle delete event
            console.log("Delete event:", selectedEvent)
            setShowEventModal(false)
            setSelectedEvent(null)
          }}
        />
      )}
    </div>
  )
}

// Week View Component
function WeekView({
  currentDate,
  selectedDate,
  events,
  familyEvents,
  onDateClick,
  onEventClick,
  onTimeSlotClick,
  timeSlots,
  calculateEventStyle,
}: {
  currentDate: Date
  selectedDate: Date | null
  events: CalendarEvent[]
  familyEvents: any[]
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
  onTimeSlotClick: (date: Date, hour: number) => void
  timeSlots: number[]
  calculateEventStyle: (startTime: string, endTime: string) => { top: string; height: string }
}) {
  const weekDates = getWeekDates(currentDate)
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]

  return (
    <div className="grid grid-cols-8 min-h-full min-w-[800px]">
      {/* Time column */}
      <div className="border-r border-white/20">
        <div className="h-16 border-b border-white/20"></div>
        {timeSlots.map((hour) => (
          <div
            key={hour}
            className="h-16 border-b border-white/20 flex items-start justify-end pr-3 pt-1"
          >
            <span className="text-xs text-white/70">{hour}:00</span>
          </div>
        ))}
      </div>

      {/* Day columns */}
      {weekDates.map((date, dayIndex) => (
        <div key={date.toISOString()} className="border-r border-white/20 relative min-w-[100px]">
          {/* Day header */}
          <div 
            className={`h-16 border-b border-white/20 flex flex-col items-center justify-center cursor-pointer transition-all touch-manipulation active:scale-95 ${
              isToday(date) ? "bg-purple-500/20" : ""
            } ${isSelected(date) ? "bg-white/20" : "hover:bg-white/10"}`}
            onClick={() => onDateClick(date)}
          >
            <span className="text-xs text-white/70 font-medium">{weekDays[dayIndex]}</span>
            <span className={`text-lg font-bold ${isToday(date) ? "text-purple-300" : "text-white"}`}>
              {date.getDate()}
            </span>
          </div>

          {/* Time slots */}
          {timeSlots.map((hour) => (
            <div 
              key={hour} 
              className="h-16 border-b border-white/10 cursor-pointer hover:bg-white/5 transition-colors touch-manipulation active:bg-white/10"
              onClick={() => onTimeSlotClick(date, hour)}
            ></div>
          ))}

          {/* Events for this day */}
          {events
            .filter((event) => event.day === dayIndex + 1)
            .map((event) => {
              const style = calculateEventStyle(event.startTime, event.endTime)
              return (
                <div
                  key={event.id}
                  className={`absolute left-1 right-1 ${event.color} rounded-lg p-2 text-white text-xs cursor-pointer hover:shadow-lg transition-all z-10 touch-manipulation active:scale-95`}
                  style={style}
                  onClick={() => onEventClick(event)}
                >
                  <div className="font-medium truncate">{event.title}</div>
                  <div className="text-white/80 truncate text-xs">
                    {event.startTime} - {event.endTime}
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="truncate text-xs">{event.location}</span>
                    </div>
                  )}
                </div>
              )
            })}
        </div>
      ))}
    </div>
  )
}

// Month View Component
function MonthView({
  currentDate,
  selectedDate,
  events,
  onDateClick,
  onEventClick,
}: {
  currentDate: Date
  selectedDate: Date | null
  events: CalendarEvent[]
  onDateClick: (date: Date) => void
  onEventClick: (event: CalendarEvent) => void
}) {
  const monthDates = getMonthDates(currentDate)
  const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

  return (
    <div className="p-4">
      {/* Week day headers */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {weekDays.map((day) => (
          <div key={day} className="text-center text-white/70 text-sm font-medium py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 gap-1">
        {monthDates.map((date, index) => {
          const isCurrentMonth = date.getMonth() === currentDate.getMonth()
          const dayEvents = getEventsForDate(date, events)
          
          return (
            <div
              key={index}
              className={`min-h-[80px] p-2 border border-white/10 rounded-lg cursor-pointer transition-all touch-manipulation active:scale-95 ${
                isCurrentMonth ? "bg-white/5" : "bg-white/5 opacity-50"
              } ${isToday(date) ? "ring-2 ring-purple-500" : ""} ${
                isSelected(date) ? "bg-white/20" : "hover:bg-white/10"
              }`}
              onClick={() => onDateClick(date)}
            >
              <div className={`text-sm font-medium mb-1 ${
                isCurrentMonth ? "text-white" : "text-white/50"
              }`}>
                {date.getDate()}
              </div>
              
              {/* Events for this day */}
              <div className="space-y-1">
                {dayEvents.slice(0, 2).map((event) => (
                  <div
                    key={event.id}
                    className={`text-xs p-1 rounded ${event.color} text-white cursor-pointer hover:opacity-80 transition-opacity touch-manipulation active:scale-95`}
                    onClick={(e) => {
                      e.stopPropagation()
                      onEventClick(event)
                    }}
                  >
                    <div className="truncate font-medium">{event.title}</div>
                    <div className="text-white/80 truncate">{event.startTime}</div>
                  </div>
                ))}
                {dayEvents.length > 2 && (
                  <div className="text-xs text-white/60 text-center">
                    +{dayEvents.length - 2} more
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Day View Component
function DayView({
  currentDate,
  selectedDate,
  events,
  onEventClick,
  onTimeSlotClick,
  timeSlots,
  calculateEventStyle,
}: {
  currentDate: Date
  selectedDate: Date | null
  events: CalendarEvent[]
  onEventClick: (event: CalendarEvent) => void
  onTimeSlotClick: (date: Date, hour: number) => void
  timeSlots: number[]
  calculateEventStyle: (startTime: string, endTime: string) => { top: string; height: string }
}) {
  const displayDate = selectedDate || currentDate
  const dayEvents = getEventsForDate(displayDate, events)

  return (
    <div className="grid grid-cols-1 min-h-full">
      {/* Day header */}
      <div className="h-16 border-b border-white/20 flex items-center justify-center">
        <div className="text-center">
          <div className="text-white font-bold text-lg">
            {displayDate.toLocaleDateString('en-US', { weekday: 'long' })}
          </div>
          <div className="text-white/70 text-sm">
            {displayDate.toLocaleDateString('en-US', { 
              month: 'long', 
              day: 'numeric', 
              year: 'numeric' 
            })}
          </div>
        </div>
      </div>

      {/* Time slots */}
      <div className="relative">
        {timeSlots.map((hour) => (
          <div
            key={hour}
            className="h-16 border-b border-white/10 flex items-start justify-end pr-4 pt-1 cursor-pointer hover:bg-white/5 transition-colors touch-manipulation active:bg-white/10"
            onClick={() => onTimeSlotClick(displayDate, hour)}
          >
            <span className="text-xs text-white/70">{hour}:00</span>
          </div>
        ))}

        {/* Events for this day */}
        {dayEvents.map((event) => {
          const style = calculateEventStyle(event.startTime, event.endTime)
          return (
            <div
              key={event.id}
              className={`absolute left-4 right-4 ${event.color} rounded-lg p-3 text-white cursor-pointer hover:shadow-lg transition-all z-10 touch-manipulation active:scale-95`}
              style={style}
              onClick={() => onEventClick(event)}
            >
              <div className="font-medium truncate">{event.title}</div>
              <div className="text-white/80 text-sm">
                {event.startTime} - {event.endTime}
              </div>
              {event.location && (
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3" />
                  <span className="truncate text-xs">{event.location}</span>
                </div>
              )}
              {event.attendees && event.attendees.length > 0 && (
                <div className="flex items-center gap-1 mt-1">
                  <Users className="h-3 w-3" />
                  <span className="truncate text-xs">{event.attendees.length} attendees</span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// Event Detail Modal Component
function EventDetailModal({
  event,
  onClose,
  onEdit,
  onDelete,
}: {
  event: CalendarEvent
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-800 truncate">{event.title}</h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0 touch-manipulation active:scale-95"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="space-y-3">
                      <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700">
                {(event as any).formattedTime || `${event.startTime} - ${event.endTime}`}
              </span>
            </div>

          {event.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <span className="text-gray-700 truncate">{event.location}</span>
            </div>
          )}

          {(event.attendees && event.attendees.length > 0) || ((event as any).assignedMemberNames && (event as any).assignedMemberNames.length > 0) ? (
            <div className="flex items-center gap-3">
              <Users className="h-5 w-5 text-gray-500 flex-shrink-0" />
              <div className="flex flex-wrap gap-1">
                {(event.attendees || (event as any).assignedMemberNames || []).map((attendee: string, i: number) => (
                  <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                    {attendee}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          {event.description && (
            <div className="mt-4">
              <p className="text-gray-600 text-sm">{event.description}</p>
            </div>
          )}

          <div className="flex items-center gap-2 mt-4">
            <div className={`w-4 h-4 rounded ${event.color}`}></div>
            <span className="text-sm text-gray-500">Event</span>
          </div>
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onEdit}
            className="flex-1 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors text-sm"
          >
            <Edit className="h-4 w-4 inline mr-2" />
            Edit Event
          </button>
          <button
            onClick={onDelete}
            className="px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Helper functions
function getWeekDates(date: Date) {
  const startOfWeek = new Date(date)
  startOfWeek.setDate(date.getDate() - date.getDay())
  
  const weekDates = []
  for (let i = 0; i < 7; i++) {
    const day = new Date(startOfWeek)
    day.setDate(startOfWeek.getDate() + i)
    weekDates.push(day)
  }
  return weekDates
}

function getMonthDates(date: Date) {
  const year = date.getFullYear()
  const month = date.getMonth()
  const firstDay = new Date(year, month, 1)
  const lastDay = new Date(year, month + 1, 0)
  
  const startDate = new Date(firstDay)
  startDate.setDate(firstDay.getDate() - firstDay.getDay())
  
  const dates = []
  const current = new Date(startDate)
  
  while (current <= lastDay || dates.length < 42) {
    dates.push(new Date(current))
    current.setDate(current.getDate() + 1)
  }
  
  return dates
}

function getEventsForDate(date: Date, events: CalendarEvent[]) {
  const dayOfWeek = date.getDay() + 1 // Convert to 1-7 format
  return events.filter(event => event.day === dayOfWeek)
}

function isToday(date: Date) {
  const today = new Date()
  return date.toDateString() === today.toDateString()
}

function isSelected(date: Date) {
  return false // This would be set based on selected date
}
