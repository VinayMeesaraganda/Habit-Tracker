-- ==========================================
-- OPTIMIZED HABIT TRACKER SCHEMA
-- Use this for NEW deployments
-- ==========================================

-- ==========================================
-- 1. Table Creation
-- ==========================================

-- Table: habits (unchanged, already optimized)
CREATE TABLE IF NOT EXISTS public.habits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  type TEXT CHECK (type IN ('daily', 'weekly')) NOT NULL DEFAULT 'daily',
  month_goal INTEGER NOT NULL DEFAULT 0,
  priority INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  archived_at TIMESTAMP WITH TIME ZONE
);

-- Table: habit_logs (OPTIMIZED)
CREATE TABLE IF NOT EXISTS public.habit_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id UUID REFERENCES public.habits(id) ON DELETE CASCADE NOT NULL,
  date DATE NOT NULL,
  
  -- Constraint to ensure one log per habit per date
  UNIQUE(habit_id, date)
);

-- ==========================================
-- 2. Indexes for Performance
-- ==========================================

-- Habits indexes
CREATE INDEX IF NOT EXISTS idx_habits_user_id ON public.habits(user_id);

-- Habit logs indexes (optimized composite indexes)
CREATE INDEX IF NOT EXISTS idx_habit_logs_user_date 
    ON public.habit_logs(user_id, date DESC);

CREATE INDEX IF NOT EXISTS idx_habit_logs_habit_date 
    ON public.habit_logs(habit_id, date DESC);

-- ==========================================
-- 3. Row Level Security (RLS) & Policies
-- ==========================================

-- Enable RLS
ALTER TABLE public.habits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habit_logs ENABLE ROW LEVEL SECURITY;

-- Policies for 'habits'
CREATE POLICY "Users can view their own habits"
ON public.habits FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own habits"
ON public.habits FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own habits"
ON public.habits FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own habits"
ON public.habits FOR DELETE
USING (auth.uid() = user_id);

-- Policies for 'habit_logs'
CREATE POLICY "Users can view their own logs"
ON public.habit_logs FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own logs"
ON public.habit_logs FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own logs"
ON public.habit_logs FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own logs"
ON public.habit_logs FOR DELETE
USING (auth.uid() = user_id);

-- ==========================================
-- 4. Helper Functions (Optional)
-- ==========================================

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for habits table
DROP TRIGGER IF EXISTS update_habits_updated_at ON public.habits;
CREATE TRIGGER update_habits_updated_at
    BEFORE UPDATE ON public.habits
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ==========================================
-- NOTES:
-- ==========================================
-- 1. habit_logs no longer has 'completed' column
--    - Existence of row = completed
--    - No row = not completed
-- 2. habit_logs no longer has timestamps
--    - 'date' field is sufficient
--    - Saves ~16 bytes per row
-- 3. date is now DATE type instead of TEXT
--    - Saves ~6 bytes per row
--    - Better query performance
-- 4. Composite indexes optimize common queries
-- ==========================================
