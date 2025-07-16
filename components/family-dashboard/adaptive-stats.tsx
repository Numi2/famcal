"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, Calendar, DollarSign, CheckCircle } from "lucide-react"
import { FamilyCalendarController } from "@/lib/family/controller"

interface AdaptiveStatsProps {
  sidebarWidth: number
}

export default function AdaptiveStats({ sidebarWidth }: AdaptiveStatsProps) {
  const [budgetSummary, setBudgetSummary] = useState<any>(null)
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [weeklyEvents, setWeeklyEvents] = useState<any[]>([])
  const [completedChores, setCompletedChores] = useState(0)
  const [screenWidth, setScreenWidth] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setScreenWidth(window.innerWidth)
    }

    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  useEffect(() => {
    // Load family statistics
    const budget = FamilyCalendarController.getFamilyBudgetSummary()
    const members = FamilyCalendarController.getFamilyMembers()
    const events = FamilyCalendarController.getAllFamilyEvents()
    const chores = FamilyCalendarController.getPendingChores()

    setBudgetSummary(budget)
    setFamilyMembers(members)
    setWeeklyEvents(events)
    setCompletedChores(chores.filter((c) => c.completed).length)
  }, [])

  if (!budgetSummary) return null

  const stats = [
    {
      title: "Family Members",
      value: familyMembers.length,
      icon: Users,
      color: "bg-blue-500",
      change: "+0%",
    },
    {
      title: "This Week's Events",
      value: weeklyEvents.length,
      icon: Calendar,
      color: "bg-green-500",
      change: "+12%",
    },
    {
      title: "Budget Remaining",
      value: `$${budgetSummary.remainingBudget}`,
      icon: DollarSign,
      color: "bg-yellow-500",
      change: "-8%",
    },
    {
      title: "Completed Chores",
      value: completedChores,
      icon: CheckCircle,
      color: "bg-purple-500",
      change: "+25%",
    },
  ]

  // Calculate available space and determine layout
  const availableWidth = screenWidth - sidebarWidth - 100 // Account for padding
  const cardMinWidth = 200
  const maxCardsPerRow = Math.floor(availableWidth / cardMinWidth)
  const cardsToShow = Math.min(stats.length, Math.max(1, maxCardsPerRow))

  // Determine if we should use compact layout
  const useCompactLayout = availableWidth < 800

  return (
    <div
      className={`grid gap-4 mb-6`}
      style={{
        gridTemplateColumns: `repeat(${cardsToShow}, minmax(0, 1fr))`,
      }}
    >
      {stats.slice(0, cardsToShow).map((stat, index) => (
        <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20 min-w-0">
          <div className={`flex items-center ${useCompactLayout ? "flex-col text-center" : "justify-between"}`}>
            <div className={useCompactLayout ? "mb-2" : ""}>
              <p className="text-white/70 text-sm font-medium truncate">{stat.title}</p>
              <p className={`font-bold text-white mt-1 ${useCompactLayout ? "text-xl" : "text-2xl"}`}>{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg flex-shrink-0`}>
              <stat.icon className={`text-white ${useCompactLayout ? "h-5 w-5" : "h-6 w-6"}`} />
            </div>
          </div>
          {!useCompactLayout && (
            <div className="flex items-center mt-3">
              <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
              <span className="text-green-400 text-sm font-medium">{stat.change}</span>
              <span className="text-white/70 text-sm ml-1 truncate">from last week</span>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
