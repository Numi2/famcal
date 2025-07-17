import { createClient } from '@/lib/supabase/server'
import type { SupabaseClient } from '@supabase/supabase-js'
import { TABLES, type Event, eventSchema, type FamilyMember, type Family } from './schema'
import { ApiError } from '@/lib/utils/errors'

export class SecureFamilyDb {
  constructor(
    private supabase: SupabaseClient,
    private userId: string
  ) {}

  // Verify user has access to family
  private async verifyFamilyAccess(familyId: string): Promise<void> {
    const { data, error } = await this.supabase
      .from(TABLES.FAMILY_MEMBERS)
      .select('id')
      .eq('family_id', familyId)
      .eq('user_id', this.userId)
      .single()

    if (error || !data) {
      throw new ApiError(403, 'You do not have access to this family')
    }
  }

  // Get user's families
  async getUserFamilies(): Promise<Family[]> {
    const { data, error } = await this.supabase
      .from(TABLES.FAMILY_MEMBERS)
      .select(`
        family_id,
        families!inner (
          id,
          name,
          created_by
        )
      `)
      .eq('user_id', this.userId)

    if (error) throw new ApiError(500, 'Failed to fetch families', error)
    
    return data?.map(item => item.families as unknown as Family) || []
  }

  // Get family members (with access check)
  async getFamilyMembers(familyId: string): Promise<FamilyMember[]> {
    await this.verifyFamilyAccess(familyId)

    const { data, error } = await this.supabase
      .from(TABLES.FAMILY_MEMBERS)
      .select('*')
      .eq('family_id', familyId)
      .order('role')
      .order('full_name')

    if (error) throw new ApiError(500, 'Failed to fetch family members', error)
    
    return data?.map(member => ({
      id: member.id,
      userId: member.user_id,
      familyId: member.family_id,
      fullName: member.full_name,
      role: member.role,
      color: member.color || '#3b82f6',
      avatarUrl: member.avatar_url
    })) || []
  }

  // Create event (with validation and access check)
  async createEvent(eventData: Event): Promise<Event> {
    await this.verifyFamilyAccess(eventData.familyId)
    
    // Validate event data
    const validatedEvent = eventSchema.parse(eventData)
    
    // Ensure createdBy matches authenticated user
    if (validatedEvent.createdBy !== this.userId) {
      throw new ApiError(403, 'Cannot create events for other users')
    }

    // Map to database format
    const dbEvent = {
      type: validatedEvent.type,
      title: validatedEvent.title,
      description: validatedEvent.description,
      date: validatedEvent.date,
      family_id: validatedEvent.familyId,
      assigned_to: validatedEvent.assignedTo,
      created_by: this.userId,
      // Type-specific fields
      ...(validatedEvent.type === 'chore' && {
        points: validatedEvent.points,
        recurring: validatedEvent.recurring,
        completed: validatedEvent.completed
      }),
      ...(validatedEvent.type === 'meal' && {
        meal_time: validatedEvent.mealTime,
        prep_time: validatedEvent.prepTime,
        servings: validatedEvent.servings
      }),
      ...(validatedEvent.type === 'activity' && {
        start_time: validatedEvent.startTime,
        end_time: validatedEvent.endTime,
        location: validatedEvent.location,
        cost: validatedEvent.cost
      })
    }

    const { data, error } = await this.supabase
      .from(TABLES.EVENTS)
      .insert(dbEvent)
      .select()
      .single()

    if (error) throw new ApiError(500, 'Failed to create event', error)
    
    return this.mapDbEventToEvent(data)
  }

  // Get events (with access check and pagination)
  async getEvents(
    familyId: string,
    options?: {
      type?: Event['type']
      startDate?: string
      endDate?: string
      assignedTo?: string
      limit?: number
      offset?: number
    }
  ): Promise<{ events: Event[], total: number }> {
    await this.verifyFamilyAccess(familyId)

    let query = this.supabase
      .from(TABLES.EVENTS)
      .select('*', { count: 'exact' })
      .eq('family_id', familyId)

    // Apply filters
    if (options?.type) {
      query = query.eq('type', options.type)
    }
    if (options?.startDate) {
      query = query.gte('date', options.startDate)
    }
    if (options?.endDate) {
      query = query.lte('date', options.endDate)
    }
    if (options?.assignedTo) {
      query = query.contains('assigned_to', [options.assignedTo])
    }

    // Apply pagination
    const limit = options?.limit || 50
    const offset = options?.offset || 0
    query = query.range(offset, offset + limit - 1)
    query = query.order('date', { ascending: true })

    const { data, error, count } = await query

    if (error) throw new ApiError(500, 'Failed to fetch events', error)

    return {
      events: data?.map(event => this.mapDbEventToEvent(event)) || [],
      total: count || 0
    }
  }

  // Update event (with access check)
  async updateEvent(eventId: string, updates: Partial<Event>): Promise<Event> {
    // First get the event to check family access
    const { data: existingEvent, error: fetchError } = await this.supabase
      .from(TABLES.EVENTS)
      .select('family_id')
      .eq('id', eventId)
      .single()

    if (fetchError || !existingEvent) {
      throw new ApiError(404, 'Event not found')
    }

    await this.verifyFamilyAccess(existingEvent.family_id)

    // Update the event
    const { data, error } = await this.supabase
      .from(TABLES.EVENTS)
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
        updated_by: this.userId
      })
      .eq('id', eventId)
      .select()
      .single()

    if (error) throw new ApiError(500, 'Failed to update event', error)

    return this.mapDbEventToEvent(data)
  }

  // Complete chore (special case for chore events)
  async completeChore(eventId: string): Promise<Event> {
    const event = await this.getEvent(eventId)
    
    if (event.type !== 'chore') {
      throw new ApiError(400, 'Only chore events can be marked as completed')
    }

    return this.updateEvent(eventId, {
      completed: true,
      completedAt: new Date().toISOString(),
      completedBy: this.userId
    })
  }

  // Get single event
  private async getEvent(eventId: string): Promise<Event> {
    const { data, error } = await this.supabase
      .from(TABLES.EVENTS)
      .select('*')
      .eq('id', eventId)
      .single()

    if (error || !data) {
      throw new ApiError(404, 'Event not found')
    }

    await this.verifyFamilyAccess(data.family_id)
    
    return this.mapDbEventToEvent(data)
  }

  // Map database event to typed event
  private mapDbEventToEvent(dbEvent: any): Event {
    const base = {
      id: dbEvent.id,
      title: dbEvent.title,
      description: dbEvent.description,
      date: dbEvent.date,
      familyId: dbEvent.family_id,
      assignedTo: dbEvent.assigned_to || [],
      createdBy: dbEvent.created_by
    }

    switch (dbEvent.type) {
      case 'chore':
        return {
          ...base,
          type: 'chore',
          points: dbEvent.points,
          recurring: dbEvent.recurring || false,
          completed: dbEvent.completed || false,
          completedAt: dbEvent.completed_at,
          completedBy: dbEvent.completed_by
        }
      case 'meal':
        return {
          ...base,
          type: 'meal',
          mealTime: dbEvent.meal_time,
          prepTime: dbEvent.prep_time,
          servings: dbEvent.servings
        }
      case 'activity':
        return {
          ...base,
          type: 'activity',
          startTime: dbEvent.start_time,
          endTime: dbEvent.end_time,
          location: dbEvent.location,
          cost: dbEvent.cost
        }
      default:
        throw new ApiError(500, `Unknown event type: ${dbEvent.type}`)
    }
  }
}

// Factory function to create secure db client
export async function createSecureDbClient(userId: string) {
  const supabase = await createClient()
  return new SecureFamilyDb(supabase, userId)
}