"use client"

import { useState, useEffect } from "react"
import { Calendar, Utensils, CheckSquare, Lightbulb, Bell } from "lucide-react"
import { FamilyCalendarController } from "@/lib/family/controller"

interface CollapsedSidebarContentProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export default function CollapsedSidebarContent({ activeTab, onTabChange }: CollapsedSidebarContentProps) {
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [pendingChores, setPendingChores] = useState(0)
  const [todayEvents, setTodayEvents] = useState(0)
  const [insights, setInsights] = useState(0)

  useEffect(() => {
    const members = FamilyCalendarController.getFamilyMembers()
    const chores = FamilyCalendarController.getPendingChores()
    const events = FamilyCalendarController.getFamilyEventsByDay(2) // Monday
    const familyInsights = FamilyCalendarController.generateFamilyInsights()

    setFamilyMembers(members)
    setPendingChores(chores.filter((c) => !c.completed).length)
    setTodayEvents(events.length)
    setInsights(familyInsights.length)
  }, [])

  const tabs = [
    {
      id: "calendar",
      icon: Calendar,
      color: "bg-blue-500",
      count: todayEvents,
      label: "Calendar",
    },
    {
      id: "meals",
      icon: Utensils,
      color: "bg-green-500",
      count: 0,
      label: "Meals",
    },
    {
      id: "chores",
      icon: CheckSquare,
      color: "bg-purple-500",
      count: pendingChores,
      label: "Chores",
    },
    {
      id: "insights",
      icon: Lightbulb,
      color: "bg-yellow-500",
      count: insights,
      label: "Insights",
    },
  ]

  const children = familyMembers.filter((member) => member.role === "child")

  return (
    <div className="h-full flex flex-col items-center py-4 space-y-3 overflow-y-auto">
      {/* Family Member Avatars */}
      <div className="flex flex-col space-y-2">
        {familyMembers.slice(0, 4).map((member) => (
          <div
            key={member.id}
            className={`w-10 h-10 rounded-full ${member.color} flex items-center justify-center text-white text-sm font-bold shadow-lg hover:scale-110 transition-transform cursor-pointer group relative`}
            title={member.name}
          >
            {member.name.charAt(0)}

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {member.name}
              {member.role === "child" && member.age && ` (${member.age})`}
            </div>
          </div>
        ))}
      </div>

      {/* Divider */}
      <div className="w-8 h-px bg-white/20"></div>

      {/* Tab Icons */}
      <div className="flex flex-col space-y-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`relative p-3 rounded-xl transition-all duration-200 hover:scale-110 group ${
              activeTab === tab.id ? `${tab.color} shadow-lg` : "bg-white/10 hover:bg-white/20"
            }`}
            title={tab.label}
          >
            <tab.icon className={`h-5 w-5 ${activeTab === tab.id ? "text-white" : "text-white/70"}`} />

            {/* Count Badge */}
            {tab.count > 0 && (
              <div className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center">
                <span className="text-white text-xs font-bold">{tab.count > 9 ? "9+" : tab.count}</span>
              </div>
            )}

            {/* Tooltip */}
            <div className="absolute left-full ml-2 px-2 py-1 bg-black/80 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
              {tab.label}
              {tab.count > 0 && ` (${tab.count})`}
            </div>
          </button>
        ))}
      </div>

      {/* Quick Stats */}
      <div className="flex flex-col space-y-2 mt-4">
        {/* Today's Events Indicator */}
        <div className="w-10 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-400 transition-all duration-500"
            style={{ width: `${Math.min((todayEvents / 10) * 100, 100)}%` }}
          />
        </div>

        {/* Chores Progress */}
        <div className="w-10 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-purple-400 transition-all duration-500"
            style={{ width: `${pendingChores > 0 ? Math.min((pendingChores / 5) * 100, 100) : 0}%` }}
          />
        </div>

        {/* Family Activity Level */}
        <div className="w-10 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-green-400 transition-all duration-500"
            style={{ width: `${Math.min(((todayEvents + pendingChores) / 15) * 100, 100)}%` }}
          />
        </div>
      </div>

      {/* Notification Bell */}
      {insights > 0 && (
        <div className="mt-auto">
          <button
            onClick={() => onTabChange("insights")}
            className="relative p-3 rounded-full bg-red-500/20 hover:bg-red-500/30 transition-all duration-200 animate-pulse"
            title={`${insights} family insights`}
          >
            <Bell className="h-5 w-5 text-red-400" />
            <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">{insights}</span>
            </div>
          </button>
        </div>
      )}
    </div>
  )
}
