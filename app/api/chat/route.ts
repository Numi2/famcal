import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"
import { NextResponse } from "next/server"
import { FamilyCalendarPresenter } from "@/lib/family/presenter"
import { FamilyCalendarController } from "@/lib/family/controller"

// Family Calendar AI system prompt
const familyCalendarSystemPrompt = `
You are an AI assistant for a Family Calendar application called Lovy-tech Family Calendar.
Your purpose is to help families with small children manage their daily lives more efficiently and joyfully.

FAMILY CONTEXT:
You're helping families with children aged 0-18 manage their complex schedules, including:
- School schedules and activities
- Medical appointments and health tracking
- Meal planning and nutrition
- Chore assignments and responsibility teaching
- Family bonding time and activities
- Bedtime routines and sleep schedules
- Playdates and social development
- Budget management for family activities
- Emergency preparedness and safety

CAPABILITIES:
- Manage family events for multiple family members
- Suggest age-appropriate activities based on weather and time
- Help with meal planning considering allergies and preferences
- Coordinate chores and teach responsibility to children
- Track medical appointments and health information
- Provide parenting tips and family activity suggestions
- Help balance work, family time, and individual needs
- Suggest solutions for common family scheduling conflicts

FAMILY-SPECIFIC FEATURES:
- Color-coded events by family member
- Age-appropriate activity suggestions
- Allergy and dietary restriction awareness
- School calendar integration
- Bedtime routine management
- Carpool coordination
- Emergency contact management
- Budget tracking for family activities

When responding:
1. Be warm, supportive, and understanding of family challenges
2. Consider the ages and needs of all family members
3. Prioritize safety and age-appropriateness
4. Offer practical, actionable solutions
5. Be encouraging about family bonding and child development
6. Consider budget constraints and time limitations
7. Suggest ways to involve children in planning and responsibility
8. Provide gentle reminders about important family routines

Remember: You're not just managing a calendar, you're helping create happy family memories and teaching life skills to children.
`

// Family-specific AI tools
const familyCalendarTools = [
  {
    name: "getFamilyMembers",
    description: "Get information about all family members",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
      try {
        return FamilyCalendarPresenter.formatFamilyMembers(FamilyCalendarController.getFamilyMembers())
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "getChildrenInfo",
    description: "Get information specifically about the children in the family",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
      try {
        return FamilyCalendarPresenter.formatFamilyMembers(FamilyCalendarController.getChildren())
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "getFamilyEventsByDay",
    description: "Get all family events for a specific day",
    parameters: {
      type: "object",
      properties: {
        day: {
          type: "number",
          description: "Day of the week (1-7, where 1 is Sunday)",
        },
      },
      required: ["day"],
    },
    handler: async ({ day }) => {
      try {
        return FamilyCalendarPresenter.getFormattedFamilyEventsByDay(day)
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "getChildrenSchedule",
    description: "Get the schedule for all children, optionally for a specific day",
    parameters: {
      type: "object",
      properties: {
        day: {
          type: "number",
          description: "Day of the week (1-7, where 1 is Sunday). Optional - if not provided, returns all days",
        },
      },
      required: [],
    },
    handler: async ({ day }) => {
      try {
        return FamilyCalendarPresenter.getFormattedChildrenSchedule(day)
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "getMealPlansByDay",
    description: "Get meal plans for a specific day",
    parameters: {
      type: "object",
      properties: {
        day: {
          type: "number",
          description: "Day of the week (1-7, where 1 is Sunday)",
        },
      },
      required: ["day"],
    },
    handler: async ({ day }) => {
      try {
        const meals = FamilyCalendarController.getMealPlansByDay(day)
        return FamilyCalendarPresenter.formatMealPlans(meals)
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "suggestMealsForFamily",
    description: "Get meal suggestions based on family preferences and restrictions",
    parameters: {
      type: "object",
      properties: {
        kidFriendly: {
          type: "boolean",
          description: "Whether meals should be kid-friendly",
        },
        allergies: {
          type: "array",
          items: { type: "string" },
          description: "List of allergies to avoid",
        },
        difficulty: {
          type: "string",
          enum: ["easy", "medium", "hard"],
          description: "Cooking difficulty level",
        },
        prepTime: {
          type: "number",
          description: "Maximum preparation time in minutes",
        },
      },
      required: [],
    },
    handler: async (preferences) => {
      try {
        return FamilyCalendarPresenter.getFormattedMealSuggestions(preferences)
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "getChoresByChild",
    description: "Get chore assignments for all children",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
      try {
        const choresByChild = FamilyCalendarController.getChoresByChild()
        const formatted = {}
        Object.keys(choresByChild).forEach((childName) => {
          formatted[childName] = FamilyCalendarPresenter.formatChoreAssignments(choresByChild[childName])
        })
        return formatted
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "suggestActivitiesForFamily",
    description: "Get activity suggestions based on children's ages and preferences",
    parameters: {
      type: "object",
      properties: {
        childAge: {
          type: "number",
          description: "Age of child for age-appropriate suggestions",
        },
        location: {
          type: "string",
          enum: ["indoor", "outdoor", "either"],
          description: "Whether activity should be indoor or outdoor",
        },
        duration: {
          type: "number",
          description: "Maximum duration in minutes",
        },
        cost: {
          type: "string",
          enum: ["free", "low", "medium", "high"],
          description: "Cost level for the activity",
        },
        weather: {
          type: "string",
          description: "Current weather conditions",
        },
      },
      required: [],
    },
    handler: async (filters) => {
      try {
        return FamilyCalendarPresenter.getFormattedActivitySuggestions(filters)
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "getUpcomingMedicalAppointments",
    description: "Get all upcoming medical appointments for family members",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
      try {
        const appointments = FamilyCalendarController.getUpcomingMedicalAppointments()
        return FamilyCalendarPresenter.formatFamilyEvents(appointments)
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "getFamilyInsights",
    description: "Get AI-generated insights and suggestions for the family",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
      try {
        return FamilyCalendarPresenter.getFormattedFamilyInsights()
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "generateFamilyDaySummary",
    description: "Generate a natural language summary of a family's day",
    parameters: {
      type: "object",
      properties: {
        day: {
          type: "number",
          description: "Day of the week (1-7, where 1 is Sunday)",
        },
      },
      required: ["day"],
    },
    handler: async ({ day }) => {
      try {
        return FamilyCalendarPresenter.generateFamilyDaySummary(day)
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "generateWeeklyFamilyReport",
    description: "Generate a comprehensive weekly report for the family",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
      try {
        return FamilyCalendarPresenter.generateWeeklyFamilyReport()
      } catch (error) {
        return { error: error.message }
      }
    },
  },
  {
    name: "getFamilyBudgetSummary",
    description: "Get the family budget summary and spending analysis",
    parameters: {
      type: "object",
      properties: {},
      required: [],
    },
    handler: async () => {
      try {
        return FamilyCalendarController.getFamilyBudgetSummary()
      } catch (error) {
        return { error: error.message }
      }
    },
  },
]

export async function POST(req: Request) {
  try {
    const { messages } = await req.json()

    const result = await streamText({
      model: openai("gpt-4o"),
      system: familyCalendarSystemPrompt,
      messages,
      maxTokens: 1500,
      tools: familyCalendarTools,
      temperature: 0.7,
    })

    return result.toDataStreamResponse()
  } catch (error) {
    console.error("Error in family calendar chat API:", error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 })
  }
}
