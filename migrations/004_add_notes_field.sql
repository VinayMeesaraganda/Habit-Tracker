-- ==========================================
-- NOTES FIELD MIGRATION
-- ==========================================
-- Adds notes/journaling capability to habit logs
-- ==========================================

-- Add notes column to habit_logs table
ALTER TABLE public.habit_logs 
ADD COLUMN IF NOT EXISTS notes TEXT;

-- ==========================================
-- VERIFICATION:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'habit_logs' AND column_name = 'notes';
-- ==========================================
