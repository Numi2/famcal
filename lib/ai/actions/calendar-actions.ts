import { createClient } from '@/lib/supabase/server';
import { CalendarEvent, ConflictResolution, ResolutionSuggestion } from '../types';
import { addMinutes, parseISO, format, isWithinInterval } from 'date-fns';

export class CalendarActions {
  private userId: string;
  private familyId: string;

  constructor(userId: string, familyId: string) {
    this.userId = userId;
    this.familyId = familyId;
  }

  async createEvent(params: {
    title: string;
    startTime: string;
    endTime: string;
    participants: string[];
    location?: string;
    description?: string;
    category?: string;
    recurring?: any;
    reminders?: any[];
  }): Promise<{ success: boolean; event?: CalendarEvent; error?: string }> {
    try {
      const supabase = await createClient();

      // Check for conflicts
      const conflicts = await this.checkConflicts({
        startTime: params.startTime,
        endTime: params.endTime,
        participants: params.participants
      });

      if (conflicts.hasConflicts) {
        return {
          success: false,
          error: `Schedule conflict detected: ${conflicts.conflicts[0].description}`
        };
      }

      // Create the event
      const { data, error } = await supabase
        .from('calendar_events')
        .insert({
          family_id: this.familyId,
          title: params.title,
          start_time: params.startTime,
          end_time: params.endTime,
          participants: params.participants,
          location: params.location,
          description: params.description,
          category: params.category,
          recurring: params.recurring,
          reminders: params.reminders,
          created_by: this.userId
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Send notifications to participants
      await this.notifyParticipants(data.id, params.participants, 'new_event');

      return {
        success: true,
        event: this.mapToCalendarEvent(data)
      };
    } catch (error) {
      console.error('Error creating event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event'
      };
    }
  }

  async updateEvent(params: {
    eventId: string;
    updates: Partial<{
      title: string;
      startTime: string;
      endTime: string;
      participants: string[];
      location: string;
      description: string;
      category: string;
    }>;
  }): Promise<{ success: boolean; event?: CalendarEvent; error?: string }> {
    try {
      const supabase = await createClient();

      // If time is being updated, check for conflicts
      if (params.updates.startTime || params.updates.endTime) {
        const { data: currentEvent } = await supabase
          .from('calendar_events')
          .select('*')
          .eq('id', params.eventId)
          .single();

        if (currentEvent) {
          const conflicts = await this.checkConflicts({
            startTime: params.updates.startTime || currentEvent.start_time,
            endTime: params.updates.endTime || currentEvent.end_time,
            participants: params.updates.participants || currentEvent.participants,
            excludeEventId: params.eventId
          });

          if (conflicts.hasConflicts) {
            return {
              success: false,
              error: `Schedule conflict detected: ${conflicts.conflicts[0].description}`
            };
          }
        }
      }

      // Update the event
      const { data, error } = await supabase
        .from('calendar_events')
        .update({
          ...params.updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', params.eventId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Notify participants of changes
      await this.notifyParticipants(data.id, data.participants, 'event_updated');

      return {
        success: true,
        event: this.mapToCalendarEvent(data)
      };
    } catch (error) {
      console.error('Error updating event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update event'
      };
    }
  }

  async deleteEvent(params: {
    eventId: string;
    deleteRecurring?: 'single' | 'all' | 'future';
  }): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = await createClient();

      // Get event details for notification
      const { data: event } = await supabase
        .from('calendar_events')
        .select('participants')
        .eq('id', params.eventId)
        .single();

      if (params.deleteRecurring === 'all') {
        // Delete all instances of recurring event
        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('recurring_id', params.eventId);

        if (error) throw error;
      } else if (params.deleteRecurring === 'future') {
        // Delete future instances only
        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('recurring_id', params.eventId)
          .gte('start_time', new Date().toISOString());

        if (error) throw error;
      } else {
        // Delete single event
        const { error } = await supabase
          .from('calendar_events')
          .delete()
          .eq('id', params.eventId);

        if (error) throw error;
      }

      // Notify participants
      if (event) {
        await this.notifyParticipants(params.eventId, event.participants, 'event_cancelled');
      }

      return { success: true };
    } catch (error) {
      console.error('Error deleting event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete event'
      };
    }
  }

  async findAvailableSlot(params: {
    duration: number;
    participants: string[];
    startDate: string;
    endDate: string;
    preferredTimes?: any;
    constraints?: any;
  }): Promise<{ availableSlots: any[]; error?: string }> {
    try {
      const supabase = await createClient();
      const slots: any[] = [];

      // Get all events for participants in date range
      const { data: events } = await supabase
        .from('calendar_events')
        .select('*')
        .contains('participants', params.participants)
        .gte('start_time', params.startDate)
        .lte('end_time', params.endDate)
        .order('start_time');

      // Parse dates
      const searchStart = parseISO(params.startDate);
      const searchEnd = parseISO(params.endDate);
      const currentDate = new Date(searchStart);

      // Iterate through each day
      while (currentDate <= searchEnd) {
        const daySlots = this.findDaySlots(
          currentDate,
          params.duration,
          events || [],
          params.preferredTimes,
          params.constraints
        );
        slots.push(...daySlots);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      // Sort by score (best slots first) and limit results
      slots.sort((a, b) => b.score - a.score);
      
      return {
        availableSlots: slots.slice(0, 10)
      };
    } catch (error) {
      console.error('Error finding available slots:', error);
      return {
        availableSlots: [],
        error: error instanceof Error ? error.message : 'Failed to find available slots'
      };
    }
  }

  async checkConflicts(params: {
    startTime: string;
    endTime: string;
    participants: string[];
    excludeEventId?: string;
  }): Promise<{ hasConflicts: boolean; conflicts: any[] }> {
    try {
      const supabase = await createClient();

      // Query for overlapping events
      let query = supabase
        .from('calendar_events')
        .select('*')
        .or(params.participants.map(p => `participants.cs.{${p}}`).join(','))
        .lte('start_time', params.endTime)
        .gte('end_time', params.startTime);

      if (params.excludeEventId) {
        query = query.neq('id', params.excludeEventId);
      }

      const { data: conflicts } = await query;

      if (!conflicts || conflicts.length === 0) {
        return { hasConflicts: false, conflicts: [] };
      }

      // Format conflict information
      const formattedConflicts = conflicts.map(event => ({
        eventId: event.id,
        title: event.title,
        startTime: event.start_time,
        endTime: event.end_time,
        participants: event.participants,
        description: `Conflicts with "${event.title}" from ${format(parseISO(event.start_time), 'h:mm a')} to ${format(parseISO(event.end_time), 'h:mm a')}`
      }));

      return {
        hasConflicts: true,
        conflicts: formattedConflicts
      };
    } catch (error) {
      console.error('Error checking conflicts:', error);
      return { hasConflicts: false, conflicts: [] };
    }
  }

  private findDaySlots(
    date: Date,
    duration: number,
    events: any[],
    preferredTimes: any,
    constraints: any
  ): any[] {
    const slots: any[] = [];
    const dayEvents = events.filter(e => {
      const eventDate = parseISO(e.start_time);
      return eventDate.toDateString() === date.toDateString();
    });

    // Define time ranges for the day
    const timeRanges = [
      { 
        start: this.setTime(date, preferredTimes?.morningStart || '08:00'),
        end: this.setTime(date, preferredTimes?.morningEnd || '12:00'),
        period: 'morning'
      },
      {
        start: this.setTime(date, preferredTimes?.afternoonStart || '12:00'),
        end: this.setTime(date, preferredTimes?.afternoonEnd || '17:00'),
        period: 'afternoon'
      },
      {
        start: this.setTime(date, preferredTimes?.eveningStart || '17:00'),
        end: this.setTime(date, preferredTimes?.eveningEnd || '21:00'),
        period: 'evening'
      }
    ];

    // Check each time range
    for (const range of timeRanges) {
      let currentTime = new Date(range.start);
      
      while (addMinutes(currentTime, duration) <= range.end) {
        const slotEnd = addMinutes(currentTime, duration);
        
        // Check if slot is available
        const isAvailable = !dayEvents.some(event => {
          const eventStart = parseISO(event.start_time);
          const eventEnd = parseISO(event.end_time);
          return (
            (currentTime >= eventStart && currentTime < eventEnd) ||
            (slotEnd > eventStart && slotEnd <= eventEnd) ||
            (currentTime <= eventStart && slotEnd >= eventEnd)
          );
        });

        if (isAvailable) {
          // Calculate score based on preferences
          let score = 50; // Base score
          
          // Prefer certain times of day
          if (range.period === 'afternoon') score += 10;
          if (range.period === 'morning') score += 5;
          
          // Apply constraints
          if (constraints?.preferWeekend && (date.getDay() === 0 || date.getDay() === 6)) {
            score += 20;
          }

          slots.push({
            startTime: currentTime.toISOString(),
            endTime: slotEnd.toISOString(),
            period: range.period,
            score,
            date: format(date, 'EEEE, MMMM d'),
            time: `${format(currentTime, 'h:mm a')} - ${format(slotEnd, 'h:mm a')}`
          });
        }

        // Move to next slot
        currentTime = addMinutes(currentTime, 15); // Check every 15 minutes
      }
    }

    return slots;
  }

  private setTime(date: Date, timeString: string): Date {
    const [hours, minutes] = timeString.split(':').map(Number);
    const newDate = new Date(date);
    newDate.setHours(hours, minutes, 0, 0);
    return newDate;
  }

  private async notifyParticipants(eventId: string, participants: string[], type: string) {
    // Implementation for sending notifications
    // This would integrate with your notification system
    console.log(`Notifying participants ${participants.join(', ')} about ${type} for event ${eventId}`);
  }

  private mapToCalendarEvent(data: any): CalendarEvent {
    return {
      id: data.id,
      title: data.title,
      startTime: new Date(data.start_time),
      endTime: new Date(data.end_time),
      participants: data.participants,
      location: data.location,
      description: data.description,
      category: data.category,
      recurring: data.recurring,
      reminders: data.reminders,
      createdBy: data.created_by,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  }
}