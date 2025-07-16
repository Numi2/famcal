"use client"

import { useState, useEffect } from "react"
import { User, Calendar, CheckCircle, Clock, Star, Award } from "lucide-react"
import { FamilyCalendarController } from "@/lib/family/controller"

export default function ChildrenOverview() {
  const [children, setChildren] = useState<any[]>([])
  const [childrenSchedules, setChildrenSchedules] = useState<Record<string, any>>({})
  const [childrenChores, setChildrenChores] = useState<Record<string, any>>({})

  useEffect(() => {
    const kids = FamilyCalendarController.getChildren()
    const schedules = FamilyCalendarController.getChildrenSchedule()
    const chores = FamilyCalendarController.getChoresByChild()

    setChildren(kids)
    setChildrenSchedules(schedules)
    setChildrenChores(chores)
  }, [])

  const getChildStats = (child: any) => {
    const todayEvents = childrenSchedules[child.name]?.filter((event) => event.day === 2) || []
    const childChores = childrenChores[child.name] || []
    const completedChores = childChores.filter((chore) => chore.completed).length
    const totalPoints = childChores.reduce((sum, chore) => sum + (chore.completed ? chore.points : 0), 0)

    return {
      todayEvents: todayEvents.length,
      completedChores,
      totalChores: childChores.length,
      points: totalPoints,
    }
  }

  return (
    <div className="mb-6">
      <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
        <User className="h-5 w-5" />
        Children Overview
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {children.map((child) => {
          const stats = getChildStats(child)
          return (
            <div key={child.id} className="bg-white/10 backdrop-blur-lg rounded-xl p-4 border border-white/20">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-12 h-12 rounded-full ${child.color} flex items-center justify-center text-white font-bold text-lg shadow-lg`}
                >
                  {child.name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-white font-medium">{child.name}</h4>
                  <p className="text-white/70 text-sm">
                    Age {child.age} • {child.grade}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Calendar className="h-4 w-4 text-blue-400" />
                    <span className="text-white text-sm">Today</span>
                  </div>
                  <p className="text-white font-semibold">{stats.todayEvents} events</p>
                </div>

                <div className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="h-4 w-4 text-green-400" />
                    <span className="text-white text-sm">Chores</span>
                  </div>
                  <p className="text-white font-semibold">
                    {stats.completedChores}/{stats.totalChores}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-yellow-400" />
                  <span className="text-white text-sm">{stats.points} points</span>
                </div>
                {stats.completedChores === stats.totalChores && stats.totalChores > 0 && (
                  <div className="flex items-center gap-1 bg-green-500/20 px-2 py-1 rounded-full">
                    <Award className="h-3 w-3 text-green-400" />
                    <span className="text-green-400 text-xs">All done!</span>
                  </div>
                )}
              </div>

              {/* Next event preview */}
              {childrenSchedules[child.name] && childrenSchedules[child.name].length > 0 && (
                <div className="mt-3 pt-3 border-t border-white/20">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="h-3 w-3 text-white/70" />
                    <span className="text-white/70 text-xs">Next up:</span>
                  </div>
                  <p className="text-white text-sm truncate">
                    {childrenSchedules[child.name][0].title} at {childrenSchedules[child.name][0].startTime}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
