-- ============================================
-- Smart Campus Gym Management System
-- Supabase Database Schema
-- ============================================
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor → New Query)

-- 1. PROFILES TABLE
-- Extends Supabase auth.users with gym-specific fields
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    roll_number TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. GYM SESSIONS TABLE
-- Tracks every gym visit
CREATE TABLE IF NOT EXISTS public.gym_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    check_in TIMESTAMPTZ NOT NULL DEFAULT now(),
    check_out TIMESTAMPTZ,
    workout_type TEXT NOT NULL,
    duration_minutes INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. GYM CONFIG TABLE
-- Admin-configurable settings (singleton row)
CREATE TABLE IF NOT EXISTS public.gym_config (
    id INT PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    max_capacity INT NOT NULL DEFAULT 50,
    open_time TIME NOT NULL DEFAULT '06:00:00',
    close_time TIME NOT NULL DEFAULT '22:00:00',
    is_open BOOLEAN NOT NULL DEFAULT true,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Insert default config
INSERT INTO public.gym_config (id, max_capacity, open_time, close_time, is_open)
VALUES (1, 50, '06:00:00', '22:00:00', true)
ON CONFLICT (id) DO NOTHING;

-- 4. WORKOUT PLANS TABLE
-- Pre-planned workouts for specific dates
CREATE TABLE IF NOT EXISTS public.workout_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    planned_date DATE NOT NULL,
    planned_time_slot INT NOT NULL DEFAULT 17,
    workout_type TEXT NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, planned_date)
);

-- 5. WORKOUT TEMPLATES TABLE
-- Recurring weekly workout template
CREATE TABLE IF NOT EXISTS public.workout_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
    planned_time_slot INT NOT NULL DEFAULT 17,
    workout_type TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, day_of_week)
);

-- ============================================
-- INDEXES
-- ============================================

CREATE INDEX IF NOT EXISTS idx_gym_sessions_user_id ON public.gym_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_sessions_check_in ON public.gym_sessions(check_in);
CREATE INDEX IF NOT EXISTS idx_gym_sessions_active ON public.gym_sessions(check_out) WHERE check_out IS NULL;
CREATE INDEX IF NOT EXISTS idx_profiles_roll_number ON public.profiles(roll_number);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gym_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_templates ENABLE ROW LEVEL SECURITY;

-- WORKOUT PLANS policies
DROP POLICY IF EXISTS "Permissive plans SELECT" ON public.workout_plans;
CREATE POLICY "Permissive plans SELECT" ON public.workout_plans FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permissive plans INSERT" ON public.workout_plans;
CREATE POLICY "Permissive plans INSERT" ON public.workout_plans FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Permissive plans UPDATE" ON public.workout_plans;
CREATE POLICY "Permissive plans UPDATE" ON public.workout_plans FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Permissive plans DELETE" ON public.workout_plans;
CREATE POLICY "Permissive plans DELETE" ON public.workout_plans FOR DELETE USING (true);

-- WORKOUT TEMPLATES policies
DROP POLICY IF EXISTS "Permissive templates SELECT" ON public.workout_templates;
CREATE POLICY "Permissive templates SELECT" ON public.workout_templates FOR SELECT USING (true);
DROP POLICY IF EXISTS "Permissive templates INSERT" ON public.workout_templates;
CREATE POLICY "Permissive templates INSERT" ON public.workout_templates FOR INSERT WITH CHECK (true);
DROP POLICY IF EXISTS "Permissive templates UPDATE" ON public.workout_templates;
CREATE POLICY "Permissive templates UPDATE" ON public.workout_templates FOR UPDATE USING (true);
DROP POLICY IF EXISTS "Permissive templates DELETE" ON public.workout_templates;
CREATE POLICY "Permissive templates DELETE" ON public.workout_templates FOR DELETE USING (true);

-- Create a secure definer function to check admin status
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$;

-- PROFILES policies (Permissive for backend API operations)
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (true);

-- GYM SESSIONS policies (Permissive for backend API operations)
DROP POLICY IF EXISTS "Users can view their own sessions" ON public.gym_sessions;
CREATE POLICY "Users can view their own sessions"
    ON public.gym_sessions FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Users can insert their own sessions" ON public.gym_sessions;
CREATE POLICY "Users can insert their own sessions"
    ON public.gym_sessions FOR INSERT
    WITH CHECK (true);

DROP POLICY IF EXISTS "Users can update their own sessions" ON public.gym_sessions;
CREATE POLICY "Users can update their own sessions"
    ON public.gym_sessions FOR UPDATE
    USING (true);

DROP POLICY IF EXISTS "Admins can view all sessions" ON public.gym_sessions;
CREATE POLICY "Admins can view all sessions"
    ON public.gym_sessions FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can update any session" ON public.gym_sessions;
CREATE POLICY "Admins can update any session"
    ON public.gym_sessions FOR UPDATE
    USING (true);

-- GYM CONFIG policies
DROP POLICY IF EXISTS "Anyone can view gym config" ON public.gym_config;
CREATE POLICY "Anyone can view gym config"
    ON public.gym_config FOR SELECT
    USING (true);

DROP POLICY IF EXISTS "Admins can update gym config" ON public.gym_config;
CREATE POLICY "Admins can update gym config"
    ON public.gym_config FOR UPDATE
    USING (true);

-- ============================================
-- DATABASE FUNCTIONS
-- ============================================

-- Function: Get current occupancy count
CREATE OR REPLACE FUNCTION public.get_current_occupancy()
RETURNS INT
LANGUAGE sql
STABLE
AS $$
    SELECT COUNT(*)::INT
    FROM public.gym_sessions
    WHERE check_out IS NULL;
$$;

-- Function: Get workout distribution of active sessions
CREATE OR REPLACE FUNCTION public.get_workout_distribution()
RETURNS TABLE(workout_type TEXT, count BIGINT)
LANGUAGE sql
STABLE
AS $$
    SELECT workout_type, COUNT(*)
    FROM public.gym_sessions
    WHERE check_out IS NULL
    GROUP BY workout_type
    ORDER BY COUNT(*) DESC;
$$;

-- Function: Get hourly visit distribution for a date range
CREATE OR REPLACE FUNCTION public.get_hourly_distribution(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE(hour INT, avg_visitors NUMERIC)
LANGUAGE sql
STABLE
AS $$
    SELECT
        EXTRACT(HOUR FROM check_in)::INT AS hour,
        ROUND(COUNT(*)::NUMERIC / GREATEST(1, (end_date - start_date)), 1) AS avg_visitors
    FROM public.gym_sessions
    WHERE check_in::DATE BETWEEN start_date AND end_date
    GROUP BY EXTRACT(HOUR FROM check_in)
    ORDER BY hour;
$$;

-- Function: Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, roll_number, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
        UPPER(split_part(NEW.email, '@', 1)), -- Extracts 'CS22B1001' from 'CS22B1001@iiitdm.ac.in'
        'student'
    );
    RETURN NEW;
END;
$$;

-- Trigger: Create profile when auth user is created
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

-- ============================================
-- GRANT SERVICE ROLE ACCESS
-- ============================================
-- The service_role key bypasses RLS — used by the FastAPI backend

GRANT ALL ON public.profiles TO service_role;
GRANT ALL ON public.gym_sessions TO service_role;
GRANT ALL ON public.gym_config TO service_role;
GRANT EXECUTE ON FUNCTION public.get_current_occupancy TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_workout_distribution TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_hourly_distribution TO anon, authenticated, service_role;

-- 6. QR TOKENS TABLE
-- Dynamic 7-minute tokens for gym QR check-in
CREATE TABLE IF NOT EXISTS public.qr_tokens (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    token TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ NOT NULL
);

GRANT ALL ON public.qr_tokens TO service_role;

