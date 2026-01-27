-- ==========================================
-- SKIP DAYS FEATURE MIGRATION
-- ==========================================
-- Adds skip_dates array column to habits table
-- This allows users to mark specific dates as "skip"
-- so their streak is preserved during sick days/vacations
-- ==========================================

-- Add skip_dates column to habits table
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS skip_dates DATE[] DEFAULT '{}';

-- Create index for faster skip date lookups (optional, for large datasets)
CREATE INDEX IF NOT EXISTS idx_habits_skip_dates 
ON public.habits USING GIN(skip_dates);

-- ==========================================
-- VERIFICATION:
-- Run this to confirm the column was added:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'habits' AND column_name = 'skip_dates';
-- ==========================================
