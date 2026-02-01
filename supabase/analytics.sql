-- ==============================================================================
-- Habit Tracker Analytics & Optimization
-- Run this script in the Supabase SQL Editor to enable server-side analytics.
-- ==============================================================================

-- 1. Enable RLS on all tables (Safety Check)
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- 2. Indexing for Performance
-- Crucial for fast querying of logs by date and user
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date ON habit_logs(user_id, date);
CREATE INDEX IF NOT EXISTS idx_habits_user ON habits(user_id);

-- 3. RPC: Get Monthly Stats Efficiently
-- Calculates completion counts per habit for a given month without fetching all logs
CREATE OR REPLACE FUNCTION get_monthly_habit_stats(month_start DATE)
RETURNS TABLE (
  habit_id UUID,
  completion_count BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    l.habit_id,
    COUNT(l.id) as completion_count
  FROM habit_logs l
  WHERE 
    l.user_id = auth.uid() 
    AND l.date >= month_start 
    AND l.date < (month_start + INTERVAL '1 month')
  GROUP BY l.habit_id;
END;
$$;

-- 4. RPC: Get Global User Stats
-- Calculates total habits and completions efficiently
CREATE OR REPLACE FUNCTION get_user_overview()
RETURNS TABLE (
  total_habits BIGINT,
  total_completions BIGINT
) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT
    (SELECT COUNT(*) FROM habits WHERE user_id = auth.uid() AND archived_at IS NULL),
    (SELECT COUNT(*) FROM habit_logs WHERE user_id = auth.uid());
END;
$$;
