// Simplified database schema with only 3 event types
export const EVENT_TYPES = {
  CHORE: 'chore',
  MEAL: 'meal', 
  ACTIVITY: 'activity'
} as const

export type EventType = typeof EVENT_TYPES[keyof typeof EVENT_TYPES]

// Centralized table names
export const TABLES = {
  PROFILES: 'profiles',
  FAMILIES: 'families',
  FAMILY_MEMBERS: 'family_members',
  EVENTS: 'events' // Simplified from family_events
} as const

// Event schema for validation
import { z } from 'zod'

export const eventBaseSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  date: z.string().datetime(),
  familyId: z.string().uuid(),
  assignedTo: z.array(z.string().uuid()).default([]),
  createdBy: z.string().uuid()
})

export const choreEventSchema = eventBaseSchema.extend({
  type: z.literal(EVENT_TYPES.CHORE),
  points: z.number().min(0).max(100).optional(),
  recurring: z.boolean().default(false),
  completed: z.boolean().default(false),
  completedAt: z.string().datetime().optional(),
  completedBy: z.string().uuid().optional()
})

export const mealEventSchema = eventBaseSchema.extend({
  type: z.literal(EVENT_TYPES.MEAL),
  mealTime: z.enum(['breakfast', 'lunch', 'dinner', 'snack']),
  prepTime: z.number().min(0).max(300).optional(), // minutes
  servings: z.number().min(1).max(20).optional()
})

export const activityEventSchema = eventBaseSchema.extend({
  type: z.literal(EVENT_TYPES.ACTIVITY),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().max(200).optional(),
  cost: z.number().min(0).optional()
})

// Union type for all events
export const eventSchema = z.discriminatedUnion('type', [
  choreEventSchema,
  mealEventSchema,
  activityEventSchema
])

export type ChoreEvent = z.infer<typeof choreEventSchema>
export type MealEvent = z.infer<typeof mealEventSchema>
export type ActivityEvent = z.infer<typeof activityEventSchema>
export type Event = z.infer<typeof eventSchema>

// Family member schema
export const familyMemberSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid().optional(),
  familyId: z.string().uuid(),
  fullName: z.string().min(1).max(100),
  role: z.enum(['parent', 'child', 'caregiver']),
  color: z.string().default('#3b82f6'),
  avatarUrl: z.string().url().optional()
})

export type FamilyMember = z.infer<typeof familyMemberSchema>

// Family schema
export const familySchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1).max(100),
  createdBy: z.string().uuid()
})

export type Family = z.infer<typeof familySchema>