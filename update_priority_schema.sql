-- 1. Add priority column
ALTER TABLE public.habits 
ADD COLUMN priority INTEGER DEFAULT 999;

-- 2. Backfill existing priorities based on creation date
-- Using a CTE to calculate the rank for each user's habits
WITH ranked_habits AS (
  SELECT 
    id, 
    ROW_NUMBER() OVER (PARTITION BY user_id ORDER BY created_at ASC) as new_priority
  FROM public.habits
)
UPDATE public.habits
SET priority = ranked_habits.new_priority
FROM ranked_habits
WHERE public.habits.id = ranked_habits.id;

-- 3. Add an index for faster sorting
CREATE INDEX IF NOT EXISTS idx_habits_priority ON public.habits(user_id, priority);
