-- ==========================================
-- FOCUS TIMER MIGRATION
-- ==========================================
-- Adds timer fields to habits table for Pomodoro-style focus tracking
-- ==========================================

-- Add timer fields to habits table
ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS timer_minutes INTEGER;

ALTER TABLE public.habits 
ADD COLUMN IF NOT EXISTS auto_complete BOOLEAN DEFAULT false;

-- ==========================================
-- VERIFICATION:
-- Run this to confirm the columns were added:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'habits' AND column_name IN ('timer_minutes', 'auto_complete');
-- ==========================================
