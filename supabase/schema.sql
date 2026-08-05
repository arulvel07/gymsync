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
    workout_type TEXT NOT NULL CHECK (
        workout_type IN ('Push', 'Pull', 'Legs', 'Upper Body', 'Lower Body', 'Cardio', 'Full Body', 'Core')
    ),
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

-- PROFILES policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
    ON public.profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
    ON public.profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- GYM SESSIONS policies
CREATE POLICY "Users can view their own sessions"
    ON public.gym_sessions FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sessions"
    ON public.gym_sessions FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
    ON public.gym_sessions FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "Admins can view all sessions"
    ON public.gym_sessions FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

CREATE POLICY "Admins can update any session"
    ON public.gym_sessions FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- GYM CONFIG policies
CREATE POLICY "Anyone can view gym config"
    ON public.gym_config FOR SELECT
    USING (true);

CREATE POLICY "Admins can update gym config"
    ON public.gym_config FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

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
        COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
        COALESCE(NEW.raw_user_meta_data->>'roll_number', ''),
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
