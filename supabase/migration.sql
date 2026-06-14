-- Run this in Supabase SQL Editor (https://synpcpnstoulaxancsgh.supabase.co)
-- ============================================================================

-- 1. Add timestamp columns to career_jobs
ALTER TABLE career_jobs ADD COLUMN IF NOT EXISTS applied_at TIMESTAMPTZ;
ALTER TABLE career_jobs ADD COLUMN IF NOT EXISTS interviewed_at TIMESTAMPTZ;
ALTER TABLE career_jobs ADD COLUMN IF NOT EXISTS offered_at TIMESTAMPTZ;
ALTER TABLE career_jobs ADD COLUMN IF NOT EXISTS rejected_at TIMESTAMPTZ;

-- 2. Create career_profiles table
CREATE TABLE IF NOT EXISTS career_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) UNIQUE,
  name TEXT,
  target_role TEXT,
  industry TEXT,
  years_experience INTEGER,
  skills TEXT[],
  preferred_location TEXT,
  salary_expectations TEXT,
  resume_text TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Enable RLS
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies
CREATE POLICY "Users view own profile" ON career_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users insert own profile" ON career_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own profile" ON career_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Note: For service_role bypass (used in API routes), RLS is not enforced.
-- The API route enforces user_id ownership manually.
