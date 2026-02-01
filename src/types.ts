/**
 * Core TypeScript interfaces for the Habit Tracker app
 */

// Habit frequency settings
export type FrequencyType = 'daily' | 'weekdays' | 'weekends' | 'weekly' | 'custom';

export interface HabitFrequency {
    type: FrequencyType;
    days_per_week?: number;   // For 'weekly': 1-6 times per week
    custom_days?: number[];   // For 'custom': array of day indices (0=Sunday, 6=Saturday)
}

export interface Habit {
    id: string;
    user_id: string;
    name: string;
    category: string;
    month_goal: number;
    priority?: number; // Optional - habits ordered by created_at if not set
    type: 'daily' | 'weekly';
    frequency?: HabitFrequency; // New: user-defined repeat schedule
    created_at: string;
    updated_at: string;
    archived_at?: string | null; // ISO Date string for when the habit was archived
    skip_dates?: string[]; // Array of ISO date strings to skip (preserves streaks)
    // Quantifiable habit fields
    is_quantifiable?: boolean; // If true, habit tracks numeric values
    target_value?: number; // Daily target (e.g., 2000 for 2000ml water)
    unit?: string; // Unit of measurement (e.g., "ml", "pages", "minutes")
    // Focus Timer fields
    timer_minutes?: number; // Focus timer duration in minutes
    auto_complete?: boolean; // Auto-complete habit when timer finishes
    // Smart Reminders
    reminder_time?: string; // "HH:MM" (24h) or null if disabled
}

export interface HabitLog {
    id: string;
    user_id: string;
    habit_id: string;
    date: string; // ISO format "2025-12-01" - stored as DATE in DB
    value?: number; // For quantifiable habits: the amount logged (e.g., 500 for 500ml)
    notes?: string; // Optional journal/notes for the log entry
    // Note: No 'completed' field - existence of log = completed
    // For quantifiable: sum of values for date determines if target met
}

export interface User {
    id: string;
    email: string;
    full_name?: string;
    gender?: string;
}

// Task interface for to-do list
export interface Task {
    id: string;
    user_id: string;
    title: string;
    description?: string;
    due_date?: string; // ISO date string
    priority: 0 | 1 | 2; // 0=normal, 1=high, 2=urgent
    completed_at?: string | null;
    created_at: string;
    updated_at: string;
}

// Analytics interfaces
export interface HabitMetrics {
    habitId: string;
    completed: number;
    goal: number;
    percentage: number;
    completedText: string; // "3 / 25"
}

export interface DailyAggregate {
    date: string;
    completed: boolean; // TRUE if at least 1 habit completed
    notCompleted: boolean;
    habitsCount: number;
    percentage: number;
}

export interface WeeklyMetrics {
    weekNumber: number; // 1-5
    completed: number;
    notCompleted: number;
    habitsCount: number;
    goal: number;
    percentage: number;
}

export interface CategoryMetrics {
    category: string;
    goal: number;
    progress: number;
    remaining: number;
    percentage: number;
}

export interface ChartDataRow {
    date: string;
    dayIndex: number;
    habitsCompleted: number;
    percentage: number;
    category?: string;
    goal?: number;
    progress?: number;
    remaining?: number;
}

// Predefined categories with emojis
export const HABIT_CATEGORIES = [
    'Health & Fitness 💪',
    'Mindfulness 🧘',
    'Growth 📚', // Merged Learning & Creativity
    'Productivity 🎯',
    'Social 👥',
    'Finance 💰',
    'Other 📌',
] as const;

export type HabitCategory = typeof HABIT_CATEGORIES[number];
