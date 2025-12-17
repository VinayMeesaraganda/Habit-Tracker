/**
 * Core TypeScript interfaces for the Habit Tracker app
 */

export interface Habit {
    id: string;
    user_id: string;
    name: string;
    category: string;
    month_goal: number;
    priority: number;
    type: 'daily' | 'weekly';
    created_at: string;
    updated_at: string;
    archived_at?: string | null; // ISO Date string for when the habit was created
}

export interface HabitLog {
    id: string;
    user_id: string;
    habit_id: string;
    date: string; // ISO format "2025-12-01"
    completed: boolean;
    created_at: string;
    updated_at: string;
}

export interface User {
    id: string;
    email: string;
    full_name?: string;
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
    'Health ❤️‍🩹',
    'Fitness 💪',
    'Mindfulness 🧘',
    'Learning 📚',
    'Productivity 🎯',
    'Social 👥',
    'Finance 💰',
    'Creativity 🎨',
    'Other 📌',
] as const;

export type HabitCategory = typeof HABIT_CATEGORIES[number];
