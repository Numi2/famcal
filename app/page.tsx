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
import CollapsibleResizableSidebar from "@/components/ui/collapsible-resizable-sidebar"
import CollapsedSidebarContent from "@/components/family-dashboard/collapsed-sidebar-content"
import MobileSidebarOverlay from "@/components/ui/mobile-sidebar-overlay"
import AdaptiveStats from "@/components/family-dashboard/adaptive-stats"
import ResponsiveQuickActions from "@/components/family-dashboard/responsive-quick-actions"
import ChildrenOverview from "@/components/family-dashboard/children-overview"
import AuthModal from "@/components/auth/auth-modal"
import { useAuth } from "@/lib/auth/auth-context"

export default function FamilyCalendarHome() {
  const [isLoaded, setIsLoaded] = useState(false)
  const [currentView, setCurrentView] = useState("week")
  const [currentMonth, setCurrentMonth] = useState("March 2025")
  const [currentDate, setCurrentDate] = useState("March 5")
  const [selectedEvent, setSelectedEvent] = useState(null)
  const [activeTab, setActiveTab] = useState("calendar")
  const [showDashboard, setShowDashboard] = useState(false)
  const [sidebarWidth, setSidebarWidth] = useState(320)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [showMobileSidebar, setShowMobileSidebar] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)

  // Family data
  const [familyMembers, setFamilyMembers] = useState([])
  const [familyEvents, setFamilyEvents] = useState([])
  const [familyInsights, setFamilyInsights] = useState([])
  const [todayMeals, setTodayMeals] = useState([])
  const [pendingChores, setPendingChores] = useState([])

  // Add auth hook
  const { user, loading: authLoading } = useAuth()

  useEffect(() => {
    setIsLoaded(true)

    // Check if mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }

    checkMobile()
    window.addEventListener("resize", checkMobile)

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

    return () => window.removeEventListener("resize", checkMobile)
  }, [])

  const handleEventClick = (event) => {
    setSelectedEvent(event)
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

  // Sidebar content component
  const SidebarContent = () => (
    <div className="p-3 md:p-4 flex flex-col h-full overflow-hidden">
      {/* Quick Actions */}
      <div className="mb-4 md:mb-6 flex-shrink-0">
        <button
          onClick={() => {
            if (user) {
              // User is authenticated, show add event form
              console.log("Show add event form")
            } else {
              // User not authenticated, show auth modal
              setShowAuthModal(true)
            }
          }}
          className="mb-3 md:mb-4 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 px-3 md:px-4 py-2 md:py-3 text-white w-full hover:from-pink-600 hover:to-purple-700 transition-all text-sm md:text-base"
        >
          <Plus className="h-4 w-4 md:h-5 md:w-5" />
          <span>Add</span>
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
              className={`flex-1 flex items-center justify-center gap-1 px-2 md:px-3 py-1 md:py-2 rounded-full text-xs transition-all ${
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
                <h3 className="text-white font-medium text-sm md:text-base">{currentMonth}</h3>
                <div className="flex gap-1">
                  <button className="p-1 rounded-full hover:bg-white/20">
                    <ChevronLeft className="h-3 w-3 md:h-4 md:w-4 text-white" />
                  </button>
                  <button className="p-1 rounded-full hover:bg-white/20">
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

                {miniCalendarDays.map((day, i) => (
                  <div
                    key={i}
                    className={`text-xs rounded-full w-6 h-6 md:w-7 md:h-7 flex items-center justify-center ${
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
        className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={isMobile ? toggleMobileSidebar : undefined}
            className="p-2 rounded-full hover:bg-white/20 transition-colors lg:hidden"
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
            className="px-2 md:px-4 py-1 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors flex items-center gap-1 md:gap-2 text-sm md:text-base"
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
          <Settings className="h-5 w-5 md:h-6 md:w-6 text-white drop-shadow-md" />
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
                className="p-2 hover:bg-white/20 rounded-full transition-colors"
              >
                <X className="h-5 w-5 md:h-6 md:w-6 text-white" />
              </button>
            </div>

            <AdaptiveStats sidebarWidth={sidebarWidth} />
            <ResponsiveQuickActions sidebarWidth={sidebarWidth} />
            <ChildrenOverview />
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
            style={{ animationDelay: "0.4s" }}
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

        {/* Calendar View */}
        <div
          className={`flex-1 flex flex-col opacity-0 min-w-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.6s" }}
        >
          {/* Calendar Controls */}
          <div className="flex items-center justify-between p-3 md:p-6 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-2 md:gap-4 min-w-0">
              <h2 className="text-lg md:text-2xl font-bold text-white drop-shadow-lg truncate">Family Week View</h2>
              <div className="hidden sm:flex items-center gap-2 bg-white/20 rounded-full px-2 md:px-3 py-1">
                <Clock className="h-3 w-3 md:h-4 md:w-4 text-white" />
                <span className="text-white text-xs md:text-sm">March 3-9, 2025</span>
              </div>
            </div>

            <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
              <button className="px-2 md:px-4 py-1 md:py-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 transition-colors text-xs md:text-sm">
                Today
              </button>
              <div className="flex gap-1">
                <button className="p-1 md:p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <ChevronLeft className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </button>
                <button className="p-1 md:p-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/30 transition-colors">
                  <ChevronRight className="h-4 w-4 md:h-5 md:w-5 text-white" />
                </button>
              </div>
            </div>
          </div>

          {/* Week Calendar Grid */}
          <div className="flex-1 overflow-auto bg-white/5 backdrop-blur-sm m-2 md:m-4 rounded-2xl">
            <div className="grid grid-cols-8 min-h-full min-w-[800px]">
              {/* Time column */}
              <div className="border-r border-white/20">
                <div className="h-12 md:h-16 border-b border-white/20"></div>
                {timeSlots.map((hour) => (
                  <div
                    key={hour}
                    className="h-12 md:h-16 border-b border-white/20 flex items-start justify-end pr-2 md:pr-3 pt-1"
                  >
                    <span className="text-xs text-white/70">{hour}:00</span>
                  </div>
                ))}
              </div>

              {/* Day columns */}
              {weekDays.map((day, dayIndex) => (
                <div key={day} className="border-r border-white/20 relative min-w-[100px]">
                  {/* Day header */}
                  <div className="h-12 md:h-16 border-b border-white/20 flex flex-col items-center justify-center">
                    <span className="text-xs text-white/70 font-medium">{day}</span>
                    <span
                      className={`text-sm md:text-lg font-bold ${dayIndex === 1 ? "text-purple-300" : "text-white"}`}
                    >
                      {weekDates[dayIndex]}
                    </span>
                  </div>

                  {/* Time slots */}
                  {timeSlots.map((hour) => (
                    <div key={hour} className="h-12 md:h-16 border-b border-white/10"></div>
                  ))}

                  {/* Events for this day */}
                  {familyEvents
                    .filter((event) => event.day === dayIndex + 1)
                    .map((event) => {
                      const style = calculateEventStyle(event.startTime, event.endTime)
                      return (
                        <div
                          key={event.id}
                          className={`absolute left-1 right-1 ${event.color} rounded-lg p-1 md:p-2 text-white text-xs cursor-pointer hover:shadow-lg transition-all z-10 touch-manipulation`}
                          style={style}
                          onClick={() => handleEventClick(event)}
                        >
                          <div className="font-medium truncate text-xs">{event.title}</div>
                          <div className="text-white/80 truncate text-xs">{event.formattedTime}</div>
                          <div className="flex items-center gap-1 mt-1">
                            {event.assignedMemberNames.slice(0, 2).map((name, i) => (
                              <span key={i} className="text-xs bg-white/20 rounded px-1 truncate max-w-[60px]">
                                {name}
                              </span>
                            ))}
                            {event.typeIcon && <span className="ml-1 flex-shrink-0">{event.typeIcon}</span>}
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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 md:p-6 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-800 truncate">{selectedEvent.title}</h3>
              <button
                onClick={() => setSelectedEvent(null)}
                className="p-2 hover:bg-gray-100 rounded-full flex-shrink-0 touch-manipulation"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500 flex-shrink-0" />
                <span className="text-gray-700">{selectedEvent.formattedTime}</span>
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
              <button className="flex-1 bg-purple-500 text-white py-3 px-4 rounded-lg hover:bg-purple-600 transition-colors text-sm md:text-base touch-manipulation">
                Edit Event
              </button>
              <button className="px-4 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm md:text-base touch-manipulation">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} initialMode="signup" />
    </div>
  )
}
