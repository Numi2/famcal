/**
 * Family Calendar Model - Handles data operations and business logic for families
 */
import type { FamilyEvent, FamilyMember, MealPlan, ChoreAssignment, ActivitySuggestion, FamilyInsight } from "./types"

// Sample family members - The Johnson Family
const familyMembers: FamilyMember[] = [
  {
    id: "sarah",
    name: "Sarah",
    role: "parent",
    age: 34,
    color: "bg-pink-500",
    preferences: {
      favoriteActivities: ["reading", "yoga", "cooking", "gardening"],
      dietaryRestrictions: ["vegetarian"],
    },
  },
  {
    id: "mike",
    name: "Mike",
    role: "parent",
    age: 36,
    color: "bg-blue-500",
    preferences: {
      favoriteActivities: ["sports", "hiking", "board games", "cycling"],
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
      favoriteActivities: ["drawing", "swimming", "reading", "dancing"],
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
      favoriteActivities: ["building blocks", "playground", "music", "puzzles"],
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
    day: 2, // Monday
    date: "2025-01-20",
    description: "Weekly soccer practice with the Lightning Bolts team",
    location: "Riverside Community Center - Field 2",
    type: "sports",
    assignedTo: ["emma", "sarah"],
    organizer: "sarah",
    color: "bg-green-400",
    priority: "medium",
    requiresTransport: true,
    carpoolInfo: {
      driver: "sarah",
      passengers: ["emma"],
      pickupTime: "15:45",
      dropoffTime: "17:45",
      route: ["home", "community center", "home"],
    },
  },
  {
    id: 2,
    title: "Lucas's Bedtime Routine",
    startTime: "19:30",
    endTime: "20:00",
    day: 1, // Sunday (recurring daily)
    date: "2025-01-19",
    description: "Bath time, story reading, and bedtime",
    location: "Home - Lucas's Room",
    type: "bedtime",
    assignedTo: ["lucas", "mike"],
    organizer: "mike",
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
    day: 7, // Saturday
    date: "2025-01-25",
    description: "Weekly grocery shopping - teaching kids about budgeting and healthy choices",
    location: "Whole Foods Market",
    type: "shopping",
    assignedTo: ["sarah", "mike", "emma", "lucas"],
    organizer: "sarah",
    color: "bg-yellow-400",
    priority: "medium",
    cost: 150,
    notes: "Remember Emma's school snacks and Lucas's favorite yogurt",
  },
  {
    id: 4,
    title: "Lucas's Piano Lesson",
    startTime: "15:00",
    endTime: "16:00",
    day: 4, // Wednesday
    date: "2025-01-22",
    description: "Weekly piano lesson with Mrs. Johnson - working on beginner songs",
    location: "Harmony Music Academy",
    type: "music-lesson",
    assignedTo: ["lucas", "mike"],
    organizer: "mike",
    color: "bg-purple-400",
    priority: "medium",
    cost: 40,
    requiresTransport: true,
  },
  {
    id: 5,
    title: "Pediatrician Checkup - Lucas",
    startTime: "10:30",
    endTime: "11:30",
    day: 5, // Thursday
    date: "2025-01-23",
    description: "Annual checkup and vaccinations - bring vaccination records",
    location: "Children's Medical Center",
    type: "medical",
    assignedTo: ["lucas", "sarah"],
    organizer: "sarah",
    color: "bg-red-400",
    priority: "high",
    reminders: [
      {
        type: "notification",
        minutesBefore: 1440, // 24 hours
        message: "Remember to bring insurance card and vaccination records",
        sendTo: ["sarah"],
      },
    ],
  },
  {
    id: 6,
    title: "Emma's Dance Class",
    startTime: "14:00",
    endTime: "15:00",
    day: 3, // Tuesday
    date: "2025-01-21",
    description: "Ballet and contemporary dance class with Miss Anna",
    location: "Grace Dance Studio",
    type: "dance",
    assignedTo: ["emma", "sarah"],
    organizer: "sarah",
    color: "bg-pink-400",
    priority: "medium",
    cost: 35,
    requiresTransport: true,
  },
  {
    id: 7,
    title: "Family Movie Night",
    startTime: "19:00",
    endTime: "21:00",
    day: 6, // Friday
    date: "2025-01-24",
    description: "Weekly family movie night with homemade popcorn and hot chocolate",
    location: "Home - Living Room",
    type: "family",
    assignedTo: ["sarah", "mike", "emma", "lucas"],
    organizer: "mike",
    color: "bg-orange-400",
    priority: "low",
    notes: "Kids pick the movie this week",
  },
  {
    id: 8,
    title: "Swimming Lessons - Both Kids",
    startTime: "16:30",
    endTime: "17:30",
    day: 4, // Wednesday
    date: "2025-01-22",
    description: "Swimming lessons at the community pool - Emma (intermediate), Lucas (beginner)",
    location: "Community Recreation Center Pool",
    type: "sports",
    assignedTo: ["emma", "lucas", "sarah"],
    organizer: "sarah",
    color: "bg-cyan-400",
    priority: "medium",
    cost: 60,
    requiresTransport: true,
  },
  {
    id: 9,
    title: "Parent-Teacher Conference - Emma",
    startTime: "18:00",
    endTime: "18:30",
    day: 2, // Monday
    date: "2025-01-20",
    description: "Meeting with Mrs. Smith about Emma's progress in 3rd grade",
    location: "Riverside Elementary - Room 15",
    type: "school",
    assignedTo: ["sarah", "mike"],
    organizer: "sarah",
    color: "bg-blue-400",
    priority: "high",
    notes: "Discuss Emma's reading progress and math skills",
  },
  {
    id: 10,
    title: "Family Bike Ride",
    startTime: "09:00",
    endTime: "11:00",
    day: 1, // Sunday
    date: "2025-01-19",
    description: "Morning bike ride through Riverside Park trails",
    location: "Riverside Park Trail",
    type: "family",
    assignedTo: ["sarah", "mike", "emma", "lucas"],
    organizer: "mike",
    color: "bg-green-400",
    priority: "low",
    notes: "Bring water bottles and helmets for everyone",
  },
]

// Sample meal plans for the week
const mealPlans: MealPlan[] = [
  {
    id: "meal1",
    day: 1, // Sunday
    mealType: "breakfast",
    meal: "Pancakes with Fresh Berries",
    ingredients: ["whole wheat flour", "eggs", "milk", "blueberries", "strawberries", "maple syrup"],
    prepTime: 10,
    cookTime: 15,
    servings: 4,
    allergensConsidered: ["gluten", "dairy", "eggs"],
    kidFriendly: true,
    difficulty: "easy",
    nutritionNotes: "High in fiber and antioxidants from berries",
  },
  {
    id: "meal2",
    day: 1, // Sunday
    mealType: "dinner",
    meal: "Spaghetti with Turkey Meatballs",
    ingredients: ["whole wheat pasta", "ground turkey", "tomato sauce", "onions", "garlic", "herbs"],
    prepTime: 15,
    cookTime: 30,
    servings: 4,
    allergensConsidered: ["gluten"],
    kidFriendly: true,
    difficulty: "medium",
    nutritionNotes: "High protein, includes hidden vegetables in sauce",
  },
  {
    id: "meal3",
    day: 2, // Monday
    mealType: "lunch",
    meal: "Grilled Cheese and Tomato Soup",
    ingredients: ["whole grain bread", "cheddar cheese", "tomato soup", "butter"],
    prepTime: 5,
    cookTime: 10,
    servings: 4,
    allergensConsidered: ["dairy", "gluten"],
    kidFriendly: true,
    difficulty: "easy",
  },
  {
    id: "meal4",
    day: 3, // Tuesday
    mealType: "dinner",
    meal: "Baked Chicken with Roasted Vegetables",
    ingredients: ["chicken breast", "broccoli", "carrots", "sweet potatoes", "olive oil", "herbs"],
    prepTime: 10,
    cookTime: 35,
    servings: 4,
    allergensConsidered: [],
    kidFriendly: true,
    difficulty: "easy",
    nutritionNotes: "Balanced meal with protein and colorful vegetables",
  },
  {
    id: "meal5",
    day: 4, // Wednesday
    mealType: "dinner",
    meal: "Taco Night",
    ingredients: ["ground beef", "taco shells", "lettuce", "tomatoes", "cheese", "sour cream", "salsa"],
    prepTime: 15,
    cookTime: 20,
    servings: 4,
    allergensConsidered: ["dairy", "gluten"],
    kidFriendly: true,
    difficulty: "easy",
    nutritionNotes: "Interactive meal - kids can build their own tacos",
  },
  {
    id: "meal6",
    day: 6, // Friday
    mealType: "dinner",
    meal: "Homemade Pizza Night",
    ingredients: ["pizza dough", "tomato sauce", "mozzarella cheese", "pepperoni", "vegetables"],
    prepTime: 20,
    cookTime: 15,
    servings: 4,
    allergensConsidered: ["gluten", "dairy"],
    kidFriendly: true,
    difficulty: "medium",
    nutritionNotes: "Fun family cooking activity",
  },
]

// Sample chore assignments for the kids
const choreAssignments: ChoreAssignment[] = [
  {
    id: "chore1",
    chore: "Set the dinner table",
    assignedTo: "emma",
    dueDate: "2025-01-20",
    completed: false,
    points: 5,
    ageAppropriate: true,
    instructions: "Place plates, cups, napkins, and utensils for everyone",
    parentApprovalRequired: false,
  },
  {
    id: "chore2",
    chore: "Put toys away in bedroom",
    assignedTo: "lucas",
    dueDate: "2025-01-19",
    completed: true,
    points: 3,
    ageAppropriate: true,
    parentApprovalRequired: false,
  },
  {
    id: "chore3",
    chore: "Feed the goldfish",
    assignedTo: "emma",
    dueDate: "2025-01-20",
    completed: false,
    points: 2,
    ageAppropriate: true,
    instructions: "Give Goldie a small pinch of fish food",
    parentApprovalRequired: false,
  },
  {
    id: "chore4",
    chore: "Help sort laundry",
    assignedTo: "lucas",
    dueDate: "2025-01-21",
    completed: false,
    points: 4,
    ageAppropriate: true,
    instructions: "Sort clothes by color - lights and darks",
    parentApprovalRequired: true,
  },
  {
    id: "chore5",
    chore: "Water the plants",
    assignedTo: "emma",
    dueDate: "2025-01-22",
    completed: false,
    points: 3,
    ageAppropriate: true,
    instructions: "Water the plants in the living room and kitchen",
    parentApprovalRequired: false,
  },
]

// Sample activity suggestions for family time
const activitySuggestions: ActivitySuggestion[] = [
  {
    id: "activity1",
    title: "Nature Scavenger Hunt",
    description: "Find items from nature like leaves, rocks, flowers, and interesting bugs",
    duration: 60,
    ageRange: { min: 4, max: 12 },
    location: "outdoor",
    weatherRequirements: ["sunny", "partly cloudy"],
    materials: ["scavenger hunt list", "collection bag", "magnifying glass"],
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
    materials: ["blankets", "pillows", "chairs", "clothespins"],
    cost: "free",
    educational: false,
    physical: false,
    creative: true,
    social: true,
  },
  {
    id: "activity3",
    title: "Family Cooking Challenge",
    description: "Cook a simple meal together with age-appropriate tasks for each child",
    duration: 90,
    ageRange: { min: 4, max: 12 },
    location: "indoor",
    materials: ["ingredients", "kid-safe utensils", "aprons"],
    cost: "low",
    educational: true,
    physical: false,
    creative: true,
    social: true,
  },
  {
    id: "activity4",
    title: "Backyard Obstacle Course",
    description: "Create a fun obstacle course using household items and yard space",
    duration: 75,
    ageRange: { min: 3, max: 12 },
    location: "outdoor",
    weatherRequirements: ["sunny", "partly cloudy"],
    materials: ["cones", "jump rope", "hula hoops", "balls"],
    cost: "free",
    educational: false,
    physical: true,
    creative: true,
    social: true,
  },
  {
    id: "activity5",
    title: "Family Art Project",
    description: "Create a collaborative art piece that everyone contributes to",
    duration: 60,
    ageRange: { min: 3, max: 12 },
    location: "indoor",
    materials: ["large paper", "paints", "brushes", "markers", "stickers"],
    cost: "low",
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
          message: `Consider adding a consistent bedtime routine for ${child.name}`,
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
        message: "You haven't planned any meals for today. Would you like family-friendly suggestions?",
        actionable: true,
        action: "Plan meals",
        priority: "medium",
        createdAt: new Date().toISOString(),
      })
    }

    // Check for balanced activities
    const weekEvents = this.getAllFamilyEvents()
    const physicalActivities = weekEvents.filter(
      (event) => event.type === "sports" || event.type === "dance" || event.title.toLowerCase().includes("bike"),
    )

    if (physicalActivities.length < 3) {
      insights.push({
        id: "physical-activity-suggestion",
        type: "suggestion",
        title: "More Physical Activities Needed",
        message: "Consider adding more physical activities to keep the family active and healthy",
        actionable: true,
        action: "Browse activity suggestions",
        priority: "low",
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

    const familyActiveHours = 14 * 60 // 14 hours from 7 AM to 9 PM
    const busyPercentage = (totalBusyMinutes / familyActiveHours) * 100

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
    // Calculate from family events with costs
    const eventsWithCosts = familyEvents.filter((event) => event.cost)
    const totalSpentOnActivities = eventsWithCosts.reduce((sum, event) => sum + (event.cost || 0), 0)

    return {
      totalBudgeted: 2500, // Monthly family budget
      totalSpent: 1650,
      remainingBudget: 850,
      categoryBreakdown: {
        activities: { budgeted: 600, spent: 400 }, // Sports, dance, music lessons
        food: { budgeted: 1200, spent: 800 }, // Groceries and family meals
        medical: { budgeted: 400, spent: 250 }, // Doctor visits, checkups
        education: { budgeted: 300, spent: 200 }, // School supplies, books
      },
    }
  },
}
