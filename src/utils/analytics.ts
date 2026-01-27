import { Habit, HabitLog } from '../types';
import { isSameDay, subDays, startOfDay, parseISO, startOfWeek, endOfWeek, subWeeks, getDaysInMonth, startOfMonth, endOfMonth, format, isSameMonth, getDate } from 'date-fns';

/**
 * Calculates the current streak for a habit.
 * Streak = consecutive days/weeks ending today or yesterday.
 * Skip dates are counted as "done" to preserve streaks.
 */
export function calculateStreak(habit: Habit, logs: HabitLog[]): number {
    // Helper to check if a date is skipped
    const isSkipped = (date: Date): boolean => {
        if (!habit.skip_dates || habit.skip_dates.length === 0) return false;
        const dateStr = format(date, 'yyyy-MM-dd');
        return habit.skip_dates.includes(dateStr);
    };

    // Helper to check if date is scheduled
    const isScheduled = (date: Date): boolean => {
        // Import this dynamically or duplicate simple logic to avoid circular deps if needed
        // For now assuming we can replicate the simple check or import
        // Since we can't import easily here without potential cycles, let's implement the logic
        // This mirrors isHabitScheduledForDate from frequencyUtils
        if (!habit.frequency) return true; // Default to daily if no frequency

        const type = habit.frequency.type;
        const dayOfWeek = date.getDay(); // 0 = Sunday

        if (type === 'daily') return true;
        if (type === 'weekdays') return dayOfWeek >= 1 && dayOfWeek <= 5;
        if (type === 'weekends') return dayOfWeek === 0 || dayOfWeek === 6;
        if (type === 'custom') return (habit.frequency.custom_days || []).includes(dayOfWeek);
        if (type === 'weekly') return true; // Handled separately
        return true;
    };

    let streak = 0;
    const today = startOfDay(new Date());
    let checkDate = today;

    // Special handling for "X times per week" habits
    if (habit.frequency?.type === 'weekly') {
        const targetPerWeek = habit.frequency.days_per_week || 1;
        let currentWeekStart = startOfWeek(today, { weekStartsOn: 1 }); // Monday start

        // Check current week
        const checkWeek = (weekStart: Date) => {
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
            const logsInWeek = logs.filter(l => {
                const d = parseISO(l.date);
                return d >= weekStart && d <= weekEnd && l.habit_id === habit.id;
            });
            return logsInWeek.length >= targetPerWeek;
        };

        // If current week is done, streak starts. If not, check if we can still do it?
        // Actually for "current streak", if we met last week's goal, streak is usually valid. 
        // If we haven't met THIS week's goal yet, it shouldn't break the streak unless the week is over.
        // But usually streak counts consecutive periods.

        // Simplified: Count consecutive weeks where goal was met
        // Start checking from THIS week. If this week is met, count it. 
        // If not met *yet*, but week isn't over, maybe don't count it but don't break simple streak?
        // Standard logic: Check previous completed weeks + current week if completed.

        if (checkWeek(currentWeekStart)) {
            streak++;
        }

        // Check past weeks
        while (true) {
            currentWeekStart = subWeeks(currentWeekStart, 1);
            if (checkWeek(currentWeekStart)) {
                streak++;
            } else {
                break;
            }
        }
        return streak;
    }

    // Standard logic (Daily/Custom/Weekdays/Weekends)
    // 1. Check today
    // If completed today: Streak starts at 1, check yesterday
    // If NOT completed today:
    //    Is it scheduled today? 
    //       Yes: Streak is 0 (unless skipped/vacation mode). 
    //            BUT standard behavior: if I check at 8am and haven't done it yet, streak shouldn't be 0 if I had a streak yesterday.
    //            Usually "Current Streak" includes today if done, or continues from yesterday.
    //            If I missed yesterday (and it was scheduled), THEN streak is 0.
    //       No (Off day): Streak is carried over from yesterday.

    // Check if streak is alive (completed today, or completed yesterday, or off-day today)
    const completedToday = logs.some(l => {
        if (l.habit_id !== habit.id || !isSameDay(parseISO(l.date), today)) return false;
        if (habit.is_quantifiable) {
            return (l.value || 0) >= (habit.target_value || 1);
        }
        return true;
    });

    // If done today, start with 1 and look back
    if (completedToday) {
        streak = 1;
        checkDate = subDays(today, 1);
    } else {
        // Not done today. 
        // If today is scheduled and not skipped, streak maintains ONLY if we look at yesterday.
        // Actually, usually we start checking from YESTERDAY if today is incomplete.
        // But if today IS scheduled and missed (so far), we just report the streak ending yesterday.
        checkDate = subDays(today, 1);
    }

    // Iterate backwards
    while (true) {
        const dateStr = format(checkDate, 'yyyy-MM-dd');
        const isDayScheduled = isScheduled(checkDate);

        if (!isDayScheduled) {
            // Off day - skip it, don't break streak, don't increment streak
            checkDate = subDays(checkDate, 1);
            continue;
        }

        const isCompleted = logs.some(l => {
            if (l.habit_id !== habit.id || l.date !== dateStr) return false;
            if (habit.is_quantifiable) {
                return (l.value || 0) >= (habit.target_value || 1);
            }
            return true;
        });
        const wasSkipped = isSkipped(checkDate);

        if (isCompleted || wasSkipped) {
            streak++;
            checkDate = subDays(checkDate, 1);
        } else {
            // Missed a scheduled day - streak ends
            break;
        }
    }

    return streak;
}



/**
 * Calculates if the user is On Track, Behind, or Ahead for a monthly goal.
 */
/**
 * Calculate the proportional goal for a habit based on when it was created.
 * If viewing the creation month: Goal = (Active Days / Total Days) * Original Goal.
 */
/*
 * Calculate the proportional goal for a habit based on creation and archive dates.
 * Goal scales based on how many days the habit was "active" in the month.
 */
export function getDynamicGoal(habit: Habit, currentMonth: Date | string): number {
    const originalGoal = habit.month_goal || 1;

    // Parse View Month
    const viewMonth = typeof currentMonth === 'string' ? parseISO(currentMonth) : currentMonth;
    const totalDaysInMonth = getDaysInMonth(viewMonth);
    const viewMonthStart = startOfMonth(viewMonth);
    const viewMonthEnd = endOfMonth(viewMonth);

    // Determine Active Range within this month
    let startDay = 1;
    let endDay = totalDaysInMonth;

    // 1. Creation Date Check
    if (habit.created_at) {
        const creationDate = parseISO(habit.created_at);
        if (isSameMonth(creationDate, viewMonth)) {
            startDay = getDate(creationDate);
        } else if (creationDate > viewMonthEnd) {
            // Created in future month? Should be 0 goal.
            return 0;
        }
    }

    // 2. Archive Date Check
    if (habit.archived_at) {
        const archiveDate = parseISO(habit.archived_at);
        if (isSameMonth(archiveDate, viewMonth)) {
            endDay = getDate(archiveDate);
        } else if (archiveDate < viewMonthStart) {
            // Archived in previous month? Goal is 0.
            return 0;
        }
    }

    // Check valid range
    if (endDay < startDay) return 0;

    const activeDays = endDay - startDay + 1;

    // If fully active, return original
    if (activeDays >= totalDaysInMonth) return originalGoal;

    // Proportional Calculation
    const ratio = originalGoal / totalDaysInMonth;
    return Math.max(1, Math.ceil(activeDays * ratio));
}

/**
 * Calculates if the user is On Track, Behind, or Ahead for a monthly goal.
 */
export function getGoalPacing(habit: Habit, count: number, currentDayOfMonth: number, currentMonth: Date = new Date()): { status: 'ahead' | 'on_track' | 'behind'; color: string; message: string } {
    const goal = getDynamicGoal(habit, currentMonth);
    if (!goal || goal <= 0) return { status: 'on_track', color: 'text-gray-400', message: '' };

    const totalDays = getDaysInMonth(currentMonth);

    // For expected rate, should we base it on "Available Days" if dynamic?
    // If goal is 14 (out of 16 active days), rate = 14/16 ≈ 0.87.
    // If goal is 25 (out of 30 days), rate = 25/30 ≈ 0.83.
    // Rate is roughly similar. But "Expected Count" needs to be consistent with "Days Passed SINCE CREATION".
    // If we simply use `goal / totalDays` (14/30 = 0.46), we are setting the bar too low for the active period.
    // If current day is 20th, created 15th. Days active = 6. 
    // We expect 6 * 0.87 completions?
    // Let's refine pacing logic for creation month.

    let expectedCount = 0;
    const creationDate = habit.created_at ? parseISO(habit.created_at) : null;

    if (creationDate && isSameMonth(currentMonth, creationDate)) {
        const creationDay = getDate(creationDate);
        const daysActiveSoFar = Math.max(0, currentDayOfMonth - creationDay + 1);
        const totalActiveDaysTotal = getDaysInMonth(currentMonth) - creationDay + 1;

        const rate = goal / totalActiveDaysTotal;
        expectedCount = Math.floor(rate * daysActiveSoFar);
    } else {
        const expectedRate = goal / totalDays;
        expectedCount = Math.floor(expectedRate * currentDayOfMonth);
    }

    if (count >= goal) return { status: 'ahead', color: 'text-emerald-500', message: 'Goal Met! 🎉' };

    if (count >= expectedCount + 2) return { status: 'ahead', color: 'text-emerald-500', message: 'Ahead of schedule' };
    if (count >= expectedCount) return { status: 'on_track', color: 'text-blue-500', message: 'On track' };

    // Behind
    const deficit = expectedCount - count;
    if (deficit > 5) return { status: 'behind', color: 'text-red-500', message: 'Far behind' };
    return { status: 'behind', color: 'text-orange-500', message: 'Slightly behind' };
}

/**
 * Calculates completion metrics for a habit in a given month.
 */
export function getHabitMetrics(habit: Habit, logs: HabitLog[], currentMonth: Date) {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    // Filter logs for this habit in current month
    const monthlyLogs = logs.filter(l =>
        l.habit_id === habit.id &&
        l.date >= format(start, 'yyyy-MM-dd') &&
        l.date <= format(end, 'yyyy-MM-dd')
    );

    const count = monthlyLogs.length;
    const goal = getDynamicGoal(habit, currentMonth);
    const percentage = goal > 0 ? Math.min(count / goal, 1) : 0;

    return {
        count,
        goal,
        percentage,
        completedText: `${count}/${goal}`
    };
}

/**
 * Finds the "Best Day" in the current month (day with most habits completed).
 */
export function getBestDay(logs: HabitLog[], currentMonth: Date): { date: string | null; count: number } {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);

    const monthlyLogs = logs.filter(l =>
        l.date >= format(start, 'yyyy-MM-dd') &&
        l.date <= format(end, 'yyyy-MM-dd')
    );

    // Group by date
    const dayCounts: Record<string, number> = {};
    monthlyLogs.forEach(log => {
        dayCounts[log.date] = (dayCounts[log.date] || 0) + 1;
    });

    let bestDate: string | null = null;
    let bestCount = 0;

    Object.entries(dayCounts).forEach(([date, count]) => {
        if (count > bestCount) {
            bestCount = count;
            bestDate = date;
        }
    });

    return { date: bestDate, count: bestCount };
}

/**
 * Calculates overall Consistency Score (percentage of possible completions achieved).
 */
export function getConsistencyScore(habits: Habit[], logs: HabitLog[], currentMonth: Date): number {
    const start = startOfMonth(currentMonth);
    const end = endOfMonth(currentMonth);
    const today = new Date();
    const effectiveEnd = today < end ? today : end;

    // Calculate days passed in month (up to today)
    const daysPassed = Math.max(1, Math.floor((effectiveEnd.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    let totalPossible = 0;
    let totalCompleted = 0;

    habits.forEach(habit => {
        if (habit.type === 'daily') {
            // Daily habits: possible = days passed
            totalPossible += daysPassed;
        } else {
            // Weekly habits: possible = weeks passed (roughly)
            totalPossible += Math.ceil(daysPassed / 7);
        }

        // Count completions
        const completions = logs.filter(l =>
            l.habit_id === habit.id &&
            l.date >= format(start, 'yyyy-MM-dd') &&
            l.date <= format(effectiveEnd, 'yyyy-MM-dd')
        ).length;

        totalCompleted += completions;
    });

    if (totalPossible === 0) return 0;
    return Math.round((totalCompleted / totalPossible) * 100);
}

/**
 * Progress Badges - Milestone achievements
 */
export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    earned: boolean;
    progress?: number; // 0-100
}

export function getProgressBadges(habits: Habit[], logs: HabitLog[]): Badge[] {
    const badges: Badge[] = [];

    // Calculate total streak days across all habits
    let maxStreak = 0;
    habits.forEach(habit => {
        const streak = calculateStreak(habit, logs);
        if (streak > maxStreak) maxStreak = streak;
    });

    // Total completions ever
    // All logs are completions (completion-only storage)
    const totalCompletions = logs.length;

    // 7-Day Streak Badge
    badges.push({
        id: 'streak_7',
        name: 'Week Warrior',
        description: 'Maintain a 7-day streak on any habit',
        icon: '🔥',
        earned: maxStreak >= 7,
        progress: Math.min(100, Math.round((maxStreak / 7) * 100))
    });

    // 30-Day Streak Badge
    badges.push({
        id: 'streak_30',
        name: 'Monthly Master',
        description: 'Maintain a 30-day streak on any habit',
        icon: '💪',
        earned: maxStreak >= 30,
        progress: Math.min(100, Math.round((maxStreak / 30) * 100))
    });

    // 100-Day Streak Badge
    badges.push({
        id: 'streak_100',
        name: 'Century Champion',
        description: 'Maintain a 100-day streak on any habit',
        icon: '🏆',
        earned: maxStreak >= 100,
        progress: Math.min(100, Math.round((maxStreak / 100) * 100))
    });

    // First Habit Badge
    badges.push({
        id: 'first_habit',
        name: 'Getting Started',
        description: 'Create your first habit',
        icon: '🌱',
        earned: habits.length >= 1,
        progress: habits.length >= 1 ? 100 : 0
    });

    // 50 Completions Badge
    badges.push({
        id: 'completions_50',
        name: 'Dedicated',
        description: 'Complete 50 habit check-ins',
        icon: '✨',
        earned: totalCompletions >= 50,
        progress: Math.min(100, Math.round((totalCompletions / 50) * 100))
    });

    // 5 Habits Badge
    badges.push({
        id: 'habits_5',
        name: 'Habit Builder',
        description: 'Track 5 different habits',
        icon: '📋',
        earned: habits.length >= 5,
        progress: Math.min(100, Math.round((habits.length / 5) * 100))
    });

    return badges;
}

/**
 * Get the longest streak for display
 */
export function getLongestStreak(habits: Habit[], logs: HabitLog[]): { streak: number; habitName: string } {
    let maxStreak = 0;
    let habitName = '';

    habits.forEach(habit => {
        const streak = calculateStreak(habit, logs);
        if (streak > maxStreak) {
            maxStreak = streak;
            habitName = habit.name;
        }
    });

    return { streak: maxStreak, habitName };
}

/**
 * Get color scheme for streak based on day count
 * Returns Tailwind classes for text, background, and border
 */
export function getStreakColor(days: number): { text: string; bg: string; border: string; iconColor: string } {
    if (days === 0) {
        return {
            text: 'text-gray-500',
            bg: 'bg-gray-500/10',
            border: 'border-gray-500/20',
            iconColor: 'text-gray-500'
        };
    } else if (days <= 2) {
        return {
            text: 'text-gray-400',
            bg: 'bg-gray-400/20',
            border: 'border-gray-400/30',
            iconColor: 'text-gray-400'
        };
    } else if (days <= 6) {
        return {
            text: 'text-orange-400',
            bg: 'bg-orange-500/20',
            border: 'border-orange-500/30',
            iconColor: 'text-orange-400'
        };
    } else if (days <= 13) {
        return {
            text: 'text-red-400',
            bg: 'bg-red-500/20',
            border: 'border-red-500/30',
            iconColor: 'text-red-400'
        };
    } else {
        // 14+ days - Legendary!
        return {
            text: 'text-yellow-400',
            bg: 'bg-yellow-500/20',
            border: 'border-yellow-500/30',
            iconColor: 'text-yellow-400'
        };
    }
}

/**
 * Check if a streak day count is a milestone
 */
export function isStreakMilestone(days: number): boolean {
    const milestones = [3, 7, 14, 30, 50, 100];
    return milestones.includes(days);
}

/**
 * Get active streaks (habits with streaks > 0)
 * Returns sorted by streak count descending
 */
export function getActiveStreaks(habits: Habit[], logs: HabitLog[]): Array<{ habit: Habit; streak: number }> {
    const streaks = habits
        .map(habit => ({
            habit,
            streak: calculateStreak(habit, logs)
        }))
        .filter(item => item.streak > 0)
        .sort((a, b) => b.streak - a.streak);

    return streaks;
}
