/**
 * Family Calendar Controller - Handles business logic and validation for family operations
 */
import { FamilyCalendarModel } from "./model"

export const FamilyCalendarController = {
  // Family Members Management
  getFamilyMembers() {
    return FamilyCalendarModel.getFamilyMembers()
  },

  getChildren() {
    return FamilyCalendarModel.getChildren()
  },

  getParents() {
    return FamilyCalendarModel.getParents()
  },

  getFamilyMember(id: string) {
    const member = FamilyCalendarModel.getFamilyMember(id)
    if (!member) {
      throw new Error("Family member not found")
    }
    return member
  },

  // Family Events Management
  getAllFamilyEvents() {
    return FamilyCalendarModel.getAllFamilyEvents()
  },

  getFamilyEventsByDay(day: number) {
    if (day < 1 || day > 7) {
      throw new Error("Day must be between 1 and 7")
    }
    return FamilyCalendarModel.getFamilyEventsByDay(day)
  },

  getFamilyEventsByMember(memberId: string) {
    // Validate member exists
    this.getFamilyMember(memberId)
    return FamilyCalendarModel.getFamilyEventsByMember(memberId)
  },

  getChildrenSchedule(day?: number) {
    const children = this.getChildren()
    const schedule = {}

    children.forEach((child) => {
      if (day) {
        schedule[child.name] = FamilyCalendarModel.getFamilyEventsByMember(child.id).filter(
          (event) => event.day === day,
        )
      } else {
        schedule[child.name] = FamilyCalendarModel.getFamilyEventsByMember(child.id)
      }
    })

    return schedule
  },

  getUpcomingMedicalAppointments() {
    return FamilyCalendarModel.getUpcomingMedicalAppointments()
  },

  // Meal Planning
  getMealPlansByDay(day: number) {
    if (day < 1 || day > 7) {
      throw new Error("Day must be between 1 and 7")
    }
    return FamilyCalendarModel.getMealPlansByDay(day)
  },

  getWeeklyMealPlan() {
    return FamilyCalendarModel.getWeeklyMealPlan()
  },

  suggestMealsForFamily(preferences?: {
    kidFriendly?: boolean
    allergies?: string[]
    difficulty?: "easy" | "medium" | "hard"
    prepTime?: number
  }) {
    const allMeals = FamilyCalendarModel.getWeeklyMealPlan()
    let suggestions = [...allMeals]

    if (preferences) {
      if (preferences.kidFriendly) {
        suggestions = suggestions.filter((meal) => meal.kidFriendly)
      }

      if (preferences.allergies && preferences.allergies.length > 0) {
        suggestions = suggestions.filter(
          (meal) => !preferences.allergies!.some((allergy) => meal.allergensConsidered.includes(allergy)),
        )
      }

      if (preferences.difficulty) {
        suggestions = suggestions.filter((meal) => meal.difficulty === preferences.difficulty)
      }

      if (preferences.prepTime) {
        suggestions = suggestions.filter((meal) => meal.prepTime <= preferences.prepTime!)
      }
    }

    return suggestions
  },

  // Chore Management
  getChoresByMember(memberId: string) {
    this.getFamilyMember(memberId) // Validate member exists
    return FamilyCalendarModel.getChoresByMember(memberId)
  },

  getPendingChores() {
    return FamilyCalendarModel.getPendingChores()
  },

  getChoresByChild() {
    const children = this.getChildren()
    const choresByChild = {}

    children.forEach((child) => {
      choresByChild[child.name] = FamilyCalendarModel.getChoresByMember(child.id)
    })

    return choresByChild
  },

  // Activity Suggestions
  getActivitySuggestions(filters?: {
    childAge?: number
    location?: "indoor" | "outdoor" | "either"
    duration?: number
    cost?: "free" | "low" | "medium" | "high"
    weather?: string
  }) {
    const activityFilters = {}

    if (filters) {
      if (filters.childAge) {
        activityFilters.ageRange = { min: filters.childAge - 2, max: filters.childAge + 2 }
      }

      if (filters.location) {
        activityFilters.location = filters.location
      }

      if (filters.duration) {
        activityFilters.duration = filters.duration
      }

      if (filters.cost) {
        activityFilters.cost = filters.cost
      }
    }

    return FamilyCalendarModel.getActivitySuggestions(activityFilters)
  },

  suggestActivitiesForWeather(weather: string, childrenAges: number[]) {
    const location = weather === "rainy" || weather === "cold" ? "indoor" : "outdoor"
    const minAge = Math.min(...childrenAges)
    const maxAge = Math.max(...childrenAges)

    return FamilyCalendarModel.getActivitySuggestions({
      location,
      ageRange: { min: minAge, max: maxAge },
    })
  },

  // Family Insights and AI Suggestions
  generateFamilyInsights() {
    return FamilyCalendarModel.generateFamilyInsights()
  },

  getFamilyBusyTimeAnalysis(day: number) {
    if (day < 1 || day > 7) {
      throw new Error("Day must be between 1 and 7")
    }
    return FamilyCalendarModel.calculateFamilyBusyTime(day)
  },

  // Budget Management
  getFamilyBudgetSummary() {
    return FamilyCalendarModel.getFamilyBudgetSummary()
  },

  // Family-specific helper functions
  getDayName(day: number): string {
    const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    if (day < 1 || day > 7) {
      throw new Error("Day must be between 1 and 7")
    }
    return dayNames[day - 1]
  },

  generateFamilyDaySummary(day: number): string {
    const dayName = this.getDayName(day)
    const events = this.getFamilyEventsByDay(day)
    const children = this.getChildren()

    if (events.length === 0) {
      return `${dayName} looks like a free day for the family! Perfect time for spontaneous activities or rest.`
    }

    let summary = `Here's what's planned for ${dayName}:\n\n`

    // Group events by family member
    const eventsByMember = {}
    events.forEach((event) => {
      event.assignedTo.forEach((memberId) => {
        const member = FamilyCalendarModel.getFamilyMember(memberId)
        if (member) {
          if (!eventsByMember[member.name]) {
            eventsByMember[member.name] = []
          }
          eventsByMember[member.name].push(event)
        }
      })
    })

    // Create summary for each family member
    Object.keys(eventsByMember).forEach((memberName) => {
      const memberEvents = eventsByMember[memberName]
      summary += `${memberName}: `

      if (memberEvents.length === 1) {
        summary += `${memberEvents[0].title} at ${memberEvents[0].startTime}`
      } else {
        summary += `${memberEvents.length} activities including ${memberEvents[0].title}`
      }
      summary += "\n"
    })

    // Add special notes for children's events
    const childrenEvents = events.filter((event) =>
      event.assignedTo.some((memberId) => children.some((child) => child.id === memberId)),
    )

    if (childrenEvents.length > 0) {
      summary += `\nSpecial notes for the kids:\n`
      childrenEvents.forEach((event) => {
        if (event.type === "medical") {
          summary += `• Don't forget ${event.title} - bring insurance cards\n`
        } else if (event.type === "sports") {
          summary += `• Pack water and snacks for ${event.title}\n`
        } else if (event.requiresTransport) {
          summary += `• ${event.title} needs transportation\n`
        }
      })
    }

    return summary
  },

  generateWeeklyFamilyReport(): string {
    const children = this.getChildren()
    const insights = this.generateFamilyInsights()
    const budgetSummary = this.getFamilyBudgetSummary()

    let report = "📅 Weekly Family Report\n\n"

    // Children's schedule overview
    report += "👶 Children's Week:\n"
    children.forEach((child) => {
      const childEvents = FamilyCalendarModel.getFamilyEventsByMember(child.id)
      report += `• ${child.name} (${child.age}): ${childEvents.length} activities scheduled\n`
    })

    // Budget overview
    report += `\n💰 Budget Status:\n`
    report += `• Spent: $${budgetSummary.totalSpent} of $${budgetSummary.totalBudgeted}\n`
    report += `• Remaining: $${budgetSummary.remainingBudget}\n`

    // Insights and recommendations
    if (insights.length > 0) {
      report += `\n🤖 AI Insights:\n`
      insights.slice(0, 3).forEach((insight) => {
        report += `• ${insight.title}: ${insight.message}\n`
      })
    }

    return report
  },
}
