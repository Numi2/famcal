"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
  Settings,
  Menu,
  Heart,
  Users,
  Utensils,
  CheckSquare,
  Lightbulb,
  DollarSign,
  CalendarIcon,
  Clock,
  MapPin,
  X,
} from "lucide-react"
import { FamilyCalendarController } from "@/lib/family/controller"
import { FamilyCalendarPresenter } from "@/lib/family/presenter"
import FamilyStats from "@/components/family-dashboard/family-stats"
import FamilyQuickActions from "@/components/family-dashboard/quick-actions"
import ChildrenOverview from "@/components/family-dashboard/children-overview"

export default function FamilyCalendarHome() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentView, setCurrentView] = useState("week")
  const [currentMonth, setCurrentMonth] = useState("March 2025")
  const [currentDate, setCurrentDate] = useState("March 5")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeTab, setActiveTab] = useState("calendar")
  const [showDashboard, setShowDashboard] = useState(false)

  // Family data
  const [familyMembers, setFamilyMembers] = useState([])
  const [familyEvents, setFamilyEvents] = useState([])
  const [familyInsights, setFamilyInsights] = useState([])
  const [todayMeals, setTodayMeals] = useState([])
  const [pendingChores, setPendingChores] = useState([])

  useEffect(() => {
    setIsLoaded(true)

    // Load family data
    const members = FamilyCalendarPresenter.formatFamilyMembers(FamilyCalendarController.getFamilyMembers())
    const events = FamilyCalendarPresenter.getFormattedFamilyEventsByDay(2) // Monday
    const insights = FamilyCalendarPresenter.getFormattedFamilyInsights()
    const meals = FamilyCalendarPresenter.formatMealPlans(FamilyCalendarController.getMealPlansByDay(2))
    const chores = FamilyCalendarPresenter.formatChoreAssignments(FamilyCalendarController.getPendingChores())

    setFamilyMembers(members)
    setFamilyEvents(events)
    setFamilyInsights(insights)
    setTodayMeals(meals)
    setPendingChores(chores)
  }, [])

  const handleEventClick = (event) => {
    setSelectedEvent(event)
  }

  // Calendar days for the week view
  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"]
  const weekDates = [3, 4, 5, 6, 7, 8, 9]
  const timeSlots = Array.from({ length: 12 }, (_, i) => i + 7) // 7 AM to 6 PM

  // Helper function to calculate event position and height
  const calculateEventStyle = (startTime, endTime) => {
    const start = Number.parseInt(startTime.split(":")[0]) + Number.parseInt(startTime.split(":")[1]) / 60
    const end = Number.parseInt(endTime.split(":")[0]) + Number.parseInt(endTime.split(":")[1]) / 60
    const top = (start - 7) * 60 // 60px per hour
    const height = (end - start) * 60
    return { top: `${top}px`, height: `${height}px` }
  }

  // Mini calendar
  const daysInMonth = 31
  const firstDayOffset = 5
  const miniCalendarDays = Array.from({ length: daysInMonth + firstDayOffset }, (_, i) =>
    i < firstDayOffset ? null : i - firstDayOffset + 1,
  )

  const children = familyMembers.filter((member) => member.role === "child")
  const parents = familyMembers.filter((member) => member.role === "parent")

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Navigation */}
      <header
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-8 py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-4">
          <Menu className="h-6 w-6 text-white" />
          <span className="text-2xl font-semibold text-white drop-shadow-lg">Family Calendar</span>
          <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
            <Heart className="h-4 w-4 text-pink-300" />
            <span className="text-sm text-white">AI-Powered</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors flex items-center gap-2"
          >
            <div className="h-4 w-4" />
            Dashboard
          </button>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Search family events..."
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
            />
          </div>
          <Settings className="h-6 w-6 text-white drop-shadow-md" />
          <div className="flex items-center gap-2">
            {parents.slice(0, 2).map((parent, i) => (
              <div
                key={parent.id}
                className={`h-8 w-8 rounded-full ${parent.color} flex items-center justify-center text-white text-sm font-bold shadow-md ${i > 0 ? "-ml-2" : ""}`}
              >
                {parent.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Family Dashboard Overlay */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-start justify-center pt-20 overflow-y-auto">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 max-w-6xl w-full mx-4 border border-white/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-white">Family Dashboard</h2>
              <button
                onClick={() => setShowDashboard(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-6 w-6 text-white" />
              </button>
            </div>

            <FamilyStats />
            <FamilyQuickActions />
            <ChildrenOverview />
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative h-screen w-full pt-20 flex">
        {/* Family Sidebar */}
        <div
          className={`w-80 h-full bg-white/10 backdrop-blur-lg p-4 shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""} flex flex-col`}
          style={{ animationDelay: "0.4s" }}
        >
          {/* Quick Actions */}
          <div className="mb-6">
            <button className="mb-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-4 py-3 text-white w-full hover:from-pink-600 hover:to-purple-700 transition-all">
              <Plus className="h-5 w-5" />
              <span>Add Family Event</span>
            </button>

            {/* Tab Navigation */}
            <div className="flex gap-1 mb-4 bg-white/20 rounded-full p-1">
              {[
                { id: "calendar", icon: CalendarIcon, label: "Calendar" },
                { id: "meals", icon: Utensils, label: "Meals" },
                { id: "chores", icon: CheckSquare, label: "Chores" },
                { id: "insights", icon: Lightbulb, label: "Insights" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1 px-3 py-2 rounded-full text-xs transition-all ${
                    activeTab === tab.id ? "bg-white text-purple-600 shadow-sm" : "text-white hover:bg-white/10"
                  }`}
                >
                  <tab.icon className="h-3 w-3" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === "calendar" && (
              <>
                {/* Mini Calendar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-white font-medium">{currentMonth}</h3>
                    <div className="flex gap-1">
                      <button className="p-1 rounded-full hover:bg-white/20">
                        <ChevronLeft className="h-4 w-4 text-white" />
                      </button>
                      <button className="p-1 rounded-full hover:bg-white/20">
                        <ChevronRight className="h-4 w-4 text-white" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                      <div key={i} className="text-xs text-white/70 font-medium py-1">
                        {day}
                      </div>
                    ))}

                    {miniCalendarDays.map((day, i) => (
                      <div
                        key={i}
                        className={`text-xs rounded-full w-7 h-7 flex items-center justify-center ${
                          day === 5 ? "bg-purple-500 text-white" : "text-white hover:bg-white/20"
                        } ${!day ? "invisible" : ""}`}
                      >
                        {day}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Family Members */}
                <div>
                  <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Family Members
                  </h3>
                  <div className="space-y-3">
                    {familyMembers.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                      >
                        <div
                          className={`w-8 h-8 rounded-full ${member.color} flex items-center justify-center text-white text-sm font-bold shadow-sm`}
                        >
                          {member.name.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="text-white text-sm font-medium">{member.displayName}</div>
                          <div className="text-white/70 text-xs flex items-center gap-1">
                            {member.roleIcon}
                            {member.role === "child" && member.grade && <span>{member.grade}</span>}
                          </div>
                        </div>
                        <div className="text-xs text-white/60">
                          {FamilyCalendarController.getFamilyEventsByMember(member.id).length} events
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeTab === "meals" && (
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Utensils className="h-4 w-4" />
                  Today's Meals
                </h3>
                {todayMeals.length > 0 ? (
                  <div className="space-y-3">
                    {todayMeals.map((meal) => (
                      <div key={meal.id} className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{meal.mealTypeIcon}</span>
                          <span className="text-white font-medium capitalize">{meal.mealType}</span>
                          <span className="text-xs">{meal.kidFriendlyIcon}</span>
                        </div>
                        <div className="text-white text-sm mb-1">{meal.meal}</div>
                        <div className="text-white/70 text-xs">{meal.formattedPrepTime}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/70 text-sm text-center py-4">
                    No meals planned for today
                    <br />
                    <button className="text-purple-300 hover:text-purple-200 mt-2">Get meal suggestions →</button>
                  </div>
                )}
              </div>
            )}

            {activeTab === "chores" && (
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <CheckSquare className="h-4 w-4" />
                  Pending Chores
                </h3>
                {pendingChores.length > 0 ? (
                  <div className="space-y-3">
                    {pendingChores.map((chore) => (
                      <div key={chore.id} className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-white text-sm font-medium">{chore.chore}</span>
                          <span className="text-xs">{chore.statusIcon}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-white/70 text-xs">{chore.assignedMemberName}</span>
                          <span className="text-purple-300 text-xs">{chore.pointsDisplay}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/70 text-sm text-center py-4">All chores completed! 🎉</div>
                )}
              </div>
            )}

            {activeTab === "insights" && (
              <div>
                <h3 className="text-white font-medium mb-3 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4" />
                  Family Insights
                </h3>
                {familyInsights.length > 0 ? (
                  <div className="space-y-3">
                    {familyInsights.slice(0, 3).map((insight) => (
                      <div key={insight.id} className="bg-white/10 rounded-lg p-3">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg">{insight.typeIcon}</span>
                          <span className="text-white text-sm font-medium">{insight.title}</span>
                        </div>
                        <div className="text-white/80 text-xs mb-2">{insight.message}</div>
                        {insight.actionable && (
                          <button className="text-purple-300 hover:text-purple-200 text-xs">{insight.action} →</button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-white/70 text-sm text-center py-4">No insights available</div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-6 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-bold text-white drop-shadow-lg">Family Week View</h2>
              <div className="flex items-center gap-2 bg-white/20 rounded-full px-3 py-1">
                <Clock className="h-4 w-4 text-white" />
                <span className="text-white text-sm">March 3-9, 2025</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors">
                Today
              </button>
              <div className="flex gap-1">
                <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <ChevronLeft className="h-5 w-5 text-white" />
                </button>
                <button className="p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <ChevronRight className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Week Calendar Grid */}
          <div className="flex-1 overflow-auto bg-white/5 backdrop-blur-sm m-4 rounded-2xl">
            <div className="grid grid-cols-8 min-h-full">
              {/* Time column */}
              <div className="border-r border-white/20">
                <div className="h-16 border-b border-white/20"></div>
                {timeSlots.map((hour) => (
                  <div key={hour} className="h-16 border-b border-white/20 flex items-start justify-end pr-3 pt-1">
                    <span className="text-xs text-white/70">{hour}:00</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => (
                <div key={day} className="border-r border-white/20 relative">
                  {/* Day header */}
                  <div className="h-16 border-b border-white/20 flex flex-col items-center justify-center">
                    <span className="text-xs text-white/70 font-medium">{day}</span>
                    <span className={`text-lg font-bold ${dayIndex === 1 ? "text-purple-300" : "text-white"}`}>
                      {weekDates[dayIndex]}
                    </span>
                  </div>

                  {/* Time slots */}
                  {timeSlots.map((hour) => (
                    <div key={hour} className="h-16 border-b border-white/10"></div>
                  ))}

                  {/* Events for this day */}
                  {familyEvents
                    .filter((event) => event.day === dayIndex + 1)
                    .map((event) => {
                      const style = calculateEventStyle(event.startTime, event.endTime)
                      return (
                        <div
                          key={event.id}
                          className={`absolute left-1 right-1 ${event.color} rounded-lg p-2 text-white text-xs cursor-pointer hover:shadow-lg transition-all z-10`}
                          style={style}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="font-medium truncate">{event.title}</div>
                          <div className="text-white/80 truncate">{event.formattedTime}</div>
                          <div className="flex items-center gap-1 mt-1">
                            {event.assignedMemberNames.slice(0, 2).map((name, i) => (
                              <span key={i} className="text-xs bg-white/20 rounded px-1">
                                {name}
                              </span>
                            ))}
                            {event.typeIcon && <span className="ml-1">{event.typeIcon}</span>}
                          </div>
                        </div>
                      )
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-800">{selectedEvent.title}</h3>
              <button onClick={() => setSelectedEvent(null)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <span className="text-gray-700">{selectedEvent.formattedTime}</span>
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500" />
                  <span className="text-gray-700">{selectedEvent.location}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div className="flex flex-wrap gap-1">
                  {selectedEvent.assignedMemberNames.map((name, i) => (
                    <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                      {name}
                    </span>
                  ))}
                </div>
              </div>

              {selectedEvent.description && (
                <div className="mt-4">
                  <p className="text-gray-600 text-sm">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                <span className="text-2xl">{selectedEvent.typeIcon}</span>
                <span className="text-sm text-gray-500 capitalize">{selectedEvent.type.replace("-", " ")}</span>
                {selectedEvent.priority && (
                  <span className={`px-2 py-1 rounded-full text-xs ${selectedEvent.priorityColor}`}>
                    {selectedEvent.priority}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button className="flex-1 bg-purple-500 text-white py-2 px-4 rounded-lg hover:bg-purple-600 transition-colors">
                Edit Event
              </button>
              <button className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
