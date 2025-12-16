/**
 * Analytics utility functions
 * Replicates Excel formulas for habit tracking metrics
 */

import { Habit, HabitLog, HabitMetrics, DailyAggregate, WeeklyMetrics, CategoryMetrics, ChartDataRow } from '../types';
import {

    endOfMonth,
    eachDayOfInterval,
    format,
    isSameDay,
    addDays,
    getDay
} from 'date-fns';

/**
 * Get completed count for a habit in a given month
 * Excel equivalent: =COUNTIF(L30:AP30, TRUE)
 */
export function getHabitCompleted(
    habitId: string,
    logs: HabitLog[],
    monthStart: Date
): number {
    const monthEnd = endOfMonth(monthStart);

    return logs.filter(log => {
        const logDate = new Date(log.date);
        return (
            log.habit_id === habitId &&
            log.completed &&
            logDate >= monthStart &&
            logDate <= monthEnd
        );
    }).length;
}

/**
 * Get habit metrics (completed, goal, percentage)
 * Excel equivalent: =COUNTIF(L31:AP31,TRUE)/J31
 */
export function getHabitMetrics(
    habit: Habit,
    logs: HabitLog[],
    monthStart: Date
): HabitMetrics {
    const completed = getHabitCompleted(habit.id, logs, monthStart);
    const goal = habit.month_goal;
    const percentage = goal > 0 ? completed / goal : 0;

    return {
        habitId: habit.id,
        completed,
        goal,
        percentage,
        completedText: `${completed} / ${goal}`,
    };
}

/**
 * Check if a day has any completed habits
 * Excel equivalent: =IF(COUNTA($B30:$B49)<COUNTIF(L30:L49,TRUE), ...)
 */
export function getDailyCompleted(
    date: Date,
    logs: HabitLog[]
): boolean {
    return logs.some(log =>
        isSameDay(new Date(log.date), date) && log.completed
    );
}

/**
 * Get daily aggregate metrics for all days in a month
 */
export function getDailyAggregates(
    monthStart: Date,
    logs: HabitLog[],
    totalHabits: number
): DailyAggregate[] {
    const days = eachDayOfInterval({
        start: monthStart,
        end: endOfMonth(monthStart),
    });

    return days.map(date => {
        const dayLogs = logs.filter(log => isSameDay(new Date(log.date), date));
        const completedCount = dayLogs.filter(log => log.completed).length;
        const completed = completedCount > 0;

        return {
            date: format(date, 'yyyy-MM-dd'),
            completed,
            notCompleted: !completed,
            habitsCount: completedCount,
            percentage: totalHabits > 0 ? completedCount / totalHabits : 0,
        };
    });
}



/**
 * Get dates for a specific week in a month
 */
function getWeekDates(weekNumber: number, monthStart: Date): Date[] {
    const startDay = (weekNumber - 1) * 7;
    const dates: Date[] = [];

    for (let i = 0; i < 7; i++) {
        const date = addDays(monthStart, startDay + i);
        if (date <= endOfMonth(monthStart)) {
            dates.push(date);
        }
    }

    return dates;
}

/**
 * Get weekly metrics (Week 1-5)
 * Excel equivalent: Weekly aggregation formulas
 */
export function getWeeklyMetrics(
    weekNumber: number,
    monthStart: Date,
    habits: Habit[],
    logs: HabitLog[]
): WeeklyMetrics {
    const weekDates = getWeekDates(weekNumber, monthStart);
    const weekDateStrings = weekDates.map(d => format(d, 'yyyy-MM-dd'));

    const weekLogs = logs.filter(log => weekDateStrings.includes(log.date));
    const completed = weekLogs.filter(log => log.completed).length;
    const totalPossible = habits.filter(h => h.type === 'daily').length * weekDates.length;
    const goal = totalPossible;

    return {
        weekNumber,
        completed,
        notCompleted: goal - completed,
        habitsCount: completed,
        goal,
        percentage: goal > 0 ? completed / goal : 0,
    };
}

/**
 * Get overall monthly metrics (all 5 weeks combined)
 */
export function getOverallMetrics(
    monthStart: Date,
    habits: Habit[],
    logs: HabitLog[]
): WeeklyMetrics {
    const allWeeks = [1, 2, 3, 4, 5].map(week =>
        getWeeklyMetrics(week, monthStart, habits, logs)
    );

    const totalCompleted = allWeeks.reduce((sum, week) => sum + week.completed, 0);
    const totalGoal = allWeeks.reduce((sum, week) => sum + week.goal, 0);

    return {
        weekNumber: 0, // 0 indicates "overall"
        completed: totalCompleted,
        notCompleted: totalGoal - totalCompleted,
        habitsCount: totalCompleted,
        goal: totalGoal,
        percentage: totalGoal > 0 ? totalCompleted / totalGoal : 0,
    };
}

/**
 * Get category-based analytics
 * Excel equivalent: Category grouping and aggregation
 */
export function getCategoryMetrics(
    category: string,
    monthStart: Date,
    habits: Habit[],
    logs: HabitLog[]
): CategoryMetrics {
    const categoryHabits = habits.filter(h => h.category === category);
    const goal = categoryHabits.reduce((sum, h) => sum + h.month_goal, 0);
    const progress = categoryHabits.reduce((sum, h) =>
        sum + getHabitCompleted(h.id, logs, monthStart), 0
    );

    return {
        category,
        goal,
        progress,
        remaining: goal - progress,
        percentage: goal > 0 ? progress / goal : 0,
    };
}

/**
 * Get all unique categories from habits
 */
export function getUniqueCategories(habits: Habit[]): string[] {
    return Array.from(new Set(habits.map(h => h.category)));
}

/**
 * Generate chart data table (day-level rows)
 * Excel equivalent: Chart-data table generation
 */
export function generateChartData(
    monthStart: Date,
    habits: Habit[],
    logs: HabitLog[]
): ChartDataRow[] {
    const days = eachDayOfInterval({
        start: monthStart,
        end: endOfMonth(monthStart),
    });

    return days.map((date, index) => {
        const dayLogs = logs.filter(log => isSameDay(new Date(log.date), date));
        const completedCount = dayLogs.filter(log => log.completed).length;
        const totalHabits = habits.filter(h => h.type === 'daily').length;

        return {
            date: format(date, 'yyyy-MM-dd'),
            dayIndex: index + 1,
            habitsCompleted: completedCount,
            percentage: totalHabits > 0 ? (completedCount / totalHabits) * 100 : 0,
        };
    });
}

/**
 * Get weekday symbol (M, T, W, T, F, S, S)
 * Excel equivalent: Weekday mapping table
 */
export function getWeekdaySymbol(date: Date): string {
    const symbols = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
    return symbols[getDay(date)];
}
