-- Create new tables for Family Calendar (keeping existing tables intact)

-- Create families table
CREATE TABLE IF NOT EXISTS families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create family_members table (separate from existing profiles)
CREATE TABLE IF NOT EXISTS family_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  full_name TEXT NOT NULL,
  role TEXT CHECK (role IN ('parent', 'child', 'caregiver')) DEFAULT 'parent',
  age INTEGER,
  grade TEXT,
  school TEXT,
  allergies TEXT[],
  medications TEXT[],
  emergency_contact TEXT,
  color TEXT DEFAULT 'bg-blue-500',
  avatar_url TEXT,
  preferences JSONB DEFAULT '{}',
  UNIQUE(user_id, family_id)
);

-- Create family_events table
CREATE TABLE IF NOT EXISTS family_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 7),
  date TEXT NOT NULL,
  location TEXT,
  type TEXT NOT NULL,
  assigned_to UUID[] NOT NULL DEFAULT '{}', -- Array of family_member IDs
  organizer UUID REFERENCES family_members(id) NOT NULL,
  color TEXT DEFAULT 'bg-blue-500',
  priority TEXT CHECK (priority IN ('low', 'medium', 'high', 'urgent')) DEFAULT 'medium',
  is_recurring BOOLEAN DEFAULT false,
  recurrence_pattern JSONB,
  reminders JSONB,
  notes TEXT,
  cost DECIMAL(10,2),
  requires_transport BOOLEAN DEFAULT false,
  carpool_info JSONB,
  weather_dependent BOOLEAN DEFAULT false,
  age_appropriate JSONB,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 7),
  meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')) NOT NULL,
  meal TEXT NOT NULL,
  ingredients TEXT[] NOT NULL DEFAULT '{}',
  prep_time INTEGER NOT NULL DEFAULT 0,
  cook_time INTEGER NOT NULL DEFAULT 0,
  servings INTEGER NOT NULL DEFAULT 1,
  allergens_considered TEXT[] DEFAULT '{}',
  nutrition_notes TEXT,
  kid_friendly BOOLEAN DEFAULT true,
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')) DEFAULT 'easy',
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES family_members(id) NOT NULL
);

-- Create chore_assignments table
CREATE TABLE IF NOT EXISTS chore_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  chore TEXT NOT NULL,
  assigned_to UUID REFERENCES family_members(id) NOT NULL,
  due_date TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  points INTEGER DEFAULT 0,
  age_appropriate BOOLEAN DEFAULT true,
  instructions TEXT,
  parent_approval_required BOOLEAN DEFAULT false,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  created_by UUID REFERENCES family_members(id) NOT NULL
);

-- Create family_insights table for AI suggestions
CREATE TABLE IF NOT EXISTS family_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL,
  type TEXT CHECK (type IN ('suggestion', 'warning', 'celebration', 'reminder')) NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  actionable BOOLEAN DEFAULT false,
  action TEXT,
  priority TEXT CHECK (priority IN ('low', 'medium', 'high')) DEFAULT 'medium',
  related_events BIGINT[],
  related_members UUID[],
  dismissed BOOLEAN DEFAULT false,
  dismissed_at TIMESTAMP WITH TIME ZONE
);

-- Create activity_suggestions table
CREATE TABLE IF NOT EXISTS activity_suggestions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  duration INTEGER NOT NULL, -- in minutes
  min_age INTEGER NOT NULL,
  max_age INTEGER NOT NULL,
  location TEXT CHECK (location IN ('indoor', 'outdoor', 'either')) NOT NULL,
  weather_requirements TEXT[],
  materials TEXT[],
  cost TEXT CHECK (cost IN ('free', 'low', 'medium', 'high')) DEFAULT 'free',
  educational BOOLEAN DEFAULT false,
  physical BOOLEAN DEFAULT false,
  creative BOOLEAN DEFAULT false,
  social BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true, -- Can be shared across families
  created_by UUID REFERENCES family_members(id)
);

-- Enable Row Level Security on new tables
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_suggestions ENABLE ROW LEVEL SECURITY;

-- Create policies for families
CREATE POLICY "Users can view families they belong to" ON families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family creators and parents can update families" ON families
  FOR UPDATE USING (
    created_by = auth.uid() OR 
    id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'parent'
    )
  );

-- Create policies for family_members
CREATE POLICY "Users can view family members in their family" ON family_members
  FOR SELECT USING (
    user_id = auth.uid() OR 
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own family member record" ON family_members
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Parents can update family member records in their family" ON family_members
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM family_members 
      WHERE user_id = auth.uid() AND role = 'parent'
    )
  );

CREATE POLICY "Users can insert family members in their family" ON family_members
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    ) OR 
    family_id IN (
      SELECT id FROM families WHERE created_by = auth.uid()
    )
  );

-- Create policies for family_events
CREATE POLICY "Users can view events in their family" ON family_events
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create events in their family" ON family_events
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update events in their family" ON family_events
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete events in their family" ON family_events
  FOR DELETE USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Create policies for meal_plans
CREATE POLICY "Users can view meal plans in their family" ON meal_plans
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create meal plans in their family" ON meal_plans
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update meal plans in their family" ON meal_plans
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Create policies for chore_assignments
CREATE POLICY "Users can view chores in their family" ON chore_assignments
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create chores in their family" ON chore_assignments
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update chores in their family" ON chore_assignments
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Create policies for family_insights
CREATE POLICY "Users can view insights for their family" ON family_insights
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can create insights" ON family_insights
  FOR INSERT WITH CHECK (true); -- Allow system to create insights

CREATE POLICY "Users can update insights in their family" ON family_insights
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Create policies for activity_suggestions
CREATE POLICY "Users can view public activity suggestions" ON activity_suggestions
  FOR SELECT USING (is_public = true);

CREATE POLICY "Users can view their own activity suggestions" ON activity_suggestions
  FOR SELECT USING (
    created_by IN (
      SELECT id FROM family_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create activity suggestions" ON activity_suggestions
  FOR INSERT WITH CHECK (
    created_by IN (
      SELECT id FROM family_members WHERE user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_family_members_user_id ON family_members(user_id);
CREATE INDEX IF NOT EXISTS idx_family_members_family_id ON family_members(family_id);
CREATE INDEX IF NOT EXISTS idx_family_events_family_id ON family_events(family_id);
CREATE INDEX IF NOT EXISTS idx_family_events_day ON family_events(day);
CREATE INDEX IF NOT EXISTS idx_family_events_date ON family_events(date);
CREATE INDEX IF NOT EXISTS idx_meal_plans_family_id ON meal_plans(family_id);
CREATE INDEX IF NOT EXISTS idx_meal_plans_day ON meal_plans(day);
CREATE INDEX IF NOT EXISTS idx_chore_assignments_family_id ON chore_assignments(family_id);
CREATE INDEX IF NOT EXISTS idx_chore_assignments_assigned_to ON chore_assignments(assigned_to);
CREATE INDEX IF NOT EXISTS idx_family_insights_family_id ON family_insights(family_id);

-- Function to handle new user signup for family calendar
CREATE OR REPLACE FUNCTION public.handle_family_user_signup()
RETURNS trigger AS $$
BEGIN
  -- This function can be used to create initial family setup if needed
  -- For now, we'll let users create families manually
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Insert some sample activity suggestions
INSERT INTO activity_suggestions (title, description, duration, min_age, max_age, location, cost, educational, physical, creative, social, is_public) VALUES
('Nature Scavenger Hunt', 'Find items from nature like leaves, rocks, and flowers', 60, 4, 12, 'outdoor', 'free', true, true, false, true, true),
('Indoor Fort Building', 'Build a cozy fort using blankets, pillows, and furniture', 45, 3, 10, 'indoor', 'free', false, false, true, true, true),
('Cooking Together', 'Simple recipes kids can help with', 30, 5, 15, 'indoor', 'low', true, false, true, true, true),
('Backyard Obstacle Course', 'Create a fun physical challenge course', 40, 4, 12, 'outdoor', 'free', false, true, true, true, true),
('Story Time & Drawing', 'Read stories and draw pictures about them', 35, 3, 8, 'indoor', 'free', true, false, true, false, true),
('Garden Planting', 'Plant seeds and learn about growing plants', 50, 4, 14, 'outdoor', 'low', true, false, false, true, true),
('Board Game Tournament', 'Family-friendly board games for all ages', 60, 6, 99, 'indoor', 'free', true, false, false, true, true),
('Dance Party', 'Put on music and dance together', 25, 2, 99, 'indoor', 'free', false, true, true, true, true);

-- Create updated_at triggers for tables that need them
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_family_members_updated_at BEFORE UPDATE ON family_members FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_family_events_updated_at BEFORE UPDATE ON family_events FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_meal_plans_updated_at BEFORE UPDATE ON meal_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_chore_assignments_updated_at BEFORE UPDATE ON chore_assignments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
