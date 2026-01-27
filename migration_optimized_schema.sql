-- ==========================================
-- HABIT TRACKER DATABASE OPTIMIZATION MIGRATION
-- ==========================================
-- This migration optimizes the habit_logs table by:
-- 1. Removing the 'completed' boolean (completion-only storage)
-- 2. Removing redundant timestamps (created_at, updated_at)
-- 3. Converting date from TEXT to DATE type
-- 4. Adding optimized composite index
-- 5. Cleaning up existing data
-- ==========================================

-- STEP 1: Backup existing data (optional but recommended)
-- You can export your data before running this migration

-- STEP 2: Delete all uncompleted logs (they're redundant)
DELETE FROM public.habit_logs WHERE completed = false;

-- STEP 3: Remove redundant columns
ALTER TABLE public.habit_logs DROP COLUMN IF EXISTS completed;
ALTER TABLE public.habit_logs DROP COLUMN IF EXISTS created_at;
ALTER TABLE public.habit_logs DROP COLUMN IF EXISTS updated_at;

-- STEP 4: Convert date column from TEXT to DATE
-- First, ensure all dates are in correct format


-- Then change the column type
ALTER TABLE public.habit_logs 
    ALTER COLUMN date TYPE DATE 
    USING date::DATE;

-- STEP 5: Add optimized composite index for faster queries
DROP INDEX IF EXISTS idx_habit_logs_user_id;
DROP INDEX IF EXISTS idx_habit_logs_date;

CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date 
    ON public.habit_logs(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date 
    ON public.habit_logs(habit_id, date DESC);

-- STEP 6: Verify the new schema
-- Run this to check the table structure:
-- SELECT column_name, data_type, is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'habit_logs' AND table_schema = 'public';

-- ==========================================
-- EXPECTED FINAL SCHEMA:
-- ==========================================
-- habit_logs:
--   - id (uuid, primary key)
--   - user_id (uuid, foreign key)
--   - habit_id (uuid, foreign key)
--   - date (DATE)
--   - UNIQUE(habit_id, date)
-- ==========================================

-- STEP 7: Vacuum the table to reclaim space
VACUUM FULL public.habit_logs;

-- ==========================================
-- ROLLBACK PLAN (if needed):
-- ==========================================
-- If you need to rollback, run:
-- ALTER TABLE public.habit_logs ADD COLUMN completed BOOLEAN DEFAULT true;
-- ALTER TABLE public.habit_logs ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- ALTER TABLE public.habit_logs ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
-- ALTER TABLE public.habit_logs ALTER COLUMN date TYPE TEXT;
-- ==========================================
