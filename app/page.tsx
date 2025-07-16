"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Heart, Calendar, Users, Menu, Settings, Search, Plus, Utensils, CheckSquare, Lightbulb, CalendarIcon, X, ChevronLeft, ChevronRight } from "lucide-react"
import { useLocalAuth } from "@/lib/local-storage/auth-context"
import { FamilySetup } from "@/components/onboarding/family-setup"

export default function FamilyCalendarHome() {
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showDashboard, setShowDashboard] = useState(false)
  const [showSidebar, setShowSidebar] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoaded, setIsLoaded] = useState(false)
  const [activeTab, setActiveTab] = useState("calendar")
  const [currentDate, setCurrentDate] = useState(new Date())
  
  const { user } = useLocalAuth()

  useEffect(() => {
    setIsLoaded(true)
  }, [])

  // Simplified mini calendar for sidebar
  const getMiniCalendarDays = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const days = []
    
    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(i)
    }
    
    return days
  }

  const SidebarContent = () => (
    <div className="p-4 h-full flex flex-col">
      {/* Quick Actions */}
      <button className="mb-4 flex items-center justify-center gap-2 rounded-full bg-white/10 backdrop-blur-lg border border-white/20 px-4 py-3 text-white w-full hover:bg-white/20 transition-all">
        <Plus className="h-5 w-5" />
        <span>Add Event</span>
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
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Mini Calendar */}
      {activeTab === "calendar" && (
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-medium">
              {currentDate.toLocaleDateString("en-US", { month: "long", year: "numeric" })}
            </h3>
            <div className="flex gap-1">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
                <ChevronLeft className="h-4 w-4 text-white" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="p-1 rounded-full hover:bg-white/20 transition-colors"
              >
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
            {getMiniCalendarDays().map((day, i) => (
              <div
                key={i}
                className={`text-xs rounded-full w-7 h-7 flex items-center justify-center cursor-pointer transition-all ${
                  day ? "text-white hover:bg-white/20" : ""
                } ${day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? "bg-purple-500 text-white" : ""}`}
              >
                {day}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      {/* Beautiful Background Image */}
      <Image
        src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=2070&auto=format&fit=crop"
        alt="Beautiful mountain landscape"
        fill
        className="object-cover"
        priority
      />

      {/* Navigation Header with Glass Effect */}
      <header className={`absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-4 md:px-8 py-4 md:py-6 opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
        style={{ animationDelay: "0.2s" }}
      >
        <div className="flex items-center gap-2 md:gap-4">
          <button 
            onClick={() => setShowSidebar(!showSidebar)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
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
          <button
            onClick={() => setShowAuthModal(true)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <Settings className="h-5 w-5 md:h-6 md:w-6 text-white drop-shadow-md" />
          </button>
        </div>
      </header>

      {/* Beautiful Sidebar */}
      {showSidebar && (
        <>
          <div 
            className="fixed inset-0 bg-black/50 z-20 lg:hidden"
            onClick={() => setShowSidebar(false)}
          />
          <aside className={`fixed left-0 top-0 h-full w-80 bg-white/10 backdrop-blur-lg border-r border-white/20 z-30 transform transition-transform duration-300 ${
            showSidebar ? "translate-x-0" : "-translate-x-full"
          }`}>
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Dashboard Overlay */}
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-2">Today's Schedule</h3>
                <p className="text-white/70 text-sm">No events scheduled</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-2">Family Members</h3>
                <p className="text-white/70 text-sm">Set up your family to get started</p>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                <h3 className="text-white font-semibold mb-2">Quick Stats</h3>
                <p className="text-white/70 text-sm">0 events this week</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="relative h-screen w-full pt-16 md:pt-20 flex items-center justify-center">
        <div className={`text-center p-8 max-w-2xl mx-auto opacity-0 ${isLoaded ? "animate-fade-in" : ""}`}
          style={{ animationDelay: "0.4s" }}
        >
          {/* Glass Card Effect */}
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 md:p-12 border border-white/20 shadow-2xl transform hover:scale-[1.02] transition-transform duration-300">
            <div className="mx-auto mb-6 p-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-full w-fit animate-pulse-slow">
              <Calendar className="h-12 w-12 text-white" />
            </div>
            
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 drop-shadow-lg">
              Welcome to Family Calendar
            </h1>
            
            <p className="text-lg md:text-xl text-white/90 mb-8 max-w-md mx-auto">
              Organize your family's schedule in one beautiful place
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowOnboarding(true)}
                className="px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-full hover:shadow-lg transform hover:scale-105 transition-all duration-200 font-medium"
              >
                Set Up Your Family
              </button>
              
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-6 py-3 bg-white/20 backdrop-blur-sm text-white rounded-full hover:bg-white/30 transition-all duration-200 font-medium border border-white/30"
              >
                Sign In
              </button>
            </div>

            <div className="mt-12 flex items-center justify-center gap-8">
              <div className="text-center group">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mb-2 mx-auto w-fit group-hover:bg-white/30 transition-colors">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <p className="text-white/80 text-sm">Family Members</p>
              </div>
              <div className="text-center group">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mb-2 mx-auto w-fit group-hover:bg-white/30 transition-colors">
                  <Heart className="h-6 w-6 text-pink-300" />
                </div>
                <p className="text-white/80 text-sm">Shared Events</p>
              </div>
              <div className="text-center group">
                <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 mb-2 mx-auto w-fit group-hover:bg-white/30 transition-colors">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
                <p className="text-white/80 text-sm">Smart Scheduling</p>
              </div>
            </div>
          </div>
        </div>
      </main>

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
    </div>
  )
}
