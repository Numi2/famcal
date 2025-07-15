"use client"

import { useState, useEffect } from "react"
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Users,
  FileText,
  Palette,
  Save,
  Plus,
} from "lucide-react"
import type { CalendarEvent } from "@/lib/calendar/types"

interface EventFormProps {
  isOpen: boolean
  onClose: () => void
  onSubmit: (eventData: Omit<CalendarEvent, "id">) => void
  event?: CalendarEvent | null
  selectedDate?: Date
  selectedTime?: string
}

const colorOptions = [
  { name: "Blue", value: "bg-blue-500" },
  { name: "Green", value: "bg-green-500" },
  { name: "Purple", value: "bg-purple-500" },
  { name: "Yellow", value: "bg-yellow-500" },
  { name: "Red", value: "bg-red-500" },
  { name: "Indigo", value: "bg-indigo-500" },
  { name: "Pink", value: "bg-pink-500" },
  { name: "Orange", value: "bg-orange-500" },
]

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2)
  const minute = (i % 2) * 30
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
})

export default function EventForm({
  isOpen,
  onClose,
  onSubmit,
  event,
  selectedDate,
  selectedTime,
}: EventFormProps) {
  const [formData, setFormData] = useState({
    title: "",
    startTime: "09:00",
    endTime: "10:00",
    day: 1,
    description: "",
    location: "",
    attendees: [] as string[],
    organizer: "",
    color: "bg-blue-500",
  })

  const [attendeeInput, setAttendeeInput] = useState("")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Initialize form with event data or selected date/time
  useEffect(() => {
    if (event) {
      setFormData({
        title: event.title,
        startTime: event.startTime,
        endTime: event.endTime,
        day: event.day,
        description: event.description,
        location: event.location,
        attendees: event.attendees || [],
        organizer: event.organizer,
        color: event.color,
      })
    } else if (selectedDate && selectedTime) {
      const dayOfWeek = selectedDate.getDay() + 1 // Convert to 1-7 format
      setFormData(prev => ({
        ...prev,
        day: dayOfWeek,
        startTime: selectedTime,
        endTime: getEndTime(selectedTime),
      }))
    } else {
      // Reset form
      setFormData({
        title: "",
        startTime: "09:00",
        endTime: "10:00",
        day: 1,
        description: "",
        location: "",
        attendees: [],
        organizer: "",
        color: "bg-blue-500",
      })
    }
    setErrors({})
  }, [event, selectedDate, selectedTime])

  const getEndTime = (startTime: string) => {
    const [hour, minute] = startTime.split(":").map(Number)
    const endHour = hour + 1
    return `${endHour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.title.trim()) {
      newErrors.title = "Title is required"
    }

    if (!formData.startTime || !formData.endTime) {
      newErrors.time = "Start and end times are required"
    } else {
      const startMinutes = getMinutesFromTime(formData.startTime)
      const endMinutes = getMinutesFromTime(formData.endTime)
      
      if (endMinutes <= startMinutes) {
        newErrors.time = "End time must be after start time"
      }
    }

    if (formData.day < 1 || formData.day > 7) {
      newErrors.day = "Invalid day selection"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const getMinutesFromTime = (time: string) => {
    const [hour, minute] = time.split(":").map(Number)
    return hour * 60 + minute
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    onSubmit(formData)
    onClose()
  }

  const addAttendee = () => {
    if (attendeeInput.trim() && !formData.attendees.includes(attendeeInput.trim())) {
      setFormData(prev => ({
        ...prev,
        attendees: [...prev.attendees, attendeeInput.trim()]
      }))
      setAttendeeInput("")
    }
  }

  const removeAttendee = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attendees: prev.attendees.filter((_, i) => i !== index)
    }))
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addAttendee()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-800">
            {event ? "Edit Event" : "Add New Event"}
          </h3>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter event title"
            />
            {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title}</p>}
          </div>

          {/* Day Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Day *
            </label>
            <select
              value={formData.day}
              onChange={(e) => setFormData(prev => ({ ...prev, day: parseInt(e.target.value) }))}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                errors.day ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value={1}>Sunday</option>
              <option value={2}>Monday</option>
              <option value={3}>Tuesday</option>
              <option value={4}>Wednesday</option>
              <option value={5}>Thursday</option>
              <option value={6}>Friday</option>
              <option value={7}>Saturday</option>
            </select>
            {errors.day && <p className="text-red-500 text-xs mt-1">{errors.day}</p>}
          </div>

          {/* Time Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Time *
              </label>
              <select
                value={formData.startTime}
                onChange={(e) => {
                  const newStartTime = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    startTime: newStartTime,
                    endTime: getEndTime(newStartTime)
                  }))
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.time ? "border-red-500" : "border-gray-300"
                }`}
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Time *
              </label>
              <select
                value={formData.endTime}
                onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                  errors.time ? "border-red-500" : "border-gray-300"
                }`}
              >
                {timeSlots.map((time) => (
                  <option key={time} value={time}>{time}</option>
                ))}
              </select>
            </div>
          </div>
          {errors.time && <p className="text-red-500 text-xs">{errors.time}</p>}

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Location
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Enter location"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter event description"
              rows={3}
            />
          </div>

          {/* Attendees */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Attendees
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={attendeeInput}
                onChange={(e) => setAttendeeInput(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                placeholder="Add attendee"
              />
              <button
                type="button"
                onClick={addAttendee}
                className="px-3 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>
            {formData.attendees.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {formData.attendees.map((attendee, index) => (
                  <span
                    key={index}
                    className="flex items-center gap-1 bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs"
                  >
                    <Users className="h-3 w-3" />
                    {attendee}
                    <button
                      type="button"
                      onClick={() => removeAttendee(index)}
                      className="ml-1 hover:text-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Organizer */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Organizer
            </label>
            <input
              type="text"
              value={formData.organizer}
              onChange={(e) => setFormData(prev => ({ ...prev, organizer: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Enter organizer name"
            />
          </div>

          {/* Color Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Color
            </label>
            <div className="grid grid-cols-4 gap-2">
              {colorOptions.map((color) => (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, color: color.value }))}
                  className={`p-3 rounded-lg border-2 transition-all ${
                    formData.color === color.value
                      ? "border-purple-500 ring-2 ring-purple-200"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <div className={`w-full h-6 rounded ${color.value}`}></div>
                  <span className="text-xs text-gray-600 mt-1 block">{color.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"
            >
              <Save className="h-4 w-4" />
              {event ? "Update Event" : "Create Event"}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
} 