import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isSameMonth, isAfter, isBefore, eachDayOfInterval } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { ChevronLeft, ChevronRight, Flame, Award, TrendingUp, Calendar, Target, Zap, Trophy } from 'lucide-react';

import { calculateStreak, getLongestStreak, getProgressBadges } from '../utils/analytics';
import { isHabitScheduledForDate, getFrequencyLabel, getHabitFrequency } from '../utils/frequencyUtils';
import { CompletionRing } from '../components/charts/CompletionRing';
import { motion } from 'framer-motion';

export const InsightsScreen: React.FC = () => {
    const { habits, logs } = useHabits();
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    // Determine navigation bounds
    const dataBounds = useMemo(() => {
        const today = new Date();
        const activeHabits = habits.filter(h => !h.archived_at);
        let earliest = subMonths(today, 12);
        if (activeHabits.length > 0) {
            const earliestHabit = new Date(Math.min(...activeHabits.map(h => new Date(h.created_at).getTime())));
            earliest = startOfMonth(earliestHabit) < earliest ? startOfMonth(earliestHabit) : earliest;
        }
        const latest = addMonths(today, 3);
        return { earliest: startOfMonth(earliest), latest: startOfMonth(latest) };
    }, [habits]);

    // Month navigation
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const isCurrentMonth = isSameMonth(selectedMonth, new Date());
    const isFutureMonth = isAfter(monthStart, new Date());

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

    // Active habits (non-archived)
    const activeHabits = useMemo(() =>
        habits.filter(h => !h.archived_at).sort((a, b) => (a.priority || 0) - (b.priority || 0)),
        [habits]
    );

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

        daysToCheck.forEach(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            let dayCompleted = 0;
            let dayPossible = 0;

            habitsForMonth.forEach(habit => {
                const habitCreatedDate = new Date(habit.created_at);
                habitCreatedDate.setHours(0, 0, 0, 0);

                if (habitCreatedDate > day) return;

                if (habit.archived_at) {
                    const archiveDate = new Date(habit.archived_at);
                    if (archiveDate < day) return;
                }

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

                if (dayCompleted >= dayPossible) {
                    perfectDaysCount++;
                }
            }
        });

        const percentage = totalCalendarDays > 0 ? (dailyScoreSum / totalCalendarDays) * 100 : 0;

        return {
            percentage,
            perfectDays: perfectDaysCount,
            totalDays: totalCalendarDays
        };
    }, [habitsForMonth, logs, monthStart, monthEnd, isCurrentMonth, isFutureMonth]);

    // Summary stats
    const summaryStats = useMemo(() => {
        const monthLogs = logs.filter(l => l.date >= format(monthStart, 'yyyy-MM-dd') && l.date <= format(monthEnd, 'yyyy-MM-dd'));
        const totalCheckIns = monthLogs.length;

        const longestStreak = getLongestStreak(activeHabits, logs);

        // Find best day
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
    }, [logs, monthStart, monthEnd, activeHabits]);

    // Achievement badges
    const badges = useMemo(() => getProgressBadges(habits, logs), [habits, logs]);
    const earnedBadges = badges.filter(b => b.earned);
    const progressBadges = badges.filter(b => !b.earned && b.progress !== undefined && b.progress > 0);

    // Habit performance for leaderboard
    const habitPerformance = useMemo(() => {
        return habitsForMonth.map(habit => {
            const habitCreatedDate = new Date(habit.created_at);
            habitCreatedDate.setHours(0, 0, 0, 0);

            let completed = 0;
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
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const log = logs.find(l => l.habit_id === habit.id && l.date === dateStr);
                        if (log) {
                            if (habit.is_quantifiable) {
                                completed += Math.min((log.value || 0) / (habit.target_value || 1), 1);
                            } else {
                                completed++;
                            }
                        }
                    }
                });
            }

            const rate = possible > 0 ? Math.round((completed / possible) * 100) : 0;
            const streak = calculateStreak(habit, logs);

            return { habit, rate, streak, completed: Math.round(completed), possible };
        }).sort((a, b) => b.streak - a.streak || b.rate - a.rate);
    }, [habitsForMonth, logs, monthStart, monthEnd]);

    return (
        <div className="min-h-screen bg-[#FFF8E7]">
            {/* Main Layout */}
            <div className="max-w-6xl mx-auto w-full px-4 pt-4 lg:pt-8 lg:px-8">
                {/* Header & Month Nav - Desktop Row */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Insights</h1>
                        <p className="text-gray-500 font-medium">Your progress at a glance</p>
                    </div>

                    {/* Month Navigation */}
                    <div className="flex items-center justify-center bg-white rounded-2xl p-2 shadow-sm border border-gray-100 self-start lg:self-auto">
                        <button
                            onClick={handlePreviousMonth}
                            disabled={!canGoBack}
                            className={`p-3 rounded-xl transition-all active:scale-95 ${canGoBack
                                ? 'hover:bg-gray-50 text-gray-600'
                                : 'text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <ChevronLeft className="w-5 h-5" />
                        </button>
                        <div className="px-6 py-2 min-w-[160px] text-center">
                            <span className="text-lg font-bold text-gray-800">
                                {format(selectedMonth, 'MMMM yyyy')}
                            </span>
                        </div>
                        <button
                            onClick={handleNextMonth}
                            disabled={!canGoForward}
                            className={`p-3 rounded-xl transition-all active:scale-95 ${canGoForward
                                ? 'hover:bg-gray-50 text-gray-600'
                                : 'text-gray-300 cursor-not-allowed'
                                }`}
                        >
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>

                {/* Top Grid: Ring & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Left: Completion Ring Card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100 flex flex-col items-center justify-center"
                    >
                        <h3 className="text-gray-500 font-bold uppercase tracking-wider mb-6 self-start text-sm">Monthly Completion</h3>
                        <CompletionRing
                            percentage={ringData.percentage}
                            completedDays={ringData.perfectDays}
                            totalDays={ringData.totalDays}
                            size={240}
                        />
                    </motion.div>

                    {/* Right: Summary Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 h-full">
                        {/* Total Check-ins */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Zap className="w-4 h-4 text-yellow-500" />
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Check-ins</div>
                                </div>
                                <div className="text-4xl font-black text-gray-800">{summaryStats.totalCheckIns}</div>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">this month</div>
                        </motion.div>

                        {/* Best Streak */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Flame className="w-4 h-4 text-orange-500" />
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Best Streak</div>
                                </div>
                                <div className="flex items-center gap-1">
                                    <span className="text-4xl font-black text-gray-800">{summaryStats.longestStreak.streak}</span>
                                    <span className="text-lg text-gray-400 font-bold">days</span>
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 mt-2 truncate">
                                {summaryStats.longestStreak.habitName || 'Keep going!'}
                            </div>
                        </motion.div>

                        {/* Best Day */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <Calendar className="w-4 h-4 text-blue-500" />
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Best Day</div>
                                </div>
                                <div className="text-4xl font-black text-gray-800">{summaryStats.bestDay.count || '-'}</div>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">
                                {summaryStats.bestDay.date ? format(new Date(summaryStats.bestDay.date), 'MMM d') : 'habits'}
                            </div>
                        </motion.div>

                        {/* Completion Rate */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.25 }}
                            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between"
                        >
                            <div>
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-green-500" />
                                    <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Rate</div>
                                </div>
                                <div className="text-4xl font-black text-gray-800">{Math.round(ringData.percentage)}%</div>
                            </div>
                            <div className="text-xs text-gray-400 mt-2">completion</div>
                        </motion.div>
                    </div>
                </div>

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
                                                            {streak} days
                                                        </div>
                                                        <span className="text-xs text-gray-400 font-medium">
                                                            {completed}/{possible} checks
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
