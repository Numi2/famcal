# Supabase Setup Guide

## Issue: Authentication Failed

If you're seeing "Authentication failed" errors when setting up your family, it's because the Supabase environment variables are not configured.

## Quick Fix

1. **Get your Supabase credentials**:
   - Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
   - Select your project (or create a new one)
   - Go to Settings > API
   - Copy your:
     - Project URL
     - Anon (public) key

2. **Configure environment variables**:
   - Create a `.env.local` file in your project root
   - Add the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

3. **Restart your development server**:
   ```bash
   pnpm run dev
   ```

## If You're Deploying to Vercel

1. Go to your Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Add the same variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

## Database Schema Required

Your Supabase database needs the following tables for the family calendar to work:

### Tables:
- `profiles` - User profiles
- `families` - Family information
- `family_members` - Family members
- `family_events` - Calendar events
- `meal_plans` - Meal planning
- `chore_assignments` - Chore assignments
- `activity_suggestions` - Activity suggestions

### Setting up the database:

1. Go to your Supabase dashboard
2. Navigate to SQL Editor
3. Run the following SQL to create the required tables:

```sql
-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE families ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE chore_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_suggestions ENABLE ROW LEVEL SECURITY;

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT,
    full_name TEXT,
    family_id UUID REFERENCES families(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create families table
CREATE TABLE IF NOT EXISTS families (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create family_members table
CREATE TABLE IF NOT EXISTS family_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('parent', 'child', 'caregiver')),
    age INTEGER,
    grade TEXT,
    school TEXT,
    allergies TEXT[],
    color TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create family_events table
CREATE TABLE IF NOT EXISTS family_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    event_type TEXT,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create meal_plans table
CREATE TABLE IF NOT EXISTS meal_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    meal_type TEXT NOT NULL,
    meal_name TEXT NOT NULL,
    description TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE NOT NULL,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create chore_assignments table
CREATE TABLE IF NOT EXISTS chore_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    family_id UUID REFERENCES families(id) ON DELETE CASCADE,
    chore_name TEXT NOT NULL,
    description TEXT,
    assigned_to UUID REFERENCES family_members(id) ON DELETE SET NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    is_completed BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_suggestions table
CREATE TABLE IF NOT EXISTS activity_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    age_range TEXT,
    duration_minutes INTEGER,
    category TEXT,
    is_public BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

## Row Level Security (RLS) Policies

After creating the tables, you'll need to set up RLS policies to ensure users can only access their family's data:

```sql
-- Profiles policies
CREATE POLICY "Users can view own profile" ON profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Families policies
CREATE POLICY "Users can view own family" ON families
    FOR SELECT USING (
        id IN (
            SELECT family_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can update own family" ON families
    FOR UPDATE USING (
        id IN (
            SELECT family_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can insert families" ON families
    FOR INSERT WITH CHECK (true);

-- Family members policies
CREATE POLICY "Users can view own family members" ON family_members
    FOR SELECT USING (
        family_id IN (
            SELECT family_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

CREATE POLICY "Users can manage own family members" ON family_members
    FOR ALL USING (
        family_id IN (
            SELECT family_id FROM profiles 
            WHERE id = auth.uid()
        )
    );

-- Similar policies for other tables...
```

## Testing the Setup

1. **Start your development server**:
   ```bash
   pnpm run dev
   ```

2. **Test authentication**:
   - Navigate to your app
   - Try to sign up or sign in
   - The authentication should work without "placeholder" errors

3. **Test family setup**:
   - Complete the onboarding process
   - Try to create a family
   - You should no longer see "Authentication failed" errors

## Common Issues

### 1. Environment Variables Not Loading
- Make sure `.env.local` is in your project root
- Restart your development server after adding environment variables
- Check that variable names match exactly (case-sensitive)

### 2. Database Connection Issues
- Verify your Project URL and Anon key are correct
- Check that your Supabase project is active
- Ensure database tables exist

### 3. RLS Policies Too Restrictive
- Make sure RLS policies allow your users to access their data
- Test policies in the Supabase dashboard

## Next Steps

Once authentication is working:
1. Test the complete family setup flow
2. Create some test events and meals
3. Verify all features work as expected

## Need Help?

If you're still experiencing issues:
1. Check the browser console for detailed error messages
2. Check the Supabase logs in your dashboard
3. Verify your database schema matches the requirements above