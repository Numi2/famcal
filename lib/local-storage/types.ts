// Local Storage Types

export interface Family {
  id: string;
  name: string;
  description?: string;
  created_at: string;
}

export interface FamilyMember {
  id: string;
  family_id: string;
  name: string;
  email?: string;
  role: 'parent' | 'child';
  color?: string;
  avatar_url?: string;
  created_at: string;
}

export interface CalendarEvent {
  id: string;
  family_id: string;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
  location?: string;
  category: 'appointment' | 'school' | 'activity' | 'meal' | 'other';
  attendees: string[]; // Array of member IDs
  recurring?: boolean;
  recurrence_pattern?: string;
  color?: string;
  created_at: string;
  updated_at: string;
}

export interface LocalStorageData {
  currentFamilyId?: string;
  families: Family[];
  familyMembers: FamilyMember[];
  events: CalendarEvent[];
}

export interface EventFilter {
  familyId?: string;
  startDate?: Date;
  endDate?: Date;
  category?: string;
  attendeeId?: string;
}