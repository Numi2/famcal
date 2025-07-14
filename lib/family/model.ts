/**
 * Family Calendar Model - Handles data operations and business logic for families
 */
import type { FamilyEvent, FamilyMember, MealPlan, ChoreAssignment, ActivitySuggestion, FamilyInsight } from "./types"

// Sample family members
const familyMembers: FamilyMember[] = [
  {
    id: "mom",
    name: "Sarah",
    role: "parent",
    age: 35,
    color: "bg-pink-500",
    preferences: {
      favoriteActivities: ["reading", "yoga", "cooking"],
      dietaryRestrictions: ["vegetarian"],
    },
  },
  {
    id: "dad",
    name: "Mike",
    role: "parent",
    age: 37,
    color: "bg-blue-500",
    preferences: {
      favoriteActivities: ["sports", "hiking", "board games"],
    },
  },
  {
    id: "emma",
    name: "Emma",
    role: "child",
    age: 8,
    grade: "3rd Grade",
    school: "Riverside Elementary",
    color: "bg-purple-500",
    allergies: ["peanuts"],
    preferences: {
      bedtime: "20:00",
      wakeupTime: "07:00",
      favoriteActivities: ["drawing", "swimming", "reading"],
    },
  },
  {
    id: "lucas",
    name: "Lucas",
    role: "child",
    age: 5,
    grade: "Kindergarten",
    school: "Riverside Elementary",
    color: "bg-green-500",
    preferences: {
      bedtime: "19:30",
      wakeupTime: "07:30",
      favoriteActivities: ["building blocks", "playground", "music"],
    },
  },
]

// Sample family events with family-specific context
const familyEvents: FamilyEvent[] = [
  {
    id: 1,
    title: "Emma's Soccer Practice",
    startTime: "16:00",
    endTime: "17:30",
    day: 2,
    date: "2025-03-04",
    description: "Weekly soccer practice at the community center",
    location: "Community Sports Center",
    type: "sports",
    assignedTo: ["emma", "mom"],
    organizer: "mom",
    color: "bg-green-400",
    priority: "medium",
    requiresTransport: true,
    carpoolInfo: {
      driver: "mom",
      passengers: ["emma"],
      pickupTime: "15:45",
      dropoffTime: "17:45",
      route: ["home", "sports center", "home"],
    },
  },
  {
    id: 2,
    title: "Lucas's Bedtime Routine",
    startTime: "19:00",
    endTime: "19:30",
    day: 1,
    date: "2025-03-03",
    description: "Bath, story time, and sleep",
    location: "Home",
    type: "bedtime",
    assignedTo: ["lucas", "dad"],
    organizer: "dad",
    color: "bg-indigo-400",
    priority: "high",
    isRecurring: true,
    recurrencePattern: {
      frequency: "daily",
      interval: 1,
    },
  },
  {
    id: 3,
    title: "Family Grocery Shopping",
    startTime: "10:00",
    endTime: "11:30",
    day: 7,
    date: "2025-03-09",
    description: "Weekly grocery run - include kids for learning experience",
    location: "Whole Foods Market",
    type: "shopping",
    assignedTo: ["mom", "dad", "emma", "lucas"],
    organizer: "mom",
    color: "bg-yellow-400",
    priority: "medium",
    cost: 150,
    notes: "Remember Emma's school snacks and Lucas's favorite yogurt",
  },
  {
    id: 4,
    title: "Emma's Piano Lesson",
    startTime: "15:00",
    endTime: "16:00",
    day: 4,
    date: "2025-03-06",
    description: "Weekly piano lesson with Mrs. Johnson",
    location: "Music Academy",
    type: "music-lesson",
    assignedTo: ["emma", "mom"],
    organizer: "mom",
    color: "bg-purple-400",
    priority: "medium",
    cost: 40,
    requiresTransport: true,
  },
  {
    id: 5,
    title: "Pediatrician Checkup - Lucas",
    startTime: "14:00",
    endTime: "15:00",
    day: 3,
    date: "2025-03-05",
    description: "Annual checkup and vaccinations",
    location: "Children's Medical Center",
    type: "medical",
    assignedTo: ["lucas", "mom"],
    organizer: "mom",
    color: "bg-red-400",
    priority: "high",
    reminders: [
      {
        type: "notification",
        minutesBefore: 1440, // 24 hours
        message: "Remember to bring insurance card and vaccination records",
        sendTo: ["mom"],
      },
    ],
  },
]

// Sample meal plans
const mealPlans: MealPlan[] = [
  {
    id: "meal1",
    day: 1,
    mealType: "dinner",
    meal: "Spaghetti with Turkey Meatballs",
    ingredients: ["whole wheat pasta", "ground turkey", "tomato sauce", "vegetables"],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    allergensConsidered: ["gluten"],
    kidFriendly: true,
    difficulty: "easy",
    nutritionNotes: "High protein, includes hidden vegetables",
  },
  {
    id: "meal2",
    day: 2,
    mealType: "lunch",
    meal: "Grilled Cheese and Tomato Soup",
    ingredients: ["whole grain bread", "cheese", "tomato soup", "butter"],
    prepTime: 5,
    cookTime: 10,
    servings: 4,
    allergensConsidered: ["dairy", "gluten"],
    kidFriendly: true,
    difficulty: "easy",
  },
]

// Sample chore assignments
const choreAssignments: ChoreAssignment[] = [
  {
    id: "chore1",
    chore: "Set the dinner table",
    assignedTo: "emma",
    dueDate: "2025-03-03",
    completed: false,
    points: 5,
    ageAppropriate: true,
    instructions: "Place plates, cups, and napkins for everyone",
    parentApprovalRequired: false,
  },
  {
    id: "chore2",
    chore: "Put toys away in bedroom",
    assignedTo: "lucas",
    dueDate: "2025-03-03",
    completed: true,
    points: 3,
    ageAppropriate: true,
    parentApprovalRequired: false,
  },
]

// Sample activity suggestions
const activitySuggestions: ActivitySuggestion[] = [
  {
    id: "activity1",
    title: "Nature Scavenger Hunt",
    description: "Find items from nature like leaves, rocks, and flowers",
    duration: 60,
    ageRange: { min: 4, max: 12 },
    location: "outdoor",
    weatherRequirements: ["sunny", "partly cloudy"],
    materials: ["list", "bag", "magnifying glass"],
    cost: "free",
    educational: true,
    physical: true,
    creative: false,
    social: true,
  },
  {
    id: "activity2",
    title: "Indoor Fort Building",
    description: "Build a cozy fort using blankets, pillows, and furniture",
    duration: 45,
    ageRange: { min: 3, max: 10 },
    location: "indoor",
    materials: ["blankets", "pillows", "chairs"],
    cost: "free",
    educational: false,
    physical: false,
    creative: true,
    social: true,
  },
]

export const FamilyCalendarModel = {
  // Family Members
  getFamilyMembers(): FamilyMember[] {
    return [...familyMembers]
  },

  getFamilyMember(id: string): FamilyMember | undefined {
    return familyMembers.find((member) => member.id === id)
  },

  getChildren(): FamilyMember[] {
    return familyMembers.filter((member) => member.role === "child")
  },

  getParents(): FamilyMember[] {
    return familyMembers.filter((member) => member.role === "parent")
  },

  // Family Events
  getAllFamilyEvents(): FamilyEvent[] {
    return [...familyEvents]
  },

  getFamilyEventsByDay(day: number): FamilyEvent[] {
    return familyEvents.filter((event) => event.day === day)
  },

  getFamilyEventsByMember(memberId: string): FamilyEvent[] {
    return familyEvents.filter((event) => event.assignedTo.includes(memberId))
  },

  getFamilyEventsByType(type: string): FamilyEvent[] {
    return familyEvents.filter((event) => event.type === type)
  },

  getUpcomingMedicalAppointments(): FamilyEvent[] {
    return familyEvents.filter((event) => event.type === "medical")
  },

  // Meal Planning
  getMealPlansByDay(day: number): MealPlan[] {
    return mealPlans.filter((meal) => meal.day === day)
  },

  getWeeklyMealPlan(): MealPlan[] {
    return [...mealPlans]
  },

  // Chores
  getChoresByMember(memberId: string): ChoreAssignment[] {
    return choreAssignments.filter((chore) => chore.assignedTo === memberId)
  },

  getPendingChores(): ChoreAssignment[] {
    return choreAssignments.filter((chore) => !chore.completed)
  },

  // Activity Suggestions
  getActivitySuggestions(filters?: {
    ageRange?: { min: number; max: number }
    location?: "indoor" | "outdoor" | "either"
    duration?: number
    cost?: "free" | "low" | "medium" | "high"
  }): ActivitySuggestion[] {
    let suggestions = [...activitySuggestions]

    if (filters) {
      if (filters.ageRange) {
        suggestions = suggestions.filter(
          (activity) =>
            activity.ageRange.min <= filters.ageRange!.max && activity.ageRange.max >= filters.ageRange!.min,
        )
      }

      if (filters.location && filters.location !== "either") {
        suggestions = suggestions.filter(
          (activity) => activity.location === filters.location || activity.location === "either",
        )
      }

      if (filters.duration) {
        suggestions = suggestions.filter((activity) => activity.duration <= filters.duration!)
      }

      if (filters.cost) {
        suggestions = suggestions.filter((activity) => activity.cost === filters.cost)
      }
    }

    return suggestions
  },

  // Family Insights
  generateFamilyInsights(): FamilyInsight[] {
    const insights: FamilyInsight[] = []

    // Check for scheduling conflicts
    const today = new Date().getDay() + 1
    const todayEvents = this.getFamilyEventsByDay(today)

    // Look for overlapping events for the same family member
    for (let i = 0; i < todayEvents.length; i++) {
      for (let j = i + 1; j < todayEvents.length; j++) {
        const event1 = todayEvents[i]
        const event2 = todayEvents[j]

        const hasCommonMember = event1.assignedTo.some((member) => event2.assignedTo.includes(member))

        if (hasCommonMember) {
          // Check for time overlap
          const start1 = new Date(`2025-01-01 ${event1.startTime}`)
          const end1 = new Date(`2025-01-01 ${event1.endTime}`)
          const start2 = new Date(`2025-01-01 ${event2.startTime}`)
          const end2 = new Date(`2025-01-01 ${event2.endTime}`)

          if (start1 < end2 && start2 < end1) {
            insights.push({
              id: `conflict-${event1.id}-${event2.id}`,
              type: "warning",
              title: "Scheduling Conflict Detected",
              message: `${event1.title} and ${event2.title} overlap for a family member`,
              actionable: true,
              action: "Reschedule one of the events",
              priority: "high",
              relatedEvents: [event1.id, event2.id],
              createdAt: new Date().toISOString(),
            })
          }
        }
      }
    }

    // Check for bedtime routine compliance
    const children = this.getChildren()
    children.forEach((child) => {
      const bedtimeEvents = familyEvents.filter(
        (event) => event.type === "bedtime" && event.assignedTo.includes(child.id),
      )

      if (bedtimeEvents.length === 0) {
        insights.push({
          id: `bedtime-${child.id}`,
          type: "suggestion",
          title: "Missing Bedtime Routine",
          message: `Consider adding a bedtime routine for ${child.name}`,
          actionable: true,
          action: "Create bedtime routine",
          priority: "medium",
          relatedMembers: [child.id],
          createdAt: new Date().toISOString(),
        })
      }
    })

    // Check for meal planning
    const todayMeals = this.getMealPlansByDay(today)
    if (todayMeals.length === 0) {
      insights.push({
        id: `meal-planning-${today}`,
        type: "reminder",
        title: "No Meals Planned",
        message: "You haven't planned any meals for today. Would you like suggestions?",
        actionable: true,
        action: "Plan meals",
        priority: "medium",
        createdAt: new Date().toISOString(),
      })
    }

    return insights
  },

  // Helper functions for family-specific calculations
  calculateFamilyBusyTime(day: number): {
    totalMinutes: number
    busyPercentage: number
    freeTimeSlots: { start: string; end: string; duration: number }[]
  } {
    const dayEvents = this.getFamilyEventsByDay(day)
    let totalBusyMinutes = 0

    dayEvents.forEach((event) => {
      const start = new Date(`2025-01-01 ${event.startTime}`)
      const end = new Date(`2025-01-01 ${event.endTime}`)
      totalBusyMinutes += (end.getTime() - start.getTime()) / (1000 * 60)
    })

    const workingHours = 12 * 60 // 12 hours from 7 AM to 7 PM
    const busyPercentage = (totalBusyMinutes / workingHours) * 100

    // Calculate free time slots (simplified)
    const freeTimeSlots = []
    // This would be implemented with proper time slot calculation

    return {
      totalMinutes: totalBusyMinutes,
      busyPercentage,
      freeTimeSlots,
    }
  },

  // Family budget tracking
  getFamilyBudgetSummary(): {
    totalBudgeted: number
    totalSpent: number
    remainingBudget: number
    categoryBreakdown: { [key: string]: { budgeted: number; spent: number } }
  } {
    // This would calculate from actual budget data
    return {
      totalBudgeted: 2000,
      totalSpent: 1200,
      remainingBudget: 800,
      categoryBreakdown: {
        activities: { budgeted: 500, spent: 300 },
        food: { budgeted: 800, spent: 600 },
        medical: { budgeted: 400, spent: 200 },
        education: { budgeted: 300, spent: 100 },
      },
    }
  },
}
