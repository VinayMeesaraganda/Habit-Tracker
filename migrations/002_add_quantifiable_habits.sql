-- ==========================================
-- QUANTIFIABLE HABITS MIGRATION
-- ==========================================
-- Adds fields to support habits with numeric targets
-- e.g., "Drink 2000ml water" instead of just "Drink water"
-- ==========================================

-- Add quantifiable fields to habits table
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS is_quantifiable BOOLEAN DEFAULT false;

ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS target_value INTEGER;

ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS unit TEXT;

-- Add value field to habit_logs for tracking partial progress
ALTER TABLE public.habit_logs 
ADD COLUMN IF NOT EXISTS value INTEGER;

-- ==========================================
-- VERIFICATION:
-- Run this to confirm the columns were added:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'habits' AND column_name IN ('is_quantifiable', 'target_value', 'unit');
-- 
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'habit_logs' AND column_name = 'value';
-- ==========================================
