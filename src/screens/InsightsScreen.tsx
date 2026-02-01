import React, { useMemo, useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isSameMonth, isAfter, isBefore, eachDayOfInterval } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { useAnalytics } from '../hooks/useAnalytics';
import { ChevronLeft, ChevronRight, Flame, Award, TrendingUp, Calendar, Target, Zap, Trophy, Loader2 } from 'lucide-react';

import { calculateStreak, getLongestStreak, getProgressBadges } from '../utils/analytics';
import { isHabitScheduledForDate, getFrequencyLabel, getHabitFrequency } from '../utils/frequencyUtils';
import { CompletionRing } from '../components/charts/CompletionRing';
import { motion } from 'framer-motion';

import { colors, categoryColorMap } from '../theme/colors';

export const InsightsScreen: React.FC = () => {
    const { habits, logs } = useHabits();
    const { getMonthlyStats, loading: analyticsLoading } = useAnalytics();
    const [monthlyStats, setMonthlyStats] = useState<{ habit_id: string; completion_count: number }[]>([]);
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    // Fetch analytics when month changes
    useEffect(() => {
        const fetchStats = async () => {
            const data = await getMonthlyStats(selectedMonth);
            setMonthlyStats(data || []);
        };
        fetchStats();
    }, [selectedMonth, getMonthlyStats]);

    // Month navigation
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const isCurrentMonth = isSameMonth(selectedMonth, new Date());
    const isFutureMonth = isAfter(monthStart, new Date());

    // Get habits that were active during selected month
    const habitsForMonth = useMemo(() => {
        return habits.filter(h => {
            const createdDate = startOfMonth(new Date(h.created_at));
            if (isAfter(createdDate, monthEnd)) return false;
            if (h.archived_at) {
                const archivedDate = new Date(h.archived_at);
                if (isBefore(archivedDate, monthStart)) return false;
            }
            return true;
        }).sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }, [habits, monthStart, monthEnd]);

    // Calculate Habit Counts by Category (for the graph)
    const categoryDist = useMemo(() => {
        const counts: Record<string, number> = {};
        // Use habitsForMonth to correspond with selected month
        habitsForMonth.forEach(h => {
            counts[h.category] = (counts[h.category] || 0) + 1;
        });

        return Object.entries(counts)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count); // Sort by count descending
    }, [habitsForMonth]);

    // Active habits (non-archived)
    const activeHabits = useMemo(() =>
        habits.filter(h => !h.archived_at).sort((a, b) => (a.priority || 0) - (b.priority || 0)),
        [habits]
    );

    // Determine navigation bounds
    const dataBounds = useMemo(() => {
        const today = new Date();
        const allActive = habits.filter(h => !h.archived_at);
        let earliest = subMonths(today, 12);
        if (allActive.length > 0) {
            const earliestHabit = new Date(Math.min(...allActive.map(h => new Date(h.created_at).getTime())));
            earliest = startOfMonth(earliestHabit) < earliest ? startOfMonth(earliestHabit) : earliest;
        }
        const latest = addMonths(today, 3);
        return { earliest: startOfMonth(earliest), latest: startOfMonth(latest) };
    }, [habits]);

    const handlePreviousMonth = () => {
        const prevMonth = subMonths(selectedMonth, 1);
        if (!isBefore(startOfMonth(prevMonth), dataBounds.earliest)) {
            setSelectedMonth(prevMonth);
        }
    };

    const handleNextMonth = () => {
        const nextMonth = addMonths(selectedMonth, 1);
        if (!isAfter(startOfMonth(nextMonth), dataBounds.latest)) {
            setSelectedMonth(nextMonth);
        }
    };

    const canGoBack = !isBefore(startOfMonth(subMonths(selectedMonth, 1)), dataBounds.earliest);
    const canGoForward = !isAfter(startOfMonth(addMonths(selectedMonth, 1)), dataBounds.latest);

    // Calculate overall completion for the ring
    const ringData = useMemo(() => {
        if (isFutureMonth || habitsForMonth.length === 0) {
            return { percentage: 0, perfectDays: 0, totalDays: 0 };
        }

        const today = new Date();
        today.setHours(23, 59, 59, 999);
        const effectiveEnd = isCurrentMonth ? today : monthEnd;

        const daysToCheck = eachDayOfInterval({ start: monthStart, end: effectiveEnd });
        const totalCalendarDays = daysToCheck.length;

        let dailyScoreSum = 0;
        let perfectDaysCount = 0;
        let totalPossible = 0;

        daysToCheck.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            let dayCompleted = 0;
            let dayPossible = 0;

            habitsForMonth.forEach(habit => {
                const habitCreatedDate = new Date(habit.created_at);
                habitCreatedDate.setHours(0, 0, 0, 0);
                if (habitCreatedDate > day) return;
                if (habit.archived_at && new Date(habit.archived_at) < day) return;
                if (!isHabitScheduledForDate(habit, day)) return;

                dayPossible++;
                const log = logs.find(l => l.habit_id === habit.id && l.date === dateStr);
                if (log) {
                    if (habit.is_quantifiable) {
                        dayCompleted += Math.min((log.value || 0) / (habit.target_value || 1), 1);
                    } else {
                        dayCompleted++;
                    }
                }
            });

            if (dayPossible > 0) {
                const dayRate = dayCompleted / dayPossible;
                dailyScoreSum += dayRate;
                if (dayCompleted >= dayPossible) perfectDaysCount++;
            }
            totalPossible += dayPossible;
        });

        // Use RPC-based percentage if possible, but we need consistency with perfect days.
        // Actually, let's keep dailyScoreSum for percentage as it correctly weighs "days" rather than just raw counts.
        // The RPC 'totalCompletions' is useful for the summary stat, not necessarily the daily average rate.

        const percentage = totalCalendarDays > 0 ? (dailyScoreSum / totalCalendarDays) * 100 : 0;

        return {
            percentage,
            perfectDays: perfectDaysCount,
            totalDays: totalCalendarDays
        };
    }, [habitsForMonth, logs, monthlyStats, monthStart, monthEnd, isCurrentMonth, isFutureMonth]);

    // Summary stats
    const summaryStats = useMemo(() => {
        // Use RPC data for total check-ins (O(1) vs O(N))
        const totalCheckIns = monthlyStats.reduce((acc, curr) => acc + curr.completion_count, 0);

        const longestStreak = getLongestStreak(activeHabits, logs);

        // Find best day (Requires daily data, still using logs)
        const monthLogs = logs.filter(l => l.date >= format(monthStart, 'yyyy-MM-dd') && l.date <= format(monthEnd, 'yyyy-MM-dd'));
        const dayCounts: Record<string, number> = {};
        monthLogs.forEach(log => {
            dayCounts[log.date] = (dayCounts[log.date] || 0) + 1;
        });
        let bestDay = { date: '', count: 0 };
        Object.entries(dayCounts).forEach(([date, count]) => {
            if (count > bestDay.count) {
                bestDay = { date, count };
            }
        });

        return { totalCheckIns, longestStreak, bestDay };
    }, [logs, monthlyStats, monthStart, monthEnd, activeHabits]);

    // Achievement badges
    const badges = useMemo(() => getProgressBadges(habits, logs), [habits, logs]);
    const earnedBadges = badges.filter(b => b.earned);
    const progressBadges = badges.filter(b => !b.earned && b.progress !== undefined && b.progress > 0);

    // Habit performance for leaderboard
    const habitPerformance = useMemo(() => {
        return habitsForMonth.map(habit => {
            // Use RPC stat if available
            const stat = monthlyStats.find(s => s.habit_id === habit.id);
            const completed = stat ? stat.completion_count : 0;

            const habitCreatedDate = new Date(habit.created_at);
            habitCreatedDate.setHours(0, 0, 0, 0);

            let possible = 0;

            const effectiveStart = habitCreatedDate > monthStart ? habitCreatedDate : monthStart;
            let effectiveEnd = monthEnd;
            if (habit.archived_at) {
                const archiveDate = new Date(habit.archived_at);
                if (archiveDate < monthEnd) effectiveEnd = archiveDate;
            }

            if (effectiveStart <= effectiveEnd) {
                const days = eachDayOfInterval({ start: effectiveStart, end: effectiveEnd });
                days.forEach(day => {
                    if (isHabitScheduledForDate(habit, day)) {
                        possible++;
                    }
                });
            }

            const rate = possible > 0 ? Math.round((completed / possible) * 100) : 0;
            const streak = calculateStreak(habit, logs);

            return { habit, rate, streak, completed: Math.round(completed), possible };
        }).sort((a, b) => b.rate - a.rate || b.streak - a.streak);
    }, [habitsForMonth, monthlyStats, logs, monthStart, monthEnd]);

    return (
        <div className="min-h-screen bg-[#FFF8E7]">
            {/* Main Layout */}
            <div className="max-w-6xl mx-auto w-full px-4 pt-4 lg:pt-8 lg:px-8">
                {/* Header & Month Nav - Compact Row */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h1 className="text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">
                            Insights
                            {analyticsLoading && <Loader2 className="inline ml-3 w-5 h-5 animate-spin text-orange-500" />}
                        </h1>
                        <p className="text-xs lg:text-base text-gray-500 font-medium">Your progress</p>
                    </div>

                    {/* Month Navigation - Compact */}
                    <div className="flex items-center bg-white rounded-xl p-1 shadow-sm border border-gray-100">
                        <button
                            onClick={handlePreviousMonth}
                            disabled={!canGoBack}
                            className={`p-2 rounded-lg transition-all active:scale-95 ${canGoBack
                                ? 'hover:bg-gray-50 text-gray-600'
                                : 'text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                        <div className="px-3 py-1 min-w-[100px] lg:min-w-[140px] text-center">
                            <span className="text-sm lg:text-lg font-bold text-gray-800">
                                {format(selectedMonth, 'MMMM yyyy')}
                            </span>
                        </div>
                        <button
                            onClick={handleNextMonth}
                            disabled={!canGoForward}
                            className={`p-2 rounded-lg transition-all active:scale-95 ${canGoForward
                                ? 'hover:bg-gray-50 text-gray-600'
                                : 'text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <ChevronRight className="w-4 h-4 lg:w-5 lg:h-5" />
                        </button>
                    </div>
                </div>

                {/* Top Grid: Ring & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6 mb-8">
                    {/* Left: Monthly Completion Card - Redesigned */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 relative overflow-hidden"
                    >
                        {/* ... (existing completion card content) ... */}
                        <div className="flex items-center justify-between relative z-10">
                            <div className="flex flex-col">
                                <h3 className="text-gray-400 font-bold uppercase tracking-wider text-[10px] lg:text-xs mb-1">Monthly Goal</h3>
                                <div className="flex items-baseline gap-1">
                                    <span className="text-4xl lg:text-5xl font-black text-gray-900 tracking-tight">
                                        {Math.round(ringData.percentage)}%
                                    </span>
                                    <span className="text-sm text-gray-500 font-medium">completed</span>
                                </div>
                                <div className="mt-2 inline-flex items-center gap-1.5 bg-green-50 px-3 py-1.5 rounded-full self-start">
                                    <TrendingUp className="w-3 h-3 text-green-600" />
                                    <span className="text-xs font-bold text-green-700">
                                        {ringData.perfectDays} perfect days
                                    </span>
                                </div>
                            </div>

                            {/* Ring Container */}
                            <div className="transform scale-90 lg:scale-100 origin-right">
                                <CompletionRing
                                    percentage={ringData.percentage}
                                    completedDays={ringData.perfectDays}
                                    totalDays={ringData.totalDays}
                                    size={110}
                                />
                            </div>
                        </div>
                    </motion.div>

                    {/* Right: Summary Stats Grid */}
                    <div className="grid grid-cols-2 gap-3 lg:gap-4 h-full">
                        {/* Total Check-ins */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    <div className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">Check-ins</div>
                                </div>
                                <div className="text-2xl lg:text-4xl font-black text-gray-800">{summaryStats.totalCheckIns}</div>
                            </div>
                            <div className="text-[10px] lg:text-xs text-gray-400 mt-2">this month</div>
                        </motion.div>

                        {/* Best Streak */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <div className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">Best Streak</div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-2xl lg:text-4xl font-black text-gray-800">{summaryStats.longestStreak.streak}</span>
                                    <span className="text-sm lg:text-lg text-gray-400 font-bold">days</span>
                                </div>
                            </div>
                            <div className="text-[10px] lg:text-xs text-gray-400 mt-2 truncate">
                                {summaryStats.longestStreak.habitName || 'Keep going!'}
                            </div>
                        </motion.div>

                        {/* Best Day */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <div className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">Best Day</div>
                                </div>
                                <div className="text-2xl lg:text-4xl font-black text-gray-800">{summaryStats.bestDay.count || '-'}</div>
                            </div>
                            <div className="text-[10px] lg:text-xs text-gray-400 mt-2">
                                {summaryStats.bestDay.date ? format(new Date(summaryStats.bestDay.date), 'MMM d') : 'habits'}
                            </div>
                        </motion.div>

                        {/* Completion Rate */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white rounded-2xl lg:rounded-3xl p-4 lg:p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <div className="text-[10px] lg:text-xs font-bold text-gray-400 uppercase tracking-wider">Rate</div>
                                </div>
                                <div className="text-2xl lg:text-4xl font-black text-gray-800">{Math.round(ringData.percentage)}%</div>
                            </div>
                            <div className="text-[10px] lg:text-xs text-gray-400 mt-2">completion</div>
                        </motion.div>
                    </div>
                </div>

                {/* Habits by Category Chart - Custom Implementation for better layout */}
                {categoryDist.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-8"
                    >
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Habits by Category</h3>
                        <div className="space-y-5">
                            {categoryDist.map((dist, index) => {
                                // Get color logic
                                const colorKey = categoryColorMap[dist.name] || 'coral';
                                const colorStart = colors.habitColors[colorKey as keyof typeof colors.habitColors]?.start || '#FF7A6B';
                                const colorEnd = colors.habitColors[colorKey as keyof typeof colors.habitColors]?.end || '#FFA094';

                                // Calculate max for width percentage
                                const maxCount = Math.max(...categoryDist.map(d => d.count));
                                const widthPercent = Math.max((dist.count / maxCount) * 100, 5); // Min 5% width

                                return (
                                    <div key={dist.name}>
                                        <div className="flex justify-between items-end mb-1.5">
                                            <span className="text-sm font-bold text-gray-700">{dist.name}</span>
                                            <span className="text-xs font-bold text-gray-400">{dist.count} {dist.count === 1 ? 'habit' : 'habits'}</span>
                                        </div>
                                        <div className="h-4 w-full bg-gray-50 rounded-full overflow-hidden">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${widthPercent}%` }}
                                                transition={{ duration: 1, delay: 0.4 + (index * 0.1) }}
                                                className="h-full rounded-full"
                                                style={{ background: `linear-gradient(90deg, ${colorStart}, ${colorEnd})` }}
                                            />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </motion.div>
                )}

                {/* Bottom Grid: Leaderboard & Badges */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                    {/* Leaderboard - Takes 2 cols on Desktop */}
                    <div className="lg:col-span-2 space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.35 }}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                                        <Award className="w-5 h-5 text-yellow-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-gray-800">Habit Leaderboard</h3>
                                </div>
                            </div>

                            {habitPerformance.length === 0 ? (
                                <div className="p-12 text-center">
                                    <p className="text-gray-400 font-medium">No habits measured yet</p>
                                </div>
                            ) : (
                                <div className="divide-y divide-gray-50">
                                    {habitPerformance.slice(0, 10).map(({ habit, rate, streak, completed, possible }, index) => {

                                        return (
                                            <motion.div
                                                key={habit.id}
                                                whileHover={{ backgroundColor: 'rgba(249, 250, 251, 0.5)' }}
                                                className="group flex items-center gap-4 p-4 lg:p-5 transition-colors cursor-pointer"
                                            >
                                                {/* Rank */}
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold 
                                                    ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                                        index === 1 ? 'bg-gray-200 text-gray-600' :
                                                            index === 2 ? 'bg-orange-100 text-orange-600' :
                                                                'bg-gray-100 text-gray-500'}`}
                                                >
                                                    {index + 1}
                                                </div>

                                                {/* Info */}

                                                {/* Info */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-bold text-gray-800 text-base truncate">{habit.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <div className="flex items-center gap-1 text-orange-500 text-xs font-bold bg-orange-50 px-2 py-0.5 rounded-full">
                                                            <Flame className="w-3 h-3" />
                                                            {streak}
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            {completed}/{possible}
                                                        </span>
                                                        <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                                            {getFrequencyLabel(getHabitFrequency(habit))}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Rate */}
                                                <div className="text-right">
                                                    <div className="text-2xl font-black text-gray-800">{rate}%</div>
                                                    <div className="text-[11px] text-gray-400 font-semibold uppercase tracking-wide">Success Rate</div>
                                                </div>
                                            </motion.div>
                                        );
                                    })}
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Col: Badges & Progress */}
                    <div className="space-y-6">
                        {/* Earned Badges */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                        >
                            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <Trophy className="w-5 h-5 text-yellow-500" />
                                    <h3 className="text-base font-bold text-gray-800">Trophies</h3>
                                </div>
                                <span className="text-xs font-bold text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                    {earnedBadges.length} earned
                                </span>
                            </div>

                            {earnedBadges.length > 0 ? (
                                <div className="p-5 grid grid-cols-3 gap-4">
                                    {earnedBadges.slice(0, 9).map((badge) => (
                                        <motion.div
                                            key={badge.id}
                                            whileHover={{ scale: 1.05 }}
                                            className="flex flex-col items-center gap-2 text-center"
                                        >
                                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-yellow-50 to-orange-50 flex items-center justify-center text-3xl shadow-sm border border-orange-100/50">
                                                {badge.icon}
                                            </div>
                                            <div className="text-[10px] font-bold text-gray-600 leading-tight">{badge.name}</div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-sm">
                                    Keep tracking to earn trophies!
                                </div>
                            )}
                        </motion.div>

                        {/* In Progress */}
                        {progressBadges.length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.1 }}
                                className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden"
                            >
                                <div className="p-5 border-b border-gray-100">
                                    <div className="flex items-center gap-2">
                                        <Target className="w-5 h-5 text-blue-500" />
                                        <h3 className="text-base font-bold text-gray-800">Next Goals</h3>
                                    </div>
                                </div>
                                <div className="p-5 space-y-5">
                                    {progressBadges.slice(0, 3).map((badge) => (
                                        <div key={badge.id} className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center text-xl grayscale opacity-50">
                                                {badge.icon}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center justify-between mb-1.5">
                                                    <span className="text-sm font-bold text-gray-700 truncate pr-2">{badge.name}</span>
                                                    <span className="text-xs font-bold text-gray-500">{badge.progress}%</span>
                                                </div>
                                                <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${badge.progress}%` }}
                                                        transition={{ duration: 1, delay: 0.5 }}
                                                        className="h-full bg-gradient-to-r from-blue-400 to-indigo-500 rounded-full"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Bottom padding */}
                <div className="h-12 lg:hidden" />
            </div>
        </div>
    );
};
