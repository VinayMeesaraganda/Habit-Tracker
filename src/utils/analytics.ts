import { Habit, HabitLog } from '../types';
import { isSameDay, subDays, startOfDay, parseISO, startOfWeek, endOfWeek, subWeeks, getDaysInMonth, startOfMonth, endOfMonth, format } from 'date-fns';

/**
 * Calculates the current streak for a habit.
 * Streak = consecutive days/weeks ending today or yesterday.
 */
export function calculateStreak(habit: Habit, logs: HabitLog[]): number {
    if (habit.type === 'daily') {
        let streak = 0;
        const today = startOfDay(new Date());
        let checkDate = today;

        // Check if completed today, if not, check yesterday to start streak
        const completedToday = logs.some(l => l.habit_id === habit.id && l.completed && isSameDay(parseISO(l.date), today));

        if (!completedToday) {
            checkDate = subDays(today, 1);
            const completedYesterday = logs.some(l => l.habit_id === habit.id && l.completed && isSameDay(parseISO(l.date), checkDate));
            if (!completedYesterday) return 0; // No streak
        }

        // Count backwards
        while (true) {
            const isCompleted = logs.some(l => l.habit_id === habit.id && l.completed && isSameDay(parseISO(l.date), checkDate));
            if (isCompleted) {
                streak++;
                checkDate = subDays(checkDate, 1);
            } else {
                break;
            }
        }
        return streak;
    } else {
        // Weekly Streak Logic
        // For simplicity: Consecutive weeks where goal was met? 
        // Or simpler: Consecutive weeks with AT LEAST ONE entry? 
        // Let's go with: Consecutive weeks with at least 1 log.
        let streak = 0;
        const currentWeekStart = startOfWeek(new Date());
        let checkWeekStart = currentWeekStart;

        // Similar lookback logic... (Simplified for now to " Weeks Active")
        // Just counting consecutive weeks with activity
        while (true) {
            const weekEnd = endOfWeek(checkWeekStart);
            const hasLog = logs.some(l => {
                const d = parseISO(l.date);
                return l.habit_id === habit.id && l.completed && d >= checkWeekStart && d <= weekEnd;
            });

            if (hasLog) {
                streak++;
                checkWeekStart = subWeeks(checkWeekStart, 1);
            } else {
                // Allow missing *this* week if it just started? No, simpler is better.
                // If no log this week, streak is 0? Or 0 for this week but saved previous?
                // Let's be lenient: if no log THIS week, check LAST week.
                if (isSameDay(checkWeekStart, currentWeekStart)) {
                    checkWeekStart = subWeeks(checkWeekStart, 1);
                    continue;
                }
                break;
            }
        }
        return streak;
    }
}

/**
 * Calculates if the user is On Track, Behind, or Ahead for a monthly goal.
 */
export function getGoalPacing(habit: Habit, count: number, currentDayOfMonth: number): { status: 'ahead' | 'on_track' | 'behind'; color: string; message: string } {
    if (!habit.month_goal || habit.month_goal <= 0) return { status: 'on_track', color: 'text-gray-400', message: '' };

    const totalDays = getDaysInMonth(new Date());
    const daysPassed = currentDayOfMonth;

    // Expected completion rate per day
    const expectedRate = habit.month_goal / totalDays;
    const expectedCount = Math.floor(expectedRate * daysPassed);

    if (count >= habit.month_goal) return { status: 'ahead', color: 'text-emerald-500', message: 'Goal Met! 🎉' };

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
        l.completed &&
        l.date >= format(start, 'yyyy-MM-dd') &&
        l.date <= format(end, 'yyyy-MM-dd')
    );

    const count = monthlyLogs.length;
    const goal = habit.month_goal || 1;
    const percentage = Math.min(count / goal, 1);

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
        l.completed &&
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
            l.completed &&
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
    const totalCompletions = logs.filter(l => l.completed).length;

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
