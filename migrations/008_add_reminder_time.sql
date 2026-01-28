-- Add reminder_time column to habits table
alter table public.habits 
add column if not exists reminder_time text; -- Stores time as "HH:MM" (24h format)

-- Add comment for documentation
comment on column public.habits.reminder_time is 'Optional daily reminder time in HH:MM format';
