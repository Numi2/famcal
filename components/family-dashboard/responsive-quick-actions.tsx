"use client"

import { useState, useEffect } from "react"
import { Calendar, Utensils, Users, MapPin, Clock, Heart, Lightbulb } from "lucide-react"

interface ResponsiveQuickActionsProps {
  sidebarWidth: number
}

export default function ResponsiveQuickActions({ sidebarWidth }: ResponsiveQuickActionsProps) {
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  const quickActions = [
    {
      title: "Schedule Playdate",
      description: "Arrange fun time with friends",
      icon: Users,
      color: "from-pink-500 to-rose-500",
      action: () => console.log("Schedule playdate"),
    },
    {
      title: "Plan Family Meal",
      description: "Kid-friendly recipes & shopping",
      icon: Utensils,
      color: "from-green-500 to-emerald-500",
      action: () => console.log("Plan meal"),
    },
    {
      title: "Find Activities",
      description: "Age-appropriate fun suggestions",
      icon: Lightbulb,
      color: "from-yellow-500 to-orange-500",
      action: () => console.log("Find activities"),
    },
    {
      title: "Medical Reminder",
      description: "Track appointments & vaccines",
      icon: Heart,
      color: "from-red-500 to-pink-500",
      action: () => console.log("Medical reminder"),
    },
    {
      title: "School Events",
      description: "Sync with school calendar",
      icon: Calendar,
      color: "from-blue-500 to-indigo-500",
      action: () => console.log("School events"),
    },
    {
      title: "Carpool Setup",
      description: "Coordinate transportation",
      icon: MapPin,
      color: "from-purple-500 to-violet-500",
      action: () => console.log("Carpool setup"),
    },
  ]

  // Calculate responsive grid
  const availableWidth = screenWidth - sidebarWidth - 100
  const cardMinWidth = 180
  const maxCardsPerRow = Math.floor(availableWidth / cardMinWidth)
  const gridCols = Math.min(Math.max(1, maxCardsPerRow), 3) // Max 3 columns

  // Determine if we should use compact layout
  const useCompactLayout = availableWidth < 600

  return (
    <div className="mb-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <Clock className="h-5 w-5" />
        Family Quick Actions
      </h3>
      <div
        className="grid gap-3"
        style={{
          gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`,
        }}
      >
        {quickActions.slice(0, gridCols * 2).map((action, index) => (
          <button
            key={index}
            onClick={action.action}
            className={`bg-gradient-to-r ${action.color} ${useCompactLayout ? "p-3" : "p-4"} rounded-xl text-white hover:scale-105 transition-all duration-200 shadow-lg min-w-0`}
          >
            <action.icon className={`${useCompactLayout ? "h-5 w-5 mb-1" : "h-6 w-6 mb-2"}`} />
            <div className="text-left">
              <div className={`font-medium ${useCompactLayout ? "text-xs" : "text-sm"} truncate`}>{action.title}</div>
              {!useCompactLayout && <div className="text-xs opacity-90 mt-1 line-clamp-2">{action.description}</div>}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
