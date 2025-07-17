"use client"

import { useState, useEffect } from "react"
import { TrendingUp, Users, Calendar, DollarSign, CheckCircle } from "lucide-react"
import { FamilyCalendarController } from "@/lib/family/controller"

export default function FamilyStats() {
  const [budgetSummary, setBudgetSummary] = useState<any>(null)
  const [familyMembers, setFamilyMembers] = useState<any[]>([])
  const [weeklyEvents, setWeeklyEvents] = useState<any[]>([])
  const [completedChores, setCompletedChores] = useState(0)

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

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, index) => (
        <div key={index} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white/70 text-sm font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-white mt-1">{stat.value}</p>
            </div>
            <div className={`${stat.color} p-3 rounded-lg`}>
              <stat.icon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="flex items-center mt-3">
            <TrendingUp className="h-4 w-4 text-green-400 mr-1" />
            <span className="text-green-400 text-sm font-medium">{stat.change}</span>
            <span className="text-white/70 text-sm ml-1">from last week</span>
          </div>
        </div>
      ))}
    </div>
  )
}
