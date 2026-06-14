-- Run this in Supabase SQL Editor
-- Creates all tables from scratch if they don't exist

-- 1. career_jobs — main jobs table
CREATE TABLE IF NOT EXISTS career_jobs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  company TEXT,
  role TEXT,
  jd_text TEXT,
  status TEXT DEFAULT 'saved',
  location TEXT,
  salary_range TEXT,
  notes TEXT,
  job_url TEXT,
  applied_at TIMESTAMPTZ,
  interviewed_at TIMESTAMPTZ,
  offered_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. career_evaluations — AI evaluation results
CREATE TABLE IF NOT EXISTS career_evaluations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  job_id UUID REFERENCES career_jobs(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  grade TEXT,
  score NUMERIC(3,1),
  role_summary TEXT,
  cv_match TEXT,
  green_flags TEXT,
  red_flags TEXT,
  compensation TEXT,
  recommendation TEXT,
  raw_response TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. career_profiles — user profile + resume
CREATE TABLE IF NOT EXISTS career_profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
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

-- 4. Enable RLS on all tables
ALTER TABLE career_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_evaluations ENABLE ROW LEVEL SECURITY;
ALTER TABLE career_profiles ENABLE ROW LEVEL SECURITY;

-- 5. RLS policies
CREATE POLICY "Users manage own jobs" ON career_jobs FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users manage own evaluations" ON career_evaluations FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users view own profile" ON career_profiles FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own profile" ON career_profiles FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own profile" ON career_profiles FOR UPDATE USING (auth.uid() = user_id);
