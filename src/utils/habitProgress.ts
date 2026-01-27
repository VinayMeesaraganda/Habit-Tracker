import { Habit, HabitLog } from '../types';
import { startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { getDynamicGoal } from './analytics';

/**
 * Calculate monthly progress for a specific habit
 * Returns completed count, goal, and percentage
 */
export function getHabitMonthlyProgress(
    habit: Habit,
    logs: HabitLog[],
    month: Date
): { completed: number; goal: number; percentage: number } {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    // Count completions this month for this habit
    const completed = logs.filter(log => {
        if (log.habit_id !== habit.id) return false;
        const logDate = parseISO(log.date);
        return logDate >= monthStart && logDate <= monthEnd;
    }).length;

    // Get dynamic goal (accounts for creation/archive dates)
    const goal = getDynamicGoal(habit, month);

    // Calculate percentage
    const percentage = goal > 0 ? Math.round((completed / goal) * 100) : 0;

    return { completed, goal, percentage };
}

/**
 * Get streak color based on milestone
 */
export function getStreakColor(streak: number): string {
    if (streak >= 30) return '#FFD700'; // Gold
    if (streak >= 7) return '#FF6B35'; // Orange
    return '#FF4444'; // Red
}

/**
 * Format streak display text
 */
export function formatStreak(streak: number): string {
    if (streak === 0) return '';
    if (streak === 1) return '🔥 1';
    return `🔥 ${streak}`;
}
