/**
 * Frequency Utilities - Helper functions for habit scheduling
 */

import {
    isWeekend,
    getDay,
    eachDayOfInterval,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    isSameMonth
} from 'date-fns';
import { Habit, HabitFrequency } from '../types';

/**
 * Get the default frequency (daily) for habits without one set
 */
export const getDefaultFrequency = (): HabitFrequency => ({
    type: 'daily'
});

/**
 * Get the effective frequency for a habit, defaulting to daily if not set
 */
export const getHabitFrequency = (habit: Habit): HabitFrequency => {
    return habit.frequency || getDefaultFrequency();
};

/**
 * Check if a habit is scheduled for a specific date
 */
export const isHabitScheduledForDate = (habit: Habit, date: Date): boolean => {
    const frequency = getHabitFrequency(habit);
    const dayOfWeek = getDay(date); // 0 = Sunday, 6 = Saturday

    // Check if habit existed on this date
    const habitCreated = new Date(habit.created_at);
    habitCreated.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);

    if (checkDate < habitCreated) {
        return false;
    }

    switch (frequency.type) {
        case 'daily':
            return true;

        case 'weekdays':
            // Monday(1) to Friday(5)
            return dayOfWeek >= 1 && dayOfWeek <= 5;

        case 'weekends':
            // Saturday(6) and Sunday(0)
            return dayOfWeek === 0 || dayOfWeek === 6;

        case 'weekly':
            // "X times per week" - show every day, user picks which days
            return true;

        case 'custom':
            // Check if this day is in the custom days array
            return frequency.custom_days?.includes(dayOfWeek) ?? false;

        default:
            return true;
    }
};

/**
 * Get all scheduled dates for a habit within a date range
 */
export const getScheduledDaysInRange = (habit: Habit, start: Date, end: Date): Date[] => {
    const habitCreated = new Date(habit.created_at);
    habitCreated.setHours(0, 0, 0, 0);

    // Effective start is the later of range start or habit creation
    const effectiveStart = start > habitCreated ? start : habitCreated;

    if (effectiveStart > end) {
        return [];
    }

    const allDays = eachDayOfInterval({ start: effectiveStart, end });
    return allDays.filter(date => isHabitScheduledForDate(habit, date));
};

/**
 * Get the number of scheduled days in a specific month
 */
export const getScheduledDaysInMonth = (habit: Habit, month: Date): number => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);

    // If viewing current month, only count up to today
    const today = new Date();
    const effectiveEnd = isSameMonth(month, today) && today < monthEnd ? today : monthEnd;

    return getScheduledDaysInRange(habit, monthStart, effectiveEnd).length;
};

/**
 * Get the number of scheduled days in a week
 */
export const getScheduledDaysInWeek = (habit: Habit, weekStart: Date): number => {
    const start = startOfWeek(weekStart, { weekStartsOn: 0 }); // Sunday
    const end = endOfWeek(weekStart, { weekStartsOn: 0 });

    return getScheduledDaysInRange(habit, start, end).length;
};

/**
 * Count weekdays in a month
 */
export const getWeekdaysInMonth = (month: Date): number => {
    const allDays = eachDayOfInterval({
        start: startOfMonth(month),
        end: endOfMonth(month)
    });
    return allDays.filter(d => !isWeekend(d)).length;
};

/**
 * Count weekend days in a month
 */
export const getWeekendsInMonth = (month: Date): number => {
    const allDays = eachDayOfInterval({
        start: startOfMonth(month),
        end: endOfMonth(month)
    });
    return allDays.filter(d => isWeekend(d)).length;
};

/**
 * Get a human-readable label for a frequency setting
 */
export const getFrequencyLabel = (frequency: HabitFrequency): string => {
    switch (frequency.type) {
        case 'daily':
            return 'Every day';
        case 'weekdays':
            return 'Weekdays';
        case 'weekends':
            return 'Weekends';
        case 'weekly':
            return `${frequency.days_per_week || 1}× per week`;
        case 'custom':
            const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
            const selected = frequency.custom_days?.map(d => days[d]).join(', ') || '';
            return selected || 'Custom';
        default:
            return 'Daily';
    }
};

/**
 * Check if an off-day should NOT break the streak
 * Returns true if the date is an "off-day" for this habit
 */
export const isOffDay = (habit: Habit, date: Date): boolean => {
    return !isHabitScheduledForDate(habit, date);
};
