/**
 * Family Calendar Presenter - Formats data for presentation and handles family-specific UI interactions
 */
import { FamilyCalendarController } from "./controller"
import type { FamilyEvent, FamilyMember, MealPlan, ChoreAssignment, ActivitySuggestion } from "./types"

export const FamilyCalendarPresenter = {
  // Format family events for display
  formatFamilyEvents(events: FamilyEvent[]) {
    return events.map((event) => ({
      ...event,
      formattedTime: `${event.startTime} - ${event.endTime}`,
      dayName: FamilyCalendarController.getDayName(event.day),
      assignedMemberNames: event.assignedTo.map((id) => {
        const member = FamilyCalendarController.getFamilyMember(id)
        return member ? member.name : "Unknown"
      }),
      typeIcon: this.getEventTypeIcon(event.type),
      priorityColor: this.getPriorityColor(event.priority),
      isChildEvent: event.assignedTo.some((id) => {
        const member = FamilyCalendarController.getFamilyMember(id)
        return member?.role === "child"
      }),
    }))
  },

  // Format family members for display
  formatFamilyMembers(members: FamilyMember[]) {
    return members.map((member) => ({
      ...member,
      displayName: member.role === "child" ? `${member.name} (${member.age})` : member.name,
      roleIcon: member.role === "child" ? "👶" : member.role === "parent" ? "👨‍👩‍👧‍👦" : "👤",
      ageGroup: member.age ? this.getAgeGroup(member.age) : "adult",
    }))
  },

  // Format meal plans for display
  formatMealPlans(meals: MealPlan[]) {
    return meals.map((meal) => ({
      ...meal,
      formattedPrepTime: `${meal.prepTime} min prep, ${meal.cookTime} min cook`,
      difficultyIcon: meal.difficulty === "easy" ? "😊" : meal.difficulty === "medium" ? "🤔" : "😰",
      kidFriendlyIcon: meal.kidFriendly ? "👶✅" : "👶❌",
      mealTypeIcon: this.getMealTypeIcon(meal.mealType),
    }))
  },

  // Format chore assignments for display
  formatChoreAssignments(chores: ChoreAssignment[]) {
    return chores.map((chore) => ({
      ...chore,
      assignedMemberName: FamilyCalendarController.getFamilyMember(chore.assignedTo)?.name || "Unknown",
      statusIcon: chore.completed ? "✅" : "⏳",
      pointsDisplay: `${chore.points} points`,
      ageAppropriateIcon: chore.ageAppropriate ? "👍" : "⚠️",
    }))
  },

  // Format activity suggestions for display
  formatActivitySuggestions(activities: ActivitySuggestion[]) {
    return activities.map((activity) => ({
      ...activity,
      formattedDuration: `${activity.duration} minutes`,
      ageRangeDisplay: `Ages ${activity.ageRange.min}-${activity.ageRange.max}`,
      locationIcon: activity.location === "indoor" ? "🏠" : activity.location === "outdoor" ? "🌳" : "🏠🌳",
      costIcon: this.getCostIcon(activity.cost),
      categoryIcons: this.getActivityCategoryIcons(activity),
    }))
  },

  // Get formatted events by day with family context
  getFormattedFamilyEventsByDay(day: number) {
    const events = FamilyCalendarController.getFamilyEventsByDay(day)
    return this.formatFamilyEvents(events)
  },

  // Get formatted children's schedule
  getFormattedChildrenSchedule(day?: number) {
    const schedule = FamilyCalendarController.getChildrenSchedule(day)
    const formattedSchedule = {}

    Object.keys(schedule).forEach((childName) => {
      formattedSchedule[childName] = this.formatFamilyEvents(schedule[childName])
    })

    return formattedSchedule
  },

  // Get formatted meal suggestions
  getFormattedMealSuggestions(preferences?: any) {
    const meals = FamilyCalendarController.suggestMealsForFamily(preferences)
    return this.formatMealPlans(meals)
  },

  // Get formatted activity suggestions
  getFormattedActivitySuggestions(filters?: any) {
    const activities = FamilyCalendarController.getActivitySuggestions(filters)
    return this.formatActivitySuggestions(activities)
  },

  // Generate family-friendly day summary
  generateFamilyDaySummary(day: number): string {
    return FamilyCalendarController.generateFamilyDaySummary(day)
  },

  // Generate weekly family report
  generateWeeklyFamilyReport(): string {
    return FamilyCalendarController.generateWeeklyFamilyReport()
  },

  // Get family insights with formatting
  getFormattedFamilyInsights() {
    const insights = FamilyCalendarController.generateFamilyInsights()
    return insights.map((insight) => ({
      ...insight,
      typeIcon: this.getInsightTypeIcon(insight.type),
      priorityColor: this.getPriorityColor(insight.priority),
      formattedCreatedAt: new Date(insight.createdAt).toLocaleDateString(),
    }))
  },

  // Helper functions for icons and formatting
  getEventTypeIcon(type: string): string {
    const icons = {
      school: "🏫",
      medical: "🏥",
      activity: "🎯",
      meal: "🍽️",
      chore: "🧹",
      "family-time": "👨‍👩‍👧‍👦",
      bedtime: "🛏️",
      "pickup-dropoff": "🚗",
      playdate: "🤝",
      appointment: "📅",
      birthday: "🎂",
      vacation: "✈️",
      emergency: "🚨",
      babysitter: "👶",
      sports: "⚽",
      "music-lesson": "🎵",
      tutoring: "📚",
      shopping: "🛒",
      household: "🏠",
    }
    return icons[type] || "📅"
  },

  getMealTypeIcon(mealType: string): string {
    const icons = {
      breakfast: "🌅",
      lunch: "☀️",
      dinner: "🌙",
      snack: "🍎",
    }
    return icons[mealType] || "🍽️"
  },

  getCostIcon(cost: string): string {
    const icons = {
      free: "💚",
      low: "💛",
      medium: "🧡",
      high: "❤️",
    }
    return icons[cost] || "💰"
  },

  getPriorityColor(priority: string): string {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800",
      high: "bg-orange-100 text-orange-800",
      urgent: "bg-red-100 text-red-800",
    }
    return colors[priority] || "bg-gray-100 text-gray-800"
  },

  getInsightTypeIcon(type: string): string {
    const icons = {
      suggestion: "💡",
      warning: "⚠️",
      celebration: "🎉",
      reminder: "⏰",
    }
    return icons[type] || "ℹ️"
  },

  getAgeGroup(age: number): string {
    if (age < 3) return "toddler"
    if (age < 6) return "preschool"
    if (age < 13) return "school-age"
    if (age < 18) return "teen"
    return "adult"
  },

  getActivityCategoryIcons(activity: ActivitySuggestion): string[] {
    const icons = []
    if (activity.educational) icons.push("📚")
    if (activity.physical) icons.push("🏃")
    if (activity.creative) icons.push("🎨")
    if (activity.social) icons.push("👥")
    return icons
  },
}
