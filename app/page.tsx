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
  CalendarIcon,
  Clock,
  MapPin,
  X,
} from "lucide-react"
import { FamilyCalendarController } from "@/lib/family/controller"
import { FamilyCalendarPresenter } from "@/lib/family/presenter"
import { CalendarController } from "@/lib/calendar/controller"
import { useTimezone } from "@/lib/hooks/use-timezone"
import { formatTimeInTimezone } from "@/lib/utils/timezone"
import CollapsibleResizableSidebar from "@/components/ui/collapsible-resizable-sidebar"
import CollapsedSidebarContent from "@/components/family-dashboard/collapsed-sidebar-content"
import MobileSidebarOverlay from "@/components/ui/mobile-sidebar-overlay"
import AdaptiveStats from "@/components/family-dashboard/adaptive-stats"
import ResponsiveQuickActions from "@/components/family-dashboard/responsive-quick-actions"
import ChildrenOverview from "@/components/family-dashboard/children-overview"
import AuthModal from "@/components/auth/auth-modal"
import InteractiveCalendar from "@/components/calendar/interactive-calendar"
import EventForm from "@/components/calendar/event-form"
import FamilyCalendarAssistant from "@/components/ai-assistant/chat-ui"
import { FamilySetup } from "@/components/onboarding/family-setup"
import { LoadingState } from "@/components/onboarding/loading-state"
import { useLocalAuth } from "@/lib/local-storage/auth-context"
import { useLocalFamilyId, useLocalCalendarEvents } from "@/lib/local-storage/hooks"
import { useFamilyData } from "@/lib/hooks/use-family-data"
import type { CalendarEvent } from "@/lib/calendar/types"
import { ManageMembers } from "@/components/family-members/manage-members"

export default function FamilyCalendarHome() {
  const { timezone } = useTimezone()
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentView, setCurrentView] = useState<"week" | "month" | "day">("week")
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEvent, setSelectedEvent] = useState<any>(null)
  const [activeTab, setActiveTab] = useState("calendar")
  const [showDashboard, setShowDashboard] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showEventForm, setShowEventForm] = useState(false)
  const [selectedEventForEdit, setSelectedEventForEdit] = useState<CalendarEvent | null>(null)
  const [selectedDateForEvent, setSelectedDateForEvent] = useState<Date | null>(null)
  const [selectedTimeForEvent, setSelectedTimeForEvent] = useState<string | null>(null)
  const [showFamilySetupBanner, setShowFamilySetupBanner] = useState(true)

  // Family data
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [familyEvents, setFamilyEvents] = useState<any[]>([])
  const [familyInsights, setFamilyInsights] = useState<any[]>([])
  const [todayMeals, setTodayMeals] = useState<any[]>([])
  const [pendingChores, setPendingChores] = useState<any[]>([])

  // Add auth hook
  const { user, isLoading: authLoading } = useLocalAuth()
  const { familyId, isLoading: familyLoading } = useLocalFamilyId()
  const {
    familyMembers: userFamilyMembers,
    familyEvents: userFamilyEvents,
    mealPlans: userMealPlans,
    choreAssignments: userChoreAssignments,
    loading: familyDataLoading,
    error: familyDataError,
  } = useFamilyData()
  const {
    events,
    createEvent,
    updateEvent,
    deleteEvent,
    isLoading: eventsLoading
  } = useLocalCalendarEvents(familyId)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    setIsLoaded(true)

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  // Don't force onboarding - let users browse freely
  useEffect(() => {
    setShowOnboarding(false) // Always start with onboarding closed
  }, [])

  // Load personalized data when available, or sample data for guests
  useEffect(() => {
    if (user && familyId && !familyDataLoading) {
      // Use real user data if available, otherwise fall back to sample data
      if (userFamilyMembers.length > 0) {
        const members = FamilyCalendarPresenter.formatFamilyMembers(userFamilyMembers)
        const events = FamilyCalendarPresenter.getFormattedFamilyEventsByDay(2) // Monday
        const insights = FamilyCalendarPresenter.getFormattedFamilyInsights()
        const meals = FamilyCalendarPresenter.formatMealPlans(userMealPlans)
        const chores = FamilyCalendarPresenter.formatChoreAssignments(userChoreAssignments)

        setFamilyMembers(members)
        setFamilyEvents(events)
        setFamilyInsights(insights)
        setTodayMeals(meals)
        setPendingChores(chores)
      } else {
        // Fall back to sample data for demonstration
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
      }
    } else if (!user || (!familyId && !familyLoading)) {
      // Load sample data for guest users or users without families
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
    }
  }, [
    user,
    familyId,
    familyLoading,
    familyDataLoading,
    userFamilyMembers,
    userFamilyEvents,
    userMealPlans,
    userChoreAssignments,
  ])

  const handleEventClick = (event: any) => {
    // Normalize the event data to handle both calendar events and family events
    const normalizedEvent = {
      ...event,
      // Ensure we have the required properties
      title: event.title || event.name || "Untitled Event",
      startTime: event.startTime || "00:00",
      endTime: event.endTime || "01:00",
      description: event.description || "",
      location: event.location || "",
      attendees: event.attendees || event.assignedMemberNames || [],
      organizer: event.organizer || "",
      color: event.color || "bg-blue-500",
      type: event.type || "event",
      typeIcon: event.typeIcon || "📅",
      priority: event.priority || null,
      priorityColor: event.priorityColor || "bg-gray-100 text-gray-800",
      formattedTime: event.formattedTime || `${event.startTime || "00:00"} - ${event.endTime || "01:00"}`,
      assignedMemberNames: event.assignedMemberNames || event.attendees || [],
    }
    setSelectedEvent(normalizedEvent)
  }

  // Interactive Calendar Handlers
  const handleDateSelect = (date: Date) => {
    console.log("Date selected:", date)
  }

  const handleAddEvent = (date: Date, timeSlot?: string) => {
    if (user) {
      setSelectedDateForEvent(date)
      setSelectedTimeForEvent(timeSlot || null)
      setSelectedEventForEdit(null)
      setShowEventForm(true)
    } else {
      setShowAuthModal(true)
    }
  }

  const handleEventFormSubmit = (eventData: Omit<CalendarEvent, "id">) => {
    if (selectedEventForEdit) {
      // Update existing event
      const result = CalendarController.updateEvent(selectedEventForEdit.id, eventData, timezone)
      if (result.success) {
        console.log("Event updated successfully")
        // Refresh events with timezone consideration
        const events = CalendarController.getEventsForDisplay(timezone)
        setFamilyEvents(events)
      } else {
        console.error("Failed to update event:", result.message)
      }
    } else {
      // Create new event
      const result = CalendarController.createEvent(eventData, timezone)
      if (result.success) {
        console.log("Event created successfully")
        // Refresh events with timezone consideration
        const events = CalendarController.getEventsForDisplay(timezone)
        setFamilyEvents(events)
      } else {
        console.error("Failed to create event:", result.message)
      }
    }
  }

  const handleEditEvent = (event: CalendarEvent) => {
    if (user) {
      setSelectedEventForEdit(event)
      setSelectedDateForEvent(null)
      setSelectedTimeForEvent(null)
      setShowEventForm(true)
    } else {
      setShowAuthModal(true)
    }
  }

  const handleDeleteEvent = (event: CalendarEvent) => {
    if (user) {
      const result = CalendarController.deleteEvent(event.id)
      if (result.success) {
        console.log("Event deleted successfully")
        // Refresh events with timezone consideration
        const events = CalendarController.getEventsForDisplay(timezone)
        setFamilyEvents(events)
        setSelectedEvent(null)
      } else {
        console.error("Failed to delete event:", result.message)
      }
    } else {
      setShowAuthModal(true)
    }
  }

  const handleSidebarWidthChange = (width: number) => {
    setSidebarWidth(width)
  }

  const handleSidebarCollapseChange = (collapsed: boolean) => {
    setSidebarCollapsed(collapsed)
  }

  const toggleMobileSidebar = () => {
    setShowMobileSidebar(!showMobileSidebar)
  }

  // Calendar navigation handlers
  const handleSidebarPreviousMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() - 1)
    setCurrentDate(newDate)
  }

  const handleSidebarNextMonth = () => {
    const newDate = new Date(currentDate)
    newDate.setMonth(currentDate.getMonth() + 1)
    setCurrentDate(newDate)
  }

  const handleMainCalendarNavigation = (direction: "previous" | "next" | "today") => {
    const newDate = new Date(currentDate)

    if (direction === "today") {
      setCurrentDate(new Date())
      setSelectedDate(new Date())
    } else if (direction === "previous") {
      if (currentView === "week") {
        newDate.setDate(currentDate.getDate() - 7)
      } else if (currentView === "month") {
        newDate.setMonth(currentDate.getMonth() - 1)
      } else {
        newDate.setDate(currentDate.getDate() - 1)
      }
      setCurrentDate(newDate)
    } else if (direction === "next") {
      if (currentView === "week") {
        newDate.setDate(currentDate.getDate() + 7)
      } else if (currentView === "month") {
        newDate.setMonth(currentDate.getMonth() + 1)
      } else {
        newDate.setDate(currentDate.getDate() + 1)
      }
      setCurrentDate(newDate)
    }
  }

  // Mini calendar helpers
  const getMiniCalendarDays = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const startDate = new Date(firstDay)
    startDate.setDate(firstDay.getDate() - firstDay.getDay())

    const days = []
    const current = new Date(startDate)

    while (current <= lastDay || days.length < 42) {
      days.push(new Date(current))
      current.setDate(current.getDate() + 1)
    }

    return days
  }

  const miniCalendarDays = getMiniCalendarDays(currentDate)

  const children = familyMembers.filter((member) => member.role === "child")
  const parents = familyMembers.filter((member) => member.role === "parent")

  // Sidebar content component
  const SidebarContent = () => (
    <div className="p-3 md:p-4 flex flex-col h-full overflow-hidden">
      {/* Quick Actions */}
      <div className="mb-4 md:mb-6 flex-shrink-0">
        <button
          onClick={() => {
            if (user) {
              switch (activeTab) {
                case "calendar":
                  setSelectedEventForEdit(null)
                  setSelectedDateForEvent(null)
                  setSelectedTimeForEvent(null)
                  setShowEventForm(true)
                  break
                case "meals":
                  // TODO: Open meal planning form
                  console.log("Add meal functionality")
                  break
                case "chores":
                  // TODO: Open chore assignment form
                  console.log("Add chore functionality")
                  break
                case "insights":
                  // TODO: Open insight creation form
                  console.log("Add insight functionality")
                  break
                default:
                  setSelectedEventForEdit(null)
                  setSelectedDateForEvent(null)
                  setSelectedTimeForEvent(null)
                  setShowEventForm(true)
              }
            } else {
              setShowAuthModal(true)
            }
          }}
          className="mb-3 md:mb-4 flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 px-3 md:px-4 py-2 md:py-3 text-white w-full hover:bg-white/20 transition-all text-sm md:text-base touch-manipulation active:scale-95 shadow-lg"
        >
          <Plus className="h-4 w-4 md:h-5 md:w-5" />
          <span>
            {user
              ? activeTab === "calendar"
                ? "+ Add Event"
                : activeTab === "meals"
                  ? "+ Add Meal"
                  : activeTab === "chores"
                    ? "+ Add Chore"
                    : activeTab === "insights"
                      ? "+ Add Insight"
                      : "+ Add"
              : "Sign In to Add"}
          </span>
        </button>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-3 md:mb-4 bg-white/20 rounded-full p-1">
          {[
            { id: "calendar", icon: CalendarIcon, label: "Calendar" },
            { id: "meals", icon: Utensils, label: "Meals" },
            { id: "chores", icon: CheckSquare, label: "Chores" },
            { id: "insights", icon: Lightbulb, label: "Insights" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 flex items-center justify-center gap-1 px-2 md:px-3 py-1 md:py-2 rounded-full text-xs transition-all touch-manipulation active:scale-95 ${
                activeTab === tab.id ? "bg-white text-purple-600 shadow-sm" : "text-white hover:bg-white/10"
              }`}
            >
              <tab.icon className="h-3 w-3" />
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === "calendar" && (
          <>
            {/* Mini Calendar */}
            <div className="mb-4 md:mb-6">
              <div className="flex items-center justify-between mb-3 md:mb-4">
                <h3 className="text-white font-medium text-sm md:text-base">
                  {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
                </h3>
                <div className="flex gap-1">
                  <button
                    onClick={handleSidebarPreviousMonth}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors touch-manipulation"
                  >
                    <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </button>
                  <button
                    onClick={handleSidebarNextMonth}
                    className="p-1 rounded-full hover:bg-white/20 transition-colors touch-manipulation"
                  >
                    <ChevronRight className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-7 gap-1 text-center">
                {["S", "M", "T", "W", "T", "F", "S"].map((day, i) => (
                  <div key={i} className="text-xs text-white/70 font-medium py-1">
                    {day}
                  </div>
                ))}

                {miniCalendarDays.map((day, i) => {
                  const isCurrentMonth = day.getMonth() === currentDate.getMonth()
                  const isToday = day.toDateString() === new Date().toDateString()
                  const isSelected = selectedDate && day.toDateString() === selectedDate.toDateString()

                  return (
                    <div
                      key={i}
                      onClick={() => {
                        setSelectedDate(day)
                        if (currentView === "month") {
                          setCurrentDate(day)
                        }
                      }}
                      className={`text-xs rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center cursor-pointer transition-all ${
                        isToday
                          ? "bg-purple-500 text-white"
                          : isSelected
                            ? "bg-white/20 text-white"
                            : isCurrentMonth
                              ? "text-white hover:bg-white/20"
                              : "text-white/50"
                      }`}
                    >
                      {day.getDate()}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Family Members */}
            <div>
              <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm md:text-base">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                Family Members
              </h3>
              <div className="space-y-2 md:space-y-3">
                {familyMembers.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 md:gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors"
                  >
                    <div
                      className={`w-6 h-6 md:w-8 md:h-8 rounded-full ${member.color} flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-sm flex-shrink-0`}
                    >
                      {member.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-white text-xs md:text-sm font-medium truncate">{member.displayName}</div>
                      <div className="text-white/70 text-xs flex items-center gap-1">
                        {member.roleIcon}
                        {member.role === "child" && member.grade && <span className="truncate">{member.grade}</span>}
                      </div>
                    </div>
                    <div className="text-xs text-white/60 flex-shrink-0">
                      {FamilyCalendarController.getFamilyEventsByMember(member.id).length}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {activeTab === "meals" && (
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm md:text-base">
              <Utensils className="h-3 w-3 md:h-4 md:w-4" />
              Today's Meals
            </h3>
            {todayMeals.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {todayMeals.map((meal) => (
                  <div key={meal.id} className="bg-white/10 rounded-lg p-2 md:p-3">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                      <span className="text-base md:text-lg">{meal.mealTypeIcon}</span>
                      <span className="text-white font-medium capitalize text-xs md:text-sm">{meal.mealType}</span>
                      <span className="text-xs">{meal.kidFriendlyIcon}</span>
                    </div>
                    <div className="text-white text-xs md:text-sm mb-1 line-clamp-2">{meal.meal}</div>
                    <div className="text-white/70 text-xs">{meal.formattedPrepTime}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/70 text-xs md:text-sm text-center py-4">
                No meals planned for today
                <br />
                <button className="text-purple-300 hover:text-purple-200 mt-2">Get meal suggestions →</button>
              </div>
            )}
          </div>
        )}

        {activeTab === "chores" && (
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm md:text-base">
              <CheckSquare className="h-3 w-3 md:h-4 md:w-4" />
              Pending Chores
            </h3>
            {pendingChores.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {pendingChores.map((chore) => (
                  <div key={chore.id} className="bg-white/10 rounded-lg p-2 md:p-3">
                    <div className="flex items-center justify-between mb-1 md:mb-2">
                      <span className="text-white text-xs md:text-sm font-medium line-clamp-1">{chore.chore}</span>
                      <span className="text-xs flex-shrink-0">{chore.statusIcon}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-white/70 text-xs truncate">{chore.assignedMemberName}</span>
                      <span className="text-purple-300 text-xs flex-shrink-0">{chore.pointsDisplay}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/70 text-xs md:text-sm text-center py-4">All chores completed! 🎉</div>
            )}
          </div>
        )}

        {activeTab === "insights" && (
          <div>
            <h3 className="text-white font-medium mb-3 flex items-center gap-2 text-sm md:text-base">
              <Lightbulb className="h-3 w-3 md:h-4 md:w-4" />
              Family Insights
            </h3>
            {familyInsights.length > 0 ? (
              <div className="space-y-2 md:space-y-3">
                {familyInsights.slice(0, 3).map((insight) => (
                  <div key={insight.id} className="bg-white/10 rounded-lg p-2 md:p-3">
                    <div className="flex items-center gap-2 mb-1 md:mb-2">
                      <span className="text-base md:text-lg flex-shrink-0">{insight.typeIcon}</span>
                      <span className="text-white text-xs md:text-sm font-medium line-clamp-2">{insight.title}</span>
                    </div>
                    <div className="text-white/80 text-xs mb-1 md:mb-2 line-clamp-3">{insight.message}</div>
                    {insight.actionable && (
                      <button className="text-purple-300 hover:text-purple-200 text-xs">{insight.action} →</button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-white/70 text-xs md:text-sm text-center py-4">No insights available</div>
            )}
          </div>
        )}
      </div>
    </div>
  )

  // Show loading state while checking authentication and family status (only for authenticated users)
  if (authLoading || (user && familyLoading)) {
    return <LoadingState />
  }

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

      {/* Guest Mode Banner */}
      {!user && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10 bg-white/90 backdrop-blur-sm rounded-lg px-4 py-2 shadow-md">
          <p className="text-sm text-gray-700 text-center">
            <span className="font-medium">Browsing as Guest</span> -
            <button
              onClick={() => setShowAuthModal(true)}
              className="text-purple-600 hover:text-purple-800 ml-1 underline"
            >
              Sign in
            </button>{" "}
            for full features
          </p>
        </div>
      )}

      {/* Optional Family Setup Banner */}
      {user && !familyId && !familyLoading && showFamilySetupBanner && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 z-10 bg-white/10 backdrop-blur-lg rounded-lg px-4 py-3 shadow-md max-w-md border border-white/20">
          <p className="text-sm text-white text-center mb-2">
            <span className="font-medium">Set up your family calendar</span> for personalized features
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => setShowOnboarding(true)}
              className="rounded-lg border border-white/20 bg-white/10 backdrop-blur-lg shadow-lg"
            >
              Set Up Family
            </button>
            <button
              onClick={() => setShowFamilySetupBanner(false)}
              className="text-white/80 hover:text-white px-3 py-1 text-xs transition-colors"
            >
              Maybe Later
            </button>
          </div>
        </div>
      )}

      {/* Navigation */}
      <header
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={isMobile ? toggleMobileSidebar : undefined}
            className="p-2 rounded-full hover:bg-white/20 transition-colors lg:hidden touch-manipulation active:scale-95"
          >
            <Menu className="h-5 w-5 md:h-6 md:w-6 text-white" />
          </button>
          <span className="text-lg md:text-2xl font-semibold text-white drop-shadow-lg">Family Calendar</span>
          <div className="hidden sm:flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-full px-2 md:px-3 py-1">
            <Heart className="h-3 w-3 md:h-4 md:w-4 text-pink-300" />
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setShowDashboard(!showDashboard)}
            className="px-2 md:px-4 py-1 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base touch-manipulation active:scale-95"
          >
            <div className="h-2 w-2 md:h-3 md:w-3" />
            <span className="hidden sm:inline">Dashboard</span>
          </button>
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/70" />
            <input
              type="text"
              placeholder="Search..."
              className="rounded-full bg-white/10 backdrop-blur-sm pl-10 pr-4 py-2 text-white placeholder:text-white/70 border border-white/20 focus:outline-none focus:ring-2 focus:ring-white/30 w-32 lg:w-auto"
            />
          </div>
          {user ? (
            <button
              onClick={() => setShowAuthModal(true)}
              className="p-2 rounded-full hover:bg-white/20 transition-colors touch-manipulation active:scale-95"
              title="Settings"
            >
              <Settings className="h-5 w-5 md:h-6 md:w-6 text-white drop-shadow-md" />
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-3 py-1 md:px-4 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors text-sm md:text-base touch-manipulation active:scale-95"
              >
                Sign In
              </button>
              <div className="hidden sm:flex items-center gap-1 bg-white/10 backdrop-blur-sm rounded-full px-2 py-1">
                <span className="text-xs text-white/70">Guest Mode</span>
              </div>
            </div>
          )}
          <div className="flex items-center gap-1">
            {parents.slice(0, 2).map((parent, i) => (
              <div
                key={parent.id}
                className={`h-6 w-6 md:h-8 md:w-8 rounded-full ${parent.color} flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-md ${i > 0 ? "-ml-1 md:-ml-2" : ""}`}
              >
                {parent.name.charAt(0)}
              </div>
            ))}
          </div>
        </div>
      </header>

      {/* Mobile Sidebar Overlay */}
      <MobileSidebarOverlay isOpen={showMobileSidebar} onClose={() => setShowMobileSidebar(false)}>
        <SidebarContent />
      </MobileSidebarOverlay>

      {/* Family Dashboard Overlay */}
      {showDashboard && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 flex items-start justify-center pt-16 md:pt-20 overflow-y-auto p-4">
          <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-4 md:p-6 max-w-7xl w-full border border-white/20">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <h2 className="text-xl md:text-2xl font-bold text-white">Family Dashboard</h2>
              <button
                onClick={() => setShowDashboard(false)}
                className="p-2 hover:bg-white/20 rounded-full transition-colors touch-manipulation active:scale-95"
              >
                <X className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </button>
            </div>

            <AdaptiveStats sidebarWidth={sidebarWidth} />
            <ResponsiveQuickActions sidebarWidth={sidebarWidth} />
            <ChildrenOverview />
            {familyId && (
              <div className="mt-6">
                <ManageMembers familyId={familyId} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="relative h-screen w-full pt-16 md:pt-20 flex">
        {/* Desktop Collapsible Resizable Sidebar */}
        <div className="hidden lg:block">
          <CollapsibleResizableSidebar
            defaultWidth={320}
            minWidth={280}
            maxWidth={500}
            collapsedWidth={60}
            className={`h-full bg-white/10 backdrop-blur-lg shadow-xl border-r border-white/20 rounded-tr-3xl opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
            onWidthChange={handleSidebarWidthChange}
            onCollapseChange={handleSidebarCollapseChange}
          >
            {sidebarCollapsed ? (
              <CollapsedSidebarContent activeTab={activeTab} onTabChange={setActiveTab} />
            ) : (
              <SidebarContent />
            )}
          </CollapsibleResizableSidebar>
        </div>

        {/* Interactive Calendar */}
        <div
          className={`flex-1 flex flex-col opacity-0 min-w-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          <InteractiveCalendar
            currentView={currentView}
            currentDate={currentDate}
            selectedDate={selectedDate}
            onViewChange={setCurrentView}
            onEventClick={handleEventClick}
            onDateSelect={(date) => {
              setSelectedDate(date)
              handleDateSelect(date)
            }}
            onAddEvent={handleAddEvent}
            onNavigation={handleMainCalendarNavigation}
          />
        </div>
      </main>

      {/* Event Form Modal */}
      <EventForm
        isOpen={showEventForm}
        onClose={() => {
          setShowEventForm(false)
          setSelectedEventForEdit(null)
          setSelectedDateForEvent(null)
          setSelectedTimeForEvent(null)
        }}
        onSubmit={handleEventFormSubmit}
        event={selectedEventForEdit}
        selectedDate={selectedDateForEvent || undefined}
        selectedTime={selectedTimeForEvent || undefined}
      />

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 truncate">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0 touch-manipulation active:scale-95"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">
                  {selectedEvent.startDateTime && selectedEvent.endDateTime
                    ? `${formatTimeInTimezone(selectedEvent.startDateTime, timezone)} - ${formatTimeInTimezone(selectedEvent.endDateTime, timezone)}`
                    : selectedEvent.formattedTime || `${selectedEvent.startTime} - ${selectedEvent.endTime}`}
                </span>
                {selectedEvent.timezone && selectedEvent.timezone !== timezone && (
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{selectedEvent.timezone}</span>
                )}
              </div>

              {selectedEvent.location && (
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-gray-500 flex-shrink-0" />
                  <span className="text-gray-700 truncate">{selectedEvent.location}</span>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <div className="flex flex-wrap gap-1">
                  {selectedEvent.assignedMemberNames && selectedEvent.assignedMemberNames.length > 0 ? (
                    selectedEvent.assignedMemberNames.map((name: string, i: number) => (
                      <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {name}
                      </span>
                    ))
                  ) : selectedEvent.attendees && selectedEvent.attendees.length > 0 ? (
                    selectedEvent.attendees.map((attendee: string, i: number) => (
                      <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs">
                        {attendee}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500 text-xs">No attendees</span>
                  )}
                </div>
              </div>

              {selectedEvent.description && (
                <div className="mt-4">
                  <p className="text-gray-600 text-sm">{selectedEvent.description}</p>
                </div>
              )}

              <div className="flex items-center gap-2 mt-4">
                {selectedEvent.typeIcon && <span className="text-2xl">{selectedEvent.typeIcon}</span>}
                {selectedEvent.type && (
                  <span className="text-sm text-gray-500 capitalize">{selectedEvent.type.replace("-", " ")}</span>
                )}
                {selectedEvent.priority && selectedEvent.priorityColor && (
                  <span className={`px-2 py-1 rounded-full text-xs ${selectedEvent.priorityColor}`}>
                    {selectedEvent.priority}
                  </span>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  handleEditEvent(selectedEvent)
                  setSelectedEvent(null)
                }}
                className="flex-1 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors text-sm md:text-base touch-manipulation active:scale-95"
              >
                {user ? "Edit Event" : "Sign In to Edit"}
              </button>
              <button
                onClick={() => {
                  handleDeleteEvent(selectedEvent)
                }}
                className="px-4 py-3 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm md:text-base touch-manipulation active:scale-95"
              >
                {user ? "Delete" : "Sign In to Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="signin" />

      {/* Family Setup Modal */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowOnboarding(false)}
              className="absolute top-4 right-4 z-10 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <FamilySetup
              onComplete={() => {
                setShowOnboarding(false)
                // Refresh the page to load the new family data
                window.location.reload()
              }}
            />
          </div>
        </div>
      )}
      {/* AI Assistant */}
      {user && familyId && !familyLoading && <FamilyCalendarAssistant familyId={familyId} />}
    </div>
  )
}
