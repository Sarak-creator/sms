/**
 * MoEYS Cambodian School Management System - Supabase DDL SQL Schema
 */

export const SUPABASE_SCHEMA_SQL = `
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 0. SYSTEM & DATABASE CONFIGURATIONS TABLE (Stores Supabase project config directly in Database without .env)
CREATE TABLE IF NOT EXISTS public.system_configurations (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'primary-config',
  supabase_url TEXT NOT NULL,
  supabase_anon_key TEXT NOT NULL,
  supabase_service_role_key TEXT,
  database_url TEXT,
  direct_url TEXT,
  is_connected BOOLEAN DEFAULT true,
  is_initialized BOOLEAN DEFAULT true,
  connected_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1. SCHOOL PROFILE TABLE
CREATE TABLE IF NOT EXISTS public.schools (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'current-school',
  name_khmer TEXT NOT NULL,
  name_english TEXT NOT NULL,
  code VARCHAR(64) NOT NULL,
  province TEXT NOT NULL,
  district TEXT NOT NULL,
  principal_name TEXT NOT NULL,
  academic_year VARCHAR(32) NOT NULL DEFAULT '២០២៤ - ២០២៥',
  phone VARCHAR(32),
  email VARCHAR(128),
  address TEXT,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. USERS TABLE (System RBAC)
CREATE TABLE IF NOT EXISTS public.users (
  id VARCHAR(64) PRIMARY KEY,
  username VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(128) UNIQUE,
  full_name_km TEXT NOT NULL,
  full_name_latin TEXT NOT NULL,
  role VARCHAR(32) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'ACTIVE',
  password_hash TEXT,
  teacher_id VARCHAR(64),
  assigned_class_ids JSONB DEFAULT '[]'::jsonb,
  permissions JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. TEACHERS TABLE
CREATE TABLE IF NOT EXISTS public.teachers (
  civil_servant_id VARCHAR(64) PRIMARY KEY,
  khmer_name TEXT NOT NULL,
  latin_name TEXT NOT NULL,
  gender VARCHAR(16) NOT NULL,
  cadre TEXT NOT NULL,
  specialization TEXT NOT NULL,
  standard_quota INTEGER NOT NULL DEFAULT 18,
  assigned_shift VARCHAR(32) NOT NULL DEFAULT 'MORNING',
  phone_number VARCHAR(32) NOT NULL,
  dob DATE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. CLASSES TABLE
CREATE TABLE IF NOT EXISTS public.classes (
  id VARCHAR(64) PRIMARY KEY,
  name TEXT NOT NULL,
  grade_level VARCHAR(32) NOT NULL,
  track VARCHAR(32) NOT NULL DEFAULT 'GENERAL',
  shift VARCHAR(32) NOT NULL DEFAULT 'MORNING',
  room_number VARCHAR(64) NOT NULL,
  homeroom_teacher_id VARCHAR(64),
  homeroom_teacher_name TEXT,
  total_students INTEGER DEFAULT 0,
  female_students INTEGER DEFAULT 0,
  subject_divisor NUMERIC DEFAULT 21,
  semester_divisor NUMERIC DEFAULT 14,
  disabled_column_keys JSONB DEFAULT '[]'::jsonb,
  exam_subject_keys JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. STUDENTS TABLE
CREATE TABLE IF NOT EXISTS public.students (
  student_national_id VARCHAR(64) PRIMARY KEY,
  khmer_name TEXT NOT NULL,
  latin_name TEXT NOT NULL,
  gender VARCHAR(16) NOT NULL,
  dob DATE NOT NULL,
  pob_province TEXT NOT NULL,
  pob_district TEXT NOT NULL,
  father_name TEXT,
  mother_name TEXT,
  guardian_phone VARCHAR(32),
  roll_number INTEGER DEFAULT 1,
  class_id VARCHAR(64) REFERENCES public.classes(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. MONTHLY COMPETENCY SCORES TABLE
CREATE TABLE IF NOT EXISTS public.monthly_scores (
  id TEXT PRIMARY KEY,
  month_index INTEGER NOT NULL,
  student_id VARCHAR(64) NOT NULL REFERENCES public.students(student_national_id) ON DELETE CASCADE,
  scores_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. SEMESTER EXAM SCORES TABLE
CREATE TABLE IF NOT EXISTS public.semester_exam_scores (
  id TEXT PRIMARY KEY,
  semester INTEGER NOT NULL,
  student_id VARCHAR(64) NOT NULL REFERENCES public.students(student_national_id) ON DELETE CASCADE,
  scores_json JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. ATTENDANCE RECORDS TABLE
CREATE TABLE IF NOT EXISTS public.attendance_records (
  id TEXT PRIMARY KEY,
  student_id VARCHAR(64) NOT NULL REFERENCES public.students(student_national_id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  status VARCHAR(32) NOT NULL DEFAULT 'PRESENT',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. SPECIALIZATIONS & SUBJECTS TABLE
CREATE TABLE IF NOT EXISTS public.specializations (
  id VARCHAR(64) PRIMARY KEY,
  code VARCHAR(64) UNIQUE NOT NULL,
  name_khmer TEXT NOT NULL,
  name_english TEXT NOT NULL,
  category VARCHAR(32) NOT NULL,
  department TEXT NOT NULL,
  standard_weekly_hours INTEGER DEFAULT 18,
  description TEXT,
  coefficient NUMERIC DEFAULT 1.0,
  max_score NUMERIC DEFAULT 100,
  passing_score NUMERIC DEFAULT 50,
  is_core BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. CHAPTERS & LESSONS TABLE
CREATE TABLE IF NOT EXISTS public.chapters (
  id VARCHAR(64) PRIMARY KEY,
  subject_code VARCHAR(64) NOT NULL,
  grade_level VARCHAR(32) NOT NULL,
  chapter_number INTEGER NOT NULL,
  title_khmer TEXT NOT NULL,
  title_english TEXT NOT NULL,
  description TEXT,
  total_hours INTEGER DEFAULT 4,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. HOLIDAYS & ACADEMIC CALENDAR TABLE (Cambodia MoEYS Public Holidays & Academic Events)
CREATE TABLE IF NOT EXISTS public.holidays (
  id VARCHAR(64) PRIMARY KEY,
  title_khmer TEXT NOT NULL,
  title_english TEXT,
  date_from DATE NOT NULL,
  date_to DATE NOT NULL,
  type VARCHAR(32) NOT NULL DEFAULT 'PUBLIC_HOLIDAY',
  is_day_off BOOLEAN DEFAULT true,
  description TEXT,
  academic_year VARCHAR(32) DEFAULT '២០២៤ - ២០២៥',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. CLASS SETTINGS & EXAM SUBJECTS TABLE (Dedicated table for per-class divisors, examined subjects & disabled skills)
CREATE TABLE IF NOT EXISTS public.class_settings (
  id VARCHAR(64) PRIMARY KEY,
  class_id VARCHAR(64) UNIQUE NOT NULL REFERENCES public.classes(id) ON DELETE CASCADE,
  subject_divisor NUMERIC NOT NULL DEFAULT 21,
  semester_divisor NUMERIC NOT NULL DEFAULT 14,
  disabled_column_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  exam_subject_keys JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. SYSTEM & SCHOOL SETTINGS TABLE (Dedicated table for system configurations, school settings, and academic months)
CREATE TABLE IF NOT EXISTS public.system_settings (
  id VARCHAR(64) PRIMARY KEY DEFAULT 'default-settings',
  school_id VARCHAR(64) DEFAULT 'current-school',
  default_divisor NUMERIC NOT NULL DEFAULT 21,
  passing_threshold NUMERIC NOT NULL DEFAULT 50,
  auto_calculate_rank BOOLEAN NOT NULL DEFAULT true,
  auto_save_alert BOOLEAN NOT NULL DEFAULT true,
  academic_months JSONB NOT NULL DEFAULT '[]'::jsonb,
  custom_settings JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe Schema Migration Upgrades (Alter existing tables if columns are missing)
DO $$
BEGIN
  ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS subject_divisor NUMERIC DEFAULT 21;
  ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS semester_divisor NUMERIC DEFAULT 14;
  ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS disabled_column_keys JSONB DEFAULT '[]'::jsonb;
  ALTER TABLE public.classes ADD COLUMN IF NOT EXISTS exam_subject_keys JSONB DEFAULT '[]'::jsonb;
  ALTER TABLE public.schools ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}'::jsonb;
EXCEPTION WHEN OTHERS THEN
  -- ignore if column already exists or table is being created
  NULL;
END
$$;

-- Enable Row Level Security (RLS) on all tables
ALTER TABLE public.system_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schools ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.semester_exam_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.specializations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.holidays ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;

-- Default open policies for authenticated and anon clients (with service_role bypass)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access System Configurations') THEN
    CREATE POLICY "Public Access System Configurations" ON public.system_configurations FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Schools') THEN
    CREATE POLICY "Public Access Schools" ON public.schools FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Users') THEN
    CREATE POLICY "Public Access Users" ON public.users FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Teachers') THEN
    CREATE POLICY "Public Access Teachers" ON public.teachers FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Classes') THEN
    CREATE POLICY "Public Access Classes" ON public.classes FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Students') THEN
    CREATE POLICY "Public Access Students" ON public.students FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Monthly Scores') THEN
    CREATE POLICY "Public Access Monthly Scores" ON public.monthly_scores FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Semester Scores') THEN
    CREATE POLICY "Public Access Semester Scores" ON public.semester_exam_scores FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Attendance') THEN
    CREATE POLICY "Public Access Attendance" ON public.attendance_records FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Specializations') THEN
    CREATE POLICY "Public Access Specializations" ON public.specializations FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Chapters') THEN
    CREATE POLICY "Public Access Chapters" ON public.chapters FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Holidays') THEN
    CREATE POLICY "Public Access Holidays" ON public.holidays FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access Class Settings') THEN
    CREATE POLICY "Public Access Class Settings" ON public.class_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public Access System Settings') THEN
    CREATE POLICY "Public Access System Settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);
  END IF;
END
$$;
`;
