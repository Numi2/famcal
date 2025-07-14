-- Enable RLS (Row Level Security)
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create families table
CREATE TABLE IF NOT EXISTS families (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  settings JSONB DEFAULT '{}',
  created_by UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Create profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  role TEXT CHECK (role IN ('parent', 'child', 'caregiver')) DEFAULT 'parent',
  family_id UUID REFERENCES families(id) ON DELETE SET NULL,
  age INTEGER,
  grade TEXT,
  school TEXT,
  allergies TEXT[],
  medications TEXT[],
  emergency_contact TEXT,
  color TEXT DEFAULT 'bg-blue-500',
  preferences JSONB DEFAULT '{}'
);

-- Create family_events table
CREATE TABLE IF NOT EXISTS family_events (
  id BIGSERIAL PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  start_time TEXT NOT NULL,
  end_time TEXT NOT NULL,
  day INTEGER NOT NULL CHECK (day >= 1 AND day <= 7),
  date TEXT NOT NULL,
  location TEXT,
  type TEXT NOT NULL,
  assigned_to TEXT[] NOT NULL DEFAULT '{}',
  organizer TEXT NOT NULL,
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
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL
);

-- Create chore_assignments table
CREATE TABLE IF NOT EXISTS chore_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  chore TEXT NOT NULL,
  assigned_to TEXT NOT NULL,
  due_date TEXT NOT NULL,
  completed BOOLEAN DEFAULT false,
  points INTEGER DEFAULT 0,
  age_appropriate BOOLEAN DEFAULT true,
  instructions TEXT,
  parent_approval_required BOOLEAN DEFAULT false,
  family_id UUID REFERENCES families(id) ON DELETE CASCADE NOT NULL
);

-- Enable Row Level Security
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_assignments ENABLE ROW LEVEL SECURITY;

-- Create policies for families
CREATE POLICY "Users can view families they belong to" ON families
  FOR SELECT USING (
    id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    ) OR created_by = auth.uid()
  );

CREATE POLICY "Users can create families" ON families
  FOR INSERT WITH CHECK (created_by = auth.uid());

CREATE POLICY "Family creators can update their families" ON families
  FOR UPDATE USING (created_by = auth.uid());

-- Create policies for profiles
CREATE POLICY "Users can view profiles in their family" ON profiles
  FOR SELECT USING (
    id = auth.uid() OR 
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own profile" ON profiles
  FOR UPDATE USING (id = auth.uid());

CREATE POLICY "Users can insert their own profile" ON profiles
  FOR INSERT WITH CHECK (id = auth.uid());

-- Create policies for family_events
CREATE POLICY "Users can view events in their family" ON family_events
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create events in their family" ON family_events
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update events in their family" ON family_events
  FOR UPDATE USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Create policies for meal_plans
CREATE POLICY "Users can view meal plans in their family" ON meal_plans
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create meal plans in their family" ON meal_plans
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Create policies for chore_assignments
CREATE POLICY "Users can view chores in their family" ON chore_assignments
  FOR SELECT USING (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create chores in their family" ON chore_assignments
  FOR INSERT WITH CHECK (
    family_id IN (
      SELECT family_id FROM profiles WHERE id = auth.uid()
    )
  );

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
