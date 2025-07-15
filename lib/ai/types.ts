// Core types for the AI agent system

export interface AIIntent {
  type: IntentType;
  confidence: number;
  parameters: Record<string, any>;
  entities: Entity[];
}

export enum IntentType {
  CREATE_EVENT = 'CREATE_EVENT',
  UPDATE_EVENT = 'UPDATE_EVENT',
  DELETE_EVENT = 'DELETE_EVENT',
  SEARCH_EVENTS = 'SEARCH_EVENTS',
  FIND_AVAILABILITY = 'FIND_AVAILABILITY',
  GET_SUGGESTIONS = 'GET_SUGGESTIONS',
  UPDATE_PREFERENCES = 'UPDATE_PREFERENCES',
  GENERAL_QUERY = 'GENERAL_QUERY',
  UNKNOWN = 'UNKNOWN'
}

export interface Entity {
  type: EntityType;
  value: string;
  normalized?: any;
  confidence: number;
}

export enum EntityType {
  DATE_TIME = 'DATE_TIME',
  DURATION = 'DURATION',
  PERSON = 'PERSON',
  LOCATION = 'LOCATION',
  ACTIVITY = 'ACTIVITY',
  RECURRENCE = 'RECURRENCE'
}

export interface CalendarEvent {
  id: string;
  title: string;
  startTime: Date;
  endTime: Date;
  participants: string[];
  location?: string;
  description?: string;
  category?: EventCategory;
  recurring?: RecurringPattern;
  reminders?: Reminder[];
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export type EventCategory = 'appointment' | 'activity' | 'meal' | 'chore' | 'school' | 'other';

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  until?: Date;
  daysOfWeek?: number[]; // 0=Sunday, 6=Saturday
  exceptions?: Date[]; // Dates to skip
}

export interface Reminder {
  id: string;
  minutes: number; // Minutes before event
  type: 'notification' | 'email' | 'sms';
  sent: boolean;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'parent' | 'child' | 'guardian';
  age?: number;
  preferences: MemberPreferences;
  avatar?: string;
}

export interface MemberPreferences {
  favoriteActivities: string[];
  dietaryRestrictions: string[];
  bedtime?: string; // HH:MM format
  wakeTime?: string; // HH:MM format
  schoolSchedule?: SchoolSchedule;
  activityPreferences: ActivityPreference[];
}

export interface SchoolSchedule {
  schoolName: string;
  startTime: string;
  endTime: string;
  daysOfWeek: number[];
  vacations: DateRange[];
}

export interface ActivityPreference {
  type: string;
  preferredTimes: TimePreference[];
  maxPerWeek?: number;
  duration?: number; // in minutes
}

export interface TimePreference {
  dayOfWeek?: number;
  startTime: string;
  endTime: string;
  priority: 'high' | 'medium' | 'low';
}

export interface DateRange {
  start: Date;
  end: Date;
}

export interface AIContext {
  userId: string;
  familyId: string;
  familyMembers: FamilyMember[];
  recentEvents: CalendarEvent[];
  upcomingEvents: CalendarEvent[];
  preferences: FamilyPreferences;
  lastInteraction?: Date;
}

export interface FamilyPreferences {
  mealTimes: {
    breakfast?: string;
    lunch?: string;
    dinner?: string;
  };
  quietHours: TimeRange[];
  vacationDates: DateRange[];
  importantDates: ImportantDate[];
}

export interface TimeRange {
  startTime: string;
  endTime: string;
}

export interface ImportantDate {
  date: Date;
  description: string;
  recurring: boolean;
}

export interface AIAction {
  id: string;
  type: string;
  parameters: Record<string, any>;
  status: 'pending' | 'confirmed' | 'executed' | 'failed' | 'cancelled';
  result?: any;
  error?: string;
  userId: string;
  timestamp: Date;
}

export interface ConflictResolution {
  conflictType: 'time' | 'location' | 'participant';
  affectedEvents: CalendarEvent[];
  suggestions: ResolutionSuggestion[];
}

export interface ResolutionSuggestion {
  type: 'reschedule' | 'cancel' | 'modify_participants' | 'change_location';
  description: string;
  newStartTime?: Date;
  newEndTime?: Date;
  newParticipants?: string[];
  newLocation?: string;
  confidence: number;
}

export interface AIResponse {
  message: string;
  actions?: AIAction[];
  suggestions?: string[];
  requiresConfirmation: boolean;
  metadata?: Record<string, any>;
}