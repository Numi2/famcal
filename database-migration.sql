-- Database Migration: Simplify to 3 event types
-- This migration consolidates multiple event tables into a single events table
-- with only 3 types: chore, meal, and activity

-- Create new simplified events table
CREATE TABLE IF NOT EXISTS events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Core fields
  type TEXT NOT NULL CHECK (type IN ('chore', 'meal', 'activity')),
  title TEXT NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  family_id UUID NOT NULL REFERENCES families(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id),
  
  -- Assignment
  assigned_to UUID[] DEFAULT '{}',
  
  -- Chore-specific fields
  points INTEGER CHECK (points >= 0 AND points <= 100),
  recurring BOOLEAN DEFAULT FALSE,
  completed BOOLEAN DEFAULT FALSE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completed_by UUID REFERENCES auth.users(id),
  
  -- Meal-specific fields
  meal_time TEXT CHECK (meal_time IN ('breakfast', 'lunch', 'dinner', 'snack')),
  prep_time INTEGER CHECK (prep_time >= 0),
  servings INTEGER CHECK (servings > 0),
  
  -- Activity-specific fields
  start_time TIMESTAMP WITH TIME ZONE,
  end_time TIMESTAMP WITH TIME ZONE,
  location TEXT,
  cost DECIMAL(10, 2) CHECK (cost >= 0),
  
  -- Indexes for performance
  CONSTRAINT valid_chore CHECK (
    type != 'chore' OR (
      type = 'chore' AND meal_time IS NULL AND prep_time IS NULL AND servings IS NULL
      AND start_time IS NULL AND end_time IS NULL AND location IS NULL AND cost IS NULL
    )
  ),
  CONSTRAINT valid_meal CHECK (
    type != 'meal' OR (
      type = 'meal' AND points IS NULL AND recurring IS NULL AND completed IS NULL
      AND completed_at IS NULL AND completed_by IS NULL
      AND start_time IS NULL AND end_time IS NULL AND location IS NULL AND cost IS NULL
    )
  ),
  CONSTRAINT valid_activity CHECK (
    type != 'activity' OR (
      type = 'activity' AND points IS NULL AND recurring IS NULL AND completed IS NULL
      AND completed_at IS NULL AND completed_by IS NULL
      AND meal_time IS NULL AND prep_time IS NULL AND servings IS NULL
    )
  ),
  CONSTRAINT valid_activity_times CHECK (
    type != 'activity' OR (start_time IS NOT NULL AND end_time IS NOT NULL AND end_time > start_time)
  )
);

-- Create indexes for performance
CREATE INDEX idx_events_family_date ON events(family_id, date);
CREATE INDEX idx_events_type ON events(type);
CREATE INDEX idx_events_assigned_to ON events USING GIN(assigned_to);
CREATE INDEX idx_events_completed ON events(completed) WHERE type = 'chore';

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view events in their families" ON events
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = events.family_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events in their families" ON events
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = events.family_id
      AND family_members.user_id = auth.uid()
    ) AND created_by = auth.uid()
  );

CREATE POLICY "Users can update events in their families" ON events
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = events.family_id
      AND family_members.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete events in their families" ON events
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM family_members
      WHERE family_members.family_id = events.family_id
      AND family_members.user_id = auth.uid()
    )
  );

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_events_updated_at
  BEFORE UPDATE ON events
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Migration notes:
-- 1. Run this migration in a transaction
-- 2. After creating the new table, migrate data from old tables if they exist
-- 3. Update your application code to use the new simplified schema
-- 4. Once verified, drop the old tables

-- Example data migration (customize based on your existing tables):
-- INSERT INTO events (type, title, description, date, family_id, created_by, assigned_to, points, recurring, completed)
-- SELECT 'chore', chore, description, due_date, family_id, created_by, ARRAY[assigned_to], points, recurring, completed
-- FROM chore_assignments;

-- INSERT INTO events (type, title, description, date, family_id, created_by, meal_time, prep_time, servings)
-- SELECT 'meal', meal, NULL, date, family_id, created_by, meal_type, prep_time, servings
-- FROM meal_plans;

-- INSERT INTO events (type, title, description, date, family_id, created_by, assigned_to, start_time, end_time, location, cost)
-- SELECT 'activity', title, description, date, family_id, organizer, assigned_to, start_time, end_time, location, cost
-- FROM family_events;