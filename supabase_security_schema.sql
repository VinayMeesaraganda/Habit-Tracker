-- ==========================================
-- 1. Table Creation
-- ==========================================

-- Table: habits
create table if not exists public.habits (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  category text not null,
  type text check (type in ('daily', 'weekly')) not null default 'daily',
  month_goal integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  archived_at timestamp with time zone
);

-- Table: habit_logs
create table if not exists public.habit_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  habit_id uuid references public.habits(id) on delete cascade not null,
  date text not null, -- Stored as ISO string YYYY-MM-DD
  completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Constraint to ensure one log per habit per date
  unique(habit_id, date)
);

-- Indexes for performance
create index if not exists idx_habits_user_id on public.habits(user_id);
create index if not exists idx_habit_logs_user_id on public.habit_logs(user_id);
create index if not exists idx_habit_logs_date on public.habit_logs(date);
create index if not exists idx_habit_logs_habit_id on public.habit_logs(habit_id);


-- ==========================================
-- 2. Row Level Security (RLS) & Policies
-- ==========================================

-- Enable RLS
alter table public.habits enable row level security;
alter table public.habit_logs enable row level security;

-- Policies for 'habits'

create policy "Users can view their own habits"
on public.habits for select
using (auth.uid() = user_id);

create policy "Users can insert their own habits"
on public.habits for insert
with check (auth.uid() = user_id);

create policy "Users can update their own habits"
on public.habits for update
using (auth.uid() = user_id);

create policy "Users can delete their own habits"
on public.habits for delete
using (auth.uid() = user_id);

-- Policies for 'habit_logs'

create policy "Users can view their own logs"
on public.habit_logs for select
using (auth.uid() = user_id);

create policy "Users can insert their own logs"
on public.habit_logs for insert
with check (auth.uid() = user_id);

create policy "Users can update their own logs"
on public.habit_logs for update
using (auth.uid() = user_id);

create policy "Users can delete their own logs"
on public.habit_logs for delete
using (auth.uid() = user_id);

-- Storage (Avatar) - Optional
-- insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true);
-- create policy "Avatar images are publicly accessible." on storage.objects for select using ( bucket_id = 'avatars' );
-- create policy "Anyone can upload an avatar." on storage.objects for insert with check ( bucket_id = 'avatars' );

