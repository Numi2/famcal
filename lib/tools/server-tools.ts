import { z } from 'zod'
import { tool } from 'ai'
import type { SecureFamilyDb } from '@/lib/db/client'
import { EVENT_TYPES } from '@/lib/db/schema'

// Create tools factory that uses server DB client
export function createServerTools(db: SecureFamilyDb, userId: string, familyId: string) {
  return {
    // List events
    listEvents: tool({
      description: 'List family events with optional filters',
      parameters: z.object({
        type: z.enum(['chore', 'meal', 'activity']).optional(),
        startDate: z.string().optional(),
        endDate: z.string().optional(),
        assignedTo: z.string().optional()
      }),
      async execute(params) {
        const result = await db.getEvents(familyId, {
          type: params.type,
          startDate: params.startDate,
          endDate: params.endDate,
          assignedTo: params.assignedTo,
          limit: 20
        })
        
        return {
          events: result.events,
          total: result.total,
          familyId
        }
      }
    }),

    // Create chore
    createChore: tool({
      description: 'Create a new chore assignment',
      parameters: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string().datetime(),
        assignedTo: z.array(z.string()).default([]),
        points: z.number().min(0).max(100).optional(),
        recurring: z.boolean().default(false)
      }),
      async execute(params) {
        const chore = await db.createEvent({
          type: EVENT_TYPES.CHORE,
          title: params.title,
          description: params.description,
          date: params.date,
          familyId,
          assignedTo: params.assignedTo,
          createdBy: userId,
          points: params.points,
          recurring: params.recurring,
          completed: false
        })
        
        return chore
      }
    }),

    // Create meal
    createMeal: tool({
      description: 'Plan a meal for the family',
      parameters: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string().datetime(),
        mealTime: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
        prepTime: z.number().optional(),
        servings: z.number().optional()
      }),
      async execute(params) {
        const meal = await db.createEvent({
          type: EVENT_TYPES.MEAL,
          title: params.title,
          description: params.description,
          date: params.date,
          familyId,
          assignedTo: [],
          createdBy: userId,
          mealTime: params.mealTime,
          prepTime: params.prepTime,
          servings: params.servings
        })
        
        return meal
      }
    }),

    // Create activity
    createActivity: tool({
      description: 'Schedule a family activity',
      parameters: z.object({
        title: z.string(),
        description: z.string().optional(),
        date: z.string().datetime(),
        startTime: z.string().datetime(),
        endTime: z.string().datetime(),
        location: z.string().optional(),
        cost: z.number().optional(),
        assignedTo: z.array(z.string()).default([])
      }),
      async execute(params) {
        const activity = await db.createEvent({
          type: EVENT_TYPES.ACTIVITY,
          title: params.title,
          description: params.description,
          date: params.date,
          familyId,
          assignedTo: params.assignedTo,
          createdBy: userId,
          startTime: params.startTime,
          endTime: params.endTime,
          location: params.location,
          cost: params.cost
        })
        
        return activity
      }
    }),

    // Complete chore
    completeChore: tool({
      description: 'Mark a chore as completed',
      parameters: z.object({
        choreId: z.string()
      }),
      async execute(params) {
        const chore = await db.completeChore(params.choreId)
        return {
          success: true,
          chore
        }
      }
    }),

    // Get family members
    getFamilyMembers: tool({
      description: 'Get all family members',
      parameters: z.object({}),
      async execute() {
        const members = await db.getFamilyMembers(familyId)
        return {
          members,
          familyId
        }
      }
    }),

    // Get today's schedule
    getTodaySchedule: tool({
      description: 'Get all events for today',
      parameters: z.object({}),
      async execute() {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)
        
        const result = await db.getEvents(familyId, {
          startDate: today.toISOString(),
          endDate: tomorrow.toISOString()
        })
        
        return {
          date: today.toISOString().split('T')[0],
          events: result.events,
          total: result.total
        }
      }
    }),

    // Get week schedule
    getWeekSchedule: tool({
      description: 'Get events for the current week',
      parameters: z.object({}),
      async execute() {
        const today = new Date()
        const startOfWeek = new Date(today)
        startOfWeek.setDate(today.getDate() - today.getDay())
        startOfWeek.setHours(0, 0, 0, 0)
        
        const endOfWeek = new Date(startOfWeek)
        endOfWeek.setDate(startOfWeek.getDate() + 7)
        
        const result = await db.getEvents(familyId, {
          startDate: startOfWeek.toISOString(),
          endDate: endOfWeek.toISOString()
        })
        
        return {
          weekStart: startOfWeek.toISOString().split('T')[0],
          weekEnd: endOfWeek.toISOString().split('T')[0],
          events: result.events,
          total: result.total
        }
      }
    })
  }
}