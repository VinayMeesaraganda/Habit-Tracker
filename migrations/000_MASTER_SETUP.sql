-- ============================================================
-- HABIT TRACKER - COMPLETE DATABASE SETUP
-- ============================================================
-- Run this entire script in your Supabase SQL Editor
-- This creates/updates all tables needed for the Habit Tracker app
-- ============================================================

-- ============================================================
-- 1. HABITS TABLE (should already exist)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.habits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    category TEXT DEFAULT 'other',
    type TEXT DEFAULT 'daily', -- 'daily' or 'weekly'
    priority INTEGER DEFAULT 0,
    archived BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns to habits (safe - uses IF NOT EXISTS)
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS skip_dates TEXT[] DEFAULT '{}';
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS is_quantifiable BOOLEAN DEFAULT false;
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS target_value NUMERIC;
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS unit TEXT;
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS timer_minutes INTEGER;
ALTER TABLE public.habits ADD COLUMN IF NOT EXISTS auto_complete BOOLEAN DEFAULT false;

-- Enable RLS on habits
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;

-- Habits RLS policies (drop existing first to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can insert their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can update their own habits" ON public.habits;
DROP POLICY IF EXISTS "Users can delete their own habits" ON public.habits;

CREATE POLICY "Users can view their own habits" ON public.habits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own habits" ON public.habits FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own habits" ON public.habits FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own habits" ON public.habits FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 2. HABIT_LOGS TABLE (should already exist)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.habit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    habit_id UUID NOT NULL REFERENCES public.habits(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Add missing columns to habit_logs
ALTER TABLE public.habit_logs ADD COLUMN IF NOT EXISTS value NUMERIC;
ALTER TABLE public.habit_logs ADD COLUMN IF NOT EXISTS notes TEXT;

-- Enable RLS on habit_logs
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- Habit logs RLS policies
DROP POLICY IF EXISTS "Users can view their own logs" ON public.habit_logs;
DROP POLICY IF EXISTS "Users can insert their own logs" ON public.habit_logs;
DROP POLICY IF EXISTS "Users can update their own logs" ON public.habit_logs;
DROP POLICY IF EXISTS "Users can delete their own logs" ON public.habit_logs;

CREATE POLICY "Users can view their own logs" ON public.habit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own logs" ON public.habit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own logs" ON public.habit_logs FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own logs" ON public.habit_logs FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 3. TASKS TABLE (new)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    due_date DATE,
    priority INTEGER DEFAULT 0,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on tasks
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Tasks RLS policies
DROP POLICY IF EXISTS "Users can view their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can insert their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can update their own tasks" ON public.tasks;
DROP POLICY IF EXISTS "Users can delete their own tasks" ON public.tasks;

CREATE POLICY "Users can view their own tasks" ON public.tasks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own tasks" ON public.tasks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tasks" ON public.tasks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own tasks" ON public.tasks FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 4. INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_id ON public.habit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_id ON public.habit_logs(habit_id);
CREATE INDEX IF NOT EXISTS idx_habit_logs_date ON public.habit_logs(date);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON public.tasks(due_date);

-- ============================================================
-- 5. ENABLE REALTIME (for live updates)
-- ============================================================
-- Note: If tables are already in supabase_realtime, these will be skipped
-- Run these individually if needed - they may already be enabled

DO $$
BEGIN
    -- Try to add habits to realtime (ignore if already exists)
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.habits;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'habits already in supabase_realtime';
    END;
    
    -- Try to add habit_logs to realtime
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.habit_logs;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'habit_logs already in supabase_realtime';
    END;
    
    -- Try to add tasks to realtime
    BEGIN
        ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
    EXCEPTION WHEN duplicate_object THEN
        RAISE NOTICE 'tasks already in supabase_realtime';
    END;
END $$;

-- ============================================================
-- VERIFICATION QUERIES (run these to check everything worked)
-- ============================================================
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'habits';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'habit_logs';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'tasks';

-- ============================================================
-- DONE! Your database is now fully configured.
-- ============================================================
