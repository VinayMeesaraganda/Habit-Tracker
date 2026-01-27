-- Migration 007: Add habit frequency settings
-- Allows users to set habits as daily, weekdays, weekends, weekly, or custom days

-- Add frequency column with JSONB type and sensible default
ALTER TABLE habits ADD COLUMN IF NOT EXISTS frequency jsonb DEFAULT '{"type": "daily"}'::jsonb;

-- Add a comment for documentation
COMMENT ON COLUMN habits.frequency IS 'Habit frequency settings: type (daily|weekdays|weekends|weekly|custom), days_per_week (for weekly), custom_days (array of 0-6 for custom)';

-- Create an index for efficient querying by frequency type
CREATE INDEX IF NOT EXISTS idx_habits_frequency_type ON habits ((frequency->>'type'));
