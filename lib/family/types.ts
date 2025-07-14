/**
 * Type definitions for the family calendar application
 */

export type FamilyMember = {
  id: string
  name: string
  role: "parent" | "child" | "caregiver"
  age?: number
  grade?: string
  school?: string
  allergies?: string[]
  medications?: string[]
  emergencyContact?: string
  color: string
  avatar?: string
  preferences: {
    bedtime?: string
    wakeupTime?: string
    favoriteActivities?: string[]
    dietaryRestrictions?: string[]
  }
}

export type FamilyEvent = {
  id: number
  title: string
  startTime: string
  endTime: string
  day: number
  date: string
  description: string
  location: string
  type: EventType
  assignedTo: string[] // Family member IDs
  organizer: string
  color: string
  priority: "low" | "medium" | "high" | "urgent"
  isRecurring?: boolean
  recurrencePattern?: RecurrencePattern
  reminders?: Reminder[]
  notes?: string
  cost?: number
  requiresTransport?: boolean
  carpoolInfo?: CarpoolInfo
  weatherDependent?: boolean
  ageAppropriate?: {
    minAge: number
    maxAge: number
  }
}

export type EventType =
  | "school"
  | "medical"
  | "activity"
  | "meal"
  | "chore"
  | "family-time"
  | "bedtime"
  | "pickup-dropoff"
  | "playdate"
  | "appointment"
  | "birthday"
  | "vacation"
  | "emergency"
  | "babysitter"
  | "sports"
  | "music-lesson"
  | "tutoring"
  | "shopping"
  | "household"

export type CarpoolInfo = {
  driver: string
  passengers: string[]
  pickupTime: string
  dropoffTime: string
  route: string[]
}

export type Reminder = {
  type: "notification" | "email" | "sms"
  minutesBefore: number
  message?: string
  sendTo: string[] // Family member IDs
}

export type RecurrencePattern = {
  frequency: "daily" | "weekly" | "monthly" | "yearly" | "school-days" | "weekends"
  interval: number
  endDate?: string
  endAfterOccurrences?: number
  daysOfWeek?: number[]
  schoolCalendarSync?: boolean
}

export type MealPlan = {
  id: string
  day: number
  mealType: "breakfast" | "lunch" | "dinner" | "snack"
  meal: string
  ingredients: string[]
  prepTime: number
  cookTime: number
  servings: number
  allergensConsidered: string[]
  nutritionNotes?: string
  kidFriendly: boolean
  difficulty: "easy" | "medium" | "hard"
}

export type ChoreAssignment = {
  id: string
  chore: string
  assignedTo: string
  dueDate: string
  completed: boolean
  points: number
  ageAppropriate: boolean
  instructions?: string
  parentApprovalRequired: boolean
}

export type ActivitySuggestion = {
  id: string
  title: string
  description: string
  duration: number
  ageRange: {
    min: number
    max: number
  }
  location: "indoor" | "outdoor" | "either"
  weatherRequirements?: string[]
  materials?: string[]
  cost: "free" | "low" | "medium" | "high"
  educational: boolean
  physical: boolean
  creative: boolean
  social: boolean
}

export type FamilyBudget = {
  id: string
  category: "activities" | "food" | "medical" | "education" | "childcare" | "transportation"
  budgeted: number
  spent: number
  month: string
  year: number
}

export type EmergencyContact = {
  id: string
  name: string
  relationship: string
  phone: string
  email?: string
  address?: string
  canPickupChildren: boolean
  hasKeys: boolean
}

export type BabysitterInfo = {
  id: string
  name: string
  phone: string
  email?: string
  hourlyRate: number
  availability: {
    [key: string]: string[] // day: time slots
  }
  certifications: string[]
  experience: string
  references: string[]
  emergencyTrained: boolean
}

export type SchoolInfo = {
  id: string
  name: string
  address: string
  phone: string
  principalName: string
  teacherName?: string
  grade?: string
  startTime: string
  endTime: string
  holidays: string[]
  importantDates: {
    date: string
    event: string
    description?: string
  }[]
}

export type FamilyCalendarSettings = {
  workingParents: boolean
  numberOfChildren: number
  childrenAges: number[]
  schoolDistrict?: string
  timeZone: string
  weekStartsOn: number
  defaultEventDuration: number
  bedtimeRoutineEnabled: boolean
  mealPlanningEnabled: boolean
  choreTrackingEnabled: boolean
  budgetTrackingEnabled: boolean
  weatherIntegration: boolean
  carpoolCoordination: boolean
}

export type WeatherInfo = {
  date: string
  temperature: {
    high: number
    low: number
  }
  conditions: string
  precipitation: number
  windSpeed: number
  suitable: {
    outdoor: boolean
    playground: boolean
    sports: boolean
    walking: boolean
  }
}

export type FamilyInsight = {
  id: string
  type: "suggestion" | "warning" | "celebration" | "reminder"
  title: string
  message: string
  actionable: boolean
  action?: string
  priority: "low" | "medium" | "high"
  relatedEvents?: number[]
  relatedMembers?: string[]
  createdAt: string
}
