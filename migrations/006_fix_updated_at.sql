-- ============================================================
-- FIX: Add missing updated_at column to habit_logs
-- ============================================================
-- Run this in Supabase SQL Editor

-- Add the missing column
ALTER TABLE public.habit_logs 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Optional: Drop any trigger that might be causing issues
-- (if there's an auto-update trigger that was set up)
DROP TRIGGER IF EXISTS set_updated_at ON public.habit_logs;

-- Done! The error should be resolved now.
