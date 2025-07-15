a comprehensive DB.MD file that explains how to implement the database structure to support the AI agent functionality.

## Overview
This document provides a complete guide for implementing the database infrastructure required to support the AI agent in the family calendar application. The database is designed using PostgreSQL (via Supabase) with a focus on performance, security, and scalability.

## Table of Contents
1. [Database Architecture](#database-architecture)
2. [Core Tables](#core-tables)
3. [AI-Specific Tables](#ai-specific-tables)
4. [Relationships & Constraints](#relationships--constraints)
5. [Indexes & Performance](#indexes--performance)
6. [Row Level Security](#row-level-security)
7. [Migration Scripts](#migration-scripts)
8. [Data Seeding](#data-seeding)
9. [Integration with AI Agent](#integration-with-ai-agent)
10. [Maintenance & Optimization](#maintenance--optimization)

## Database Architecture

### Entity Relationship Diagram
\`\`\`
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    families     │     │    profiles     │     │ family_members  │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │←───┤│ id (PK)         │     │ id (PK)         │
│ name            │     │ email           │     │ family_id (FK)  │
│ created_at      │     │ family_id (FK)  │     │ user_id (FK)    │
│ settings        │     │ role            │     │ name            │
└─────────────────┘     │ created_at      │     │ role            │
                        └─────────────────┘     │ age             │
                                ▲               │ preferences     │
                                │               └─────────────────┘
                                │                        │
┌─────────────────┐     ┌──────┴──────────┐     ┌──────▼──────────┐
│calendar_events  │     │ ai_interactions │     │ai_preferences   │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id (PK)         │     │ id (PK)         │     │ user_id (PK,FK) │
│ family_id (FK)  │     │ user_id (FK)    │     │ language        │
│ title           │     │ family_id (FK)  │     │ voice_enabled   │
│ start_time      │     │ input           │     │ confirmation    │
│ end_time        │     │ intent          │     │ proactive       │
│ participants[]  │     │ actions         │     │ learning        │
│ location        │     │ result          │     └─────────────────┘
│ category        │     │ feedback        │
│ recurring       │     │ tokens_used     │
│ created_by (FK) │     │ created_at      │
└─────────────────┘     └─────────────────┘
\`\`\`

## Core Tables

### 1. Families Table
Stores family group information.

\`\`\`sql
CREATE TABLE families (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  settings JSONB DEFAULT '{
    "timezone": "UTC",
    "locale": "en-US",
    "week_starts_on": 0,
    "default_event_duration": 60,
    "working_hours": {
      "start": "09:00",
      "end": "17:00"
    }
  }'::jsonb,
  subscription_tier VARCHAR(50) DEFAULT 'free',
  ai_usage_quota INTEGER DEFAULT 1000
);

-- Indexes
CREATE INDEX idx_families_created_at ON families(created_at DESC);
CREATE INDEX idx_families_subscription ON families(subscription_tier);
\`\`\`

### 2. Profiles Table
Stores user account information.

\`\`\`sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),
  avatar_url TEXT,
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  role VARCHAR(50) CHECK (role IN ('admin', 'parent', 'member')) DEFAULT 'member',
  phone_number VARCHAR(20),
  notification_preferences JSONB DEFAULT '{
    "email": true,
    "push": true,
    "sms": false,
    "reminder_minutes": [15, 60, 1440]
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen_at TIMESTAMP WITH TIME ZONE
);

-- Indexes
CREATE INDEX idx_profiles_family_id ON profiles(family_id);
CREATE INDEX idx_profiles_email ON profiles(email);
CREATE INDEX idx_profiles_last_seen ON profiles(last_seen_at DESC);
\`\`\`

### 3. Family Members Table
Stores information about all family members (including non-users like children).

\`\`\`sql
CREATE TABLE family_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(50) CHECK (role IN ('parent', 'child', 'guardian', 'other')) NOT NULL,
  birth_date DATE,
  age INTEGER GENERATED ALWAYS AS (
    CASE 
      WHEN birth_date IS NOT NULL 
      THEN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::INTEGER
      ELSE NULL
    END
  ) STORED,
  avatar_url TEXT,
  color VARCHAR(7) DEFAULT '#' || substr(md5(random()::text), 1, 6),
  preferences JSONB DEFAULT '{}'::jsonb,
  medical_info JSONB DEFAULT '{
    "allergies": [],
    "medications": [],
    "conditions": [],
    "emergency_contacts": []
  }'::jsonb,
  school_info JSONB DEFAULT '{
    "school_name": null,
    "grade": null,
    "teacher": null,
    "schedule": null
  }'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true
);

-- Indexes
CREATE INDEX idx_family_members_family_id ON family_members(family_id);
CREATE INDEX idx_family_members_user_id ON family_members(user_id);
CREATE INDEX idx_family_members_active ON family_members(family_id, is_active);
\`\`\`

### 4. Calendar Events Table
Stores all calendar events with AI-enhanced features.

\`\`\`sql
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  all_day BOOLEAN DEFAULT false,
  location VARCHAR(500),
  location_coordinates POINT,
  participants UUID[] NOT NULL DEFAULT '{}',
  category VARCHAR(50) CHECK (category IN (
    'appointment', 'activity', 'meal', 'chore', 
    'school', 'work', 'social', 'other'
  )) DEFAULT 'other',
  status VARCHAR(50) CHECK (status IN (
    'confirmed', 'tentative', 'cancelled'
  )) DEFAULT 'confirmed',
  visibility VARCHAR(50) CHECK (visibility IN (
    'public', 'private', 'family_only'
  )) DEFAULT 'family_only',
  
  -- Recurring event fields
  recurring_pattern JSONB,
  recurring_id UUID,
  is_recurring_instance BOOLEAN DEFAULT false,
  
  -- AI-specific fields
  ai_generated BOOLEAN DEFAULT false,
  ai_confidence DECIMAL(3,2),
  ai_suggestions JSONB,
  auto_scheduled BOOLEAN DEFAULT false,
  
  -- Additional metadata
  color VARCHAR(7),
  reminders JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  tags TEXT[] DEFAULT '{}',
  
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deleted_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_event_times CHECK (end_time > start_time),
  CONSTRAINT valid_ai_confidence CHECK (
    ai_confidence IS NULL OR (ai_confidence >= 0 AND ai_confidence <= 1)
  )
);

-- Indexes for performance
CREATE INDEX idx_events_family_id ON calendar_events(family_id);
CREATE INDEX idx_events_times ON calendar_events(start_time, end_time);
CREATE INDEX idx_events_participants ON calendar_events USING GIN(participants);
CREATE INDEX idx_events_recurring ON calendar_events(recurring_id) WHERE recurring_id IS NOT NULL;
CREATE INDEX idx_events_category ON calendar_events(category);
CREATE INDEX idx_events_status ON calendar_events(status) WHERE status != 'confirmed';
CREATE INDEX idx_events_ai_generated ON calendar_events(ai_generated) WHERE ai_generated = true;
CREATE INDEX idx_events_deleted ON calendar_events(deleted_at) WHERE deleted_at IS NOT NULL;

-- Full text search
CREATE INDEX idx_events_search ON calendar_events USING GIN(
  to_tsvector('english', title || ' ' || COALESCE(description, '') || ' ' || COALESCE(location, ''))
);
\`\`\`

## AI-Specific Tables

### 5. AI Interactions Table
Tracks all AI agent interactions for learning and analytics.

\`\`\`sql
CREATE TABLE ai_interactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  session_id UUID NOT NULL,
  
  -- Request data
  input_text TEXT NOT NULL,
  input_type VARCHAR(50) CHECK (input_type IN ('text', 'voice', 'quick_action')) DEFAULT 'text',
  context JSONB,
  
  -- AI processing
  intent JSONB,
  entities JSONB,
  confidence DECIMAL(3,2),
  
  -- Actions taken
  actions JSONB,
  tools_used TEXT[],
  
  -- Results
  result JSONB,
  response_text TEXT,
  success BOOLEAN,
  error_message TEXT,
  
  -- Performance metrics
  tokens_used INTEGER,
  model_used VARCHAR(100),
  response_time_ms INTEGER,
  
  -- User feedback
  feedback_rating INTEGER CHECK (feedback_rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  helpful BOOLEAN,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for analytics
  INDEX idx_ai_user_session ON ai_interactions(user_id, session_id, created_at DESC),
  INDEX idx_ai_family_time ON ai_interactions(family_id, created_at DESC),
  INDEX idx_ai_intent ON ai_interactions USING GIN(intent),
  INDEX idx_ai_success ON ai_interactions(success, created_at DESC),
  INDEX idx_ai_feedback ON ai_interactions(feedback_rating) WHERE feedback_rating IS NOT NULL
);
\`\`\`

### 6. AI Preferences Table
Stores user-specific AI preferences and settings.

\`\`\`sql
CREATE TABLE ai_preferences (
  user_id UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- Basic preferences
  language VARCHAR(10) DEFAULT 'en',
  voice_enabled BOOLEAN DEFAULT false,
  voice_gender VARCHAR(20) CHECK (voice_gender IN ('male', 'female', 'neutral')) DEFAULT 'neutral',
  
  -- Interaction preferences
  confirmation_required BOOLEAN DEFAULT true,
  auto_accept_suggestions BOOLEAN DEFAULT false,
  proactive_suggestions BOOLEAN DEFAULT true,
  suggestion_frequency VARCHAR(20) CHECK (suggestion_frequency IN (
    'always', 'daily', 'weekly', 'never'
  )) DEFAULT 'daily',
  
  -- Learning preferences
  learning_enabled BOOLEAN DEFAULT true,
  share_anonymous_data BOOLEAN DEFAULT true,
  
  -- Customization
  quick_actions JSONB DEFAULT '[]'::jsonb,
  blocked_actions TEXT[] DEFAULT '{}',
  favorite_commands JSONB DEFAULT '[]'::jsonb,
  custom_wake_word VARCHAR(50),
  
  -- Advanced settings
  max_actions_per_request INTEGER DEFAULT 5,
  require_explicit_confirmation_for TEXT[] DEFAULT '{delete, cancel}',
  time_zone_override VARCHAR(50),
  preferred_event_duration INTEGER DEFAULT 60,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for quick lookups
CREATE INDEX idx_ai_prefs_updated ON ai_preferences(updated_at DESC);
\`\`\`

### 7. AI Learning Table
Stores patterns and insights learned by the AI.

\`\`\`sql
CREATE TABLE ai_learning_patterns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  pattern_type VARCHAR(50) CHECK (pattern_type IN (
    'scheduling', 'preferences', 'routines', 'conflicts', 'suggestions'
  )),
  pattern_data JSONB NOT NULL,
  confidence DECIMAL(3,2),
  occurrences INTEGER DEFAULT 1,
  last_observed TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE,
  
  -- Indexes
  INDEX idx_learning_family ON ai_learning_patterns(family_id, pattern_type),
  INDEX idx_learning_active ON ai_learning_patterns(is_active, confidence DESC)
);
\`\`\`

### 8. AI Task Queue Table
Manages background AI tasks and scheduled actions.

\`\`\`sql
CREATE TABLE ai_task_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  task_type VARCHAR(50) NOT NULL CHECK (task_type IN (
    'suggestion', 'reminder', 'conflict_check', 'optimization', 'notification'
  )),
  priority INTEGER DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  payload JSONB NOT NULL,
  scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(20) CHECK (status IN (
    'pending', 'processing', 'completed', 'failed', 'cancelled'
  )) DEFAULT 'pending',
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  last_attempt_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Indexes for queue processing
  INDEX idx_task_queue_status ON ai_task_queue(status, scheduled_for) 
    WHERE status IN ('pending', 'processing'),
  INDEX idx_task_queue_family ON ai_task_queue(family_id, task_type)
);
\`\`\`

## Relationships & Constraints

### Foreign Key Relationships
\`\`\`sql
-- Ensure referential integrity
ALTER TABLE profiles 
  ADD CONSTRAINT fk_profiles_family 
  FOREIGN KEY (family_id) 
  REFERENCES families(id) 
  ON DELETE SET NULL;

ALTER TABLE family_members
  ADD CONSTRAINT fk_members_family 
  FOREIGN KEY (family_id) 
  REFERENCES families(id) 
  ON DELETE CASCADE;

ALTER TABLE calendar_events
  ADD CONSTRAINT fk_events_family 
  FOREIGN KEY (family_id) 
  REFERENCES families(id) 
  ON DELETE CASCADE;

-- Participant validation trigger
CREATE OR REPLACE FUNCTION validate_event_participants()
RETURNS TRIGGER AS $$
BEGIN
  -- Check if all participants belong to the family
  IF EXISTS (
    SELECT 1 FROM unnest(NEW.participants) AS participant_id
    WHERE participant_id NOT IN (
      SELECT id FROM family_members 
      WHERE family_id = NEW.family_id AND is_active = true
    )
  ) THEN
    RAISE EXCEPTION 'All participants must be active family members';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_event_participants
  BEFORE INSERT OR UPDATE ON calendar_events
  FOR EACH ROW
  EXECUTE FUNCTION validate_event_participants();
\`\`\`

## Indexes & Performance

### Composite Indexes for Common Queries
\`\`\`sql
-- Family dashboard queries
CREATE INDEX idx_events_family_upcoming ON calendar_events(family_id, start_time)
  WHERE status != 'cancelled' AND deleted_at IS NULL;

-- Member schedule queries  
CREATE INDEX idx_events_participant_schedule ON calendar_events(family_id, start_time)
  WHERE status = 'confirmed' AND deleted_at IS NULL;

-- AI pattern matching
CREATE INDEX idx_events_ai_patterns ON calendar_events(family_id, category, start_time)
  WHERE ai_generated = false AND deleted_at IS NULL;

-- Conflict detection
CREATE INDEX idx_events_conflict_check ON calendar_events(family_id, start_time, end_time)
  WHERE status != 'cancelled' AND deleted_at IS NULL;
\`\`\`

### Materialized Views for Analytics
\`\`\`sql
-- Family activity summary
CREATE MATERIALIZED VIEW family_activity_summary AS
SELECT 
  f.id as family_id,
  f.name as family_name,
  COUNT(DISTINCT ce.id) as total_events,
  COUNT(DISTINCT ce.id) FILTER (WHERE ce.ai_generated = true) as ai_events,
  COUNT(DISTINCT ai.id) as ai_interactions,
  AVG(ai.feedback_rating) as avg_ai_rating,
  COUNT(DISTINCT fm.id) as family_members,
  MAX(ce.created_at) as last_event_created,
  MAX(ai.created_at) as last_ai_interaction
FROM families f
LEFT JOIN calendar_events ce ON f.id = ce.family_id
LEFT JOIN ai_interactions ai ON f.id = ai.family_id
LEFT JOIN family_members fm ON f.id = fm.family_id AND fm.is_active = true
GROUP BY f.id, f.name;

-- Refresh periodically
CREATE INDEX idx_family_activity_summary ON family_activity_summary(family_id);
\`\`\`

## Row Level Security

### Enable RLS on all tables
\`\`\`sql
-- Enable RLS
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_interactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_learning_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_task_queue ENABLE ROW LEVEL SECURITY;

-- Helper function to check family membership
CREATE OR REPLACE FUNCTION auth.user_family_id()
RETURNS UUID AS $$
  SELECT family_id FROM profiles WHERE id = auth.uid()
$$ LANGUAGE sql SECURITY DEFINER;

-- Families policies
CREATE POLICY "Users can view their own family"
  ON families FOR SELECT
  USING (id = auth.user_family_id());

CREATE POLICY "Family admins can update family"
  ON families FOR UPDATE
  USING (
    id = auth.user_family_id() AND
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND family_id = families.id 
      AND role = 'admin'
    )
  );

-- Calendar events policies
CREATE POLICY "Users can view their family's events"
  ON calendar_events FOR SELECT
  USING (
    family_id = auth.user_family_id() AND
    (visibility = 'public' OR visibility = 'family_only' OR created_by = auth.uid())
  );

CREATE POLICY "Users can create events for their family"
  ON calendar_events FOR INSERT
  WITH CHECK (
    family_id = auth.user_family_id() AND
    created_by = auth.uid()
  );

CREATE POLICY "Users can update their own events"
  ON calendar_events FOR UPDATE
  USING (
    family_id = auth.user_family_id() AND
    (created_by = auth.uid() OR 
     EXISTS (
       SELECT 1 FROM profiles 
       WHERE id = auth.uid() 
       AND family_id = calendar_events.family_id 
       AND role IN ('admin', 'parent')
     ))
  );

-- AI interactions policies
CREATE POLICY "Users can view their own AI interactions"
  ON ai_interactions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can create their own AI interactions"
  ON ai_interactions FOR INSERT
  WITH CHECK (user_id = auth.uid() AND family_id = auth.user_family_id());

-- AI preferences policies
CREATE POLICY "Users can manage their own AI preferences"
  ON ai_preferences FOR ALL
  USING (user_id = auth.uid());
\`\`\`

## Migration Scripts

### Initial Setup Migration
\`\`\`sql
-- Migration: 001_initial_schema.sql
BEGIN;

-- Create all tables
-- [Include all CREATE TABLE statements from above]

-- Create indexes
-- [Include all CREATE INDEX statements from above]

-- Enable RLS
-- [Include all RLS statements from above]

-- Insert default data
INSERT INTO families (id, name) VALUES 
  ('00000000-0000-0000-0000-000000000001', 'Demo Family');

COMMIT;
\`\`\`

### Add AI Features Migration
\`\`\`sql
-- Migration: 002_add_ai_features.sql
BEGIN;

-- Add AI columns to existing tables
ALTER TABLE calendar_events 
  ADD COLUMN IF NOT EXISTS ai_generated BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS ai_confidence DECIMAL(3,2),
  ADD COLUMN IF NOT EXISTS ai_suggestions JSONB,
  ADD COLUMN IF NOT EXISTS auto_scheduled BOOLEAN DEFAULT false;

-- Create AI-specific tables
-- [Include AI table creation statements]

-- Add indexes
-- [Include AI-specific indexes]

COMMIT;
\`\`\`

## Data Seeding

### Test Data for Development
\`\`\`sql
-- Seed test family
INSERT INTO families (id, name, settings) VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Test Family',
  '{
    "timezone": "America/New_York",
    "locale": "en-US",
    "week_starts_on": 0
  }'::jsonb
);

-- Seed test users
INSERT INTO profiles (id, email, full_name, family_id, role) VALUES
  ('22222222-2222-2222-2222-222222222222', 'parent1@test.com', 'John Doe', '11111111-1111-1111-1111-111111111111', 'admin'),
  ('33333333-3333-3333-3333-333333333333', 'parent2@test.com', 'Jane Doe', '11111111-1111-1111-1111-111111111111', 'parent');

-- Seed family members
INSERT INTO family_members (id, family_id, user_id, name, role, birth_date) VALUES
  ('44444444-4444-4444-4444-444444444444', '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'John Doe', 'parent', '1985-05-15'),
  ('55555555-5555-5555-5555-555555555555', '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 'Jane Doe', 'parent', '1987-08-22'),
  ('66666666-6666-6666-6666-666666666666', '11111111-1111-1111-1111-111111111111', NULL, 'Sarah Doe', 'child', '2015-03-10'),
  ('77777777-7777-7777-7777-777777777777', '11111111-1111-1111-1111-111111111111', NULL, 'Tommy Doe', 'child', '2018-11-05');

-- Seed sample events
INSERT INTO calendar_events (
  family_id, title, start_time, end_time, 
  participants, category, created_by
) VALUES
  (
    '11111111-1111-1111-1111-111111111111',
    'School Drop-off',
    CURRENT_DATE + INTERVAL '8 hours',
    CURRENT_DATE + INTERVAL '8 hours 30 minutes',
    ARRAY['66666666-6666-6666-6666-666666666666', '44444444-4444-4444-4444-444444444444'],
    'school',
    '22222222-2222-2222-2222-222222222222'
  ),
  (
    '11111111-1111-1111-1111-111111111111',
    'Soccer Practice',
    CURRENT_DATE + INTERVAL '16 hours',
    CURRENT_DATE + INTERVAL '17 hours 30 minutes',
    ARRAY['66666666-6666-6666-6666-666666666666', '55555555-5555-5555-5555-555555555555'],
    'activity',
    '33333333-3333-3333-3333-333333333333'
  );

-- Seed AI preferences
INSERT INTO ai_preferences (user_id, language, proactive_suggestions) VALUES
  ('22222222-2222-2222-2222-222222222222', 'en', true),
  ('33333333-3333-3333-3333-333333333333', 'en', true);
\`\`\`

## Integration with AI Agent

### Database Access Layer
\`\`\`typescript
// lib/ai/db/calendar-repository.ts
import { createClient } from '@/lib/supabase/server';

export class CalendarRepository {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  async getUpcomingEvents(familyId: string, days: number = 7) {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + days);

    const { data, error } = await this.supabase
      .from('calendar_events')
      .select(`
        *,
        participants:family_members!inner(id, name, role)
      `)
      .eq('family_id', familyId)
      .gte('start_time', startDate.toISOString())
      .lte('start_time', endDate.toISOString())
      .eq('status', 'confirmed')
      .is('deleted_at', null)
      .order('start_time');

    return { data, error };
  }

  async findConflicts(
    familyId: string,
    startTime: string,
    endTime: string,
    participants: string[],
    excludeEventId?: string
  ) {
    let query = this.supabase
      .from('calendar_events')
      .select('*')
      .eq('family_id', familyId)
      .eq('status', 'confirmed')
      .is('deleted_at', null)
      .or(participants.map(p => `participants.cs.{${p}}`).join(','))
      .lte('start_time', endTime)
      .gte('end_time', startTime);

    if (excludeEventId) {
      query = query.neq('id', excludeEventId);
    }

    const { data, error } = await query;
    return { conflicts: data || [], error };
  }

  async logAIInteraction(interaction: {
    userId: string;
    familyId: string;
    input: string;
    intent: any;
    actions: any;
    result: any;
    tokensUsed: number;
  }) {
    const { error } = await this.supabase
      .from('ai_interactions')
      .insert({
        user_id: interaction.userId,
        family_id: interaction.familyId,
        session_id: crypto.randomUUID(),
        input_text: interaction.input,
        intent: interaction.intent,
        actions: interaction.actions,
        result: interaction.result,
        tokens_used: interaction.tokensUsed,
        model_used: 'gpt-4-turbo',
        success: true,
        created_at: new Date().toISOString()
      });

    if (error) {
      console.error('Failed to log AI interaction:', error);
    }
  }
}
\`\`\`

### Real-time Subscriptions
\`\`\`typescript
// lib/ai/realtime/calendar-subscriptions.ts
export function subscribeToFamilyEvents(
  familyId: string,
  onEventChange: (payload: any) => void
) {
  const supabase = createClient();

  const subscription = supabase
    .channel(`family-events-${familyId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'calendar_events',
        filter: `family_id=eq.${familyId}`
      },
      (payload) => {
        onEventChange(payload);
      }
    )
    .subscribe();

  return subscription;
}
\`\`\`

## Maintenance & Optimization

### Regular Maintenance Tasks
\`\`\`sql
-- 1. Vacuum and analyze tables (run weekly)
VACUUM ANALYZE calendar_events;
VACUUM ANALYZE ai_interactions;
VACUUM ANALYZE family_members;

-- 2. Update materialized views (run daily)
REFRESH MATERIALIZED VIEW CONCURRENTLY family_activity_summary;

-- 3. Clean up old AI interactions (run monthly)
DELETE FROM ai_interactions 
WHERE created_at < CURRENT_DATE - INTERVAL '90 days'
  AND feedback_rating IS NULL;

-- 4. Archive deleted events (run monthly)
INSERT INTO calendar_events_archive 
SELECT * FROM calendar_events 
WHERE deleted_at < CURRENT_DATE - INTERVAL '30 days';

DELETE FROM calendar_events 
WHERE deleted_at < CURRENT_DATE - INTERVAL '30 days';

-- 5. Update statistics
ANALYZE;
\`\`\`

### Performance Monitoring Queries
\`\`\`sql
-- Check table sizes
SELECT 
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check slow queries
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_time DESC
LIMIT 20;

-- Check index usage
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan;
\`\`\`

### Backup Strategy
\`\`\`bash
# Daily backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
DATABASE_URL="your_database_url"

# Full backup
pg_dump $DATABASE_URL > backup_full_$DATE.sql

# AI-specific tables only
pg_dump $DATABASE_URL \
  -t ai_interactions \
  -t ai_preferences \
  -t ai_learning_patterns \
  -t ai_task_queue \
  > backup_ai_$DATE.sql

# Compress and encrypt
gzip backup_full_$DATE.sql
gzip backup_ai_$DATE.sql

# Upload to cloud storage
aws s3 cp backup_full_$DATE.sql.gz s3://your-backup-bucket/
aws s3 cp backup_ai_$DATE.sql.gz s3://your-backup-bucket/
\`\`\`

## Security Best Practices

1. **Always use parameterized queries** to prevent SQL injection
2. **Implement rate limiting** on AI endpoints to prevent abuse
3. **Encrypt sensitive data** like medical information at rest
4. **Use connection pooling** to manage database connections efficiently
5. **Regular security audits** of RLS policies and permissions
6. **Monitor for unusual patterns** in AI usage that might indicate abuse

## Conclusion

This database implementation provides a robust foundation for the AI-powered family calendar application. The schema is designed to be:

- **Scalable**: Can handle millions of events and AI interactions
- **Secure**: RLS policies ensure data privacy
- **Performant**: Optimized indexes for common queries
- **Maintainable**: Clear structure and comprehensive documentation
- **AI-Ready**: Built-in support for AI features and learning

Regular monitoring and maintenance will ensure the database continues to perform well as your application grows.
