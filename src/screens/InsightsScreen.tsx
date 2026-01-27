import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isSameMonth, isAfter, isBefore, eachDayOfInterval } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { ChevronLeft, ChevronRight, Flame, Award } from 'lucide-react';
import { colors, categoryColorMap } from '../theme/colors';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import { calculateStreak, getLongestStreak } from '../utils/analytics';
import { isHabitScheduledForDate, getFrequencyLabel, getHabitFrequency } from '../utils/frequencyUtils';
import { CompletionRing } from '../components/charts/CompletionRing';
import { WeeklyHeatmap } from '../components/charts/WeeklyHeatmap';
import { HabitDetailView } from '../components/HabitDetailView';
import { AnimatePresence } from 'framer-motion';
import { Habit } from '../types';

export const InsightsScreen: React.FC = () => {
    const { habits, logs } = useHabits();
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);

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
    // daysInMonth not needed - ring uses totalDays from calculation
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
    // Percentage = Average daily completion rate across all days
    // completedDays = "Perfect Days" — days where 100% of scheduled habits were completed
    // totalDays = Number of calendar days elapsed in month
    const ringData = useMemo(() => {
        if (isFutureMonth || habitsForMonth.length === 0) {
            return { percentage: 0, perfectDays: 0, totalDays: 0 };
        }

        const today = new Date();
        today.setHours(23, 59, 59, 999); // End of today
        const effectiveEnd = isCurrentMonth ? today : monthEnd;

        // Build array of days to check
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

                // Check if habit existed on this day
                if (habitCreatedDate > day) return;

                // Check if habit was archived before this day
                if (habit.archived_at) {
                    const archiveDate = new Date(habit.archived_at);
                    if (archiveDate < day) return;
                }

                // Check if habit is scheduled for this day
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

            // Calculate this day's completion rate
            if (dayPossible > 0) {
                const dayRate = dayCompleted / dayPossible;
                dailyScoreSum += dayRate;

                // Perfect Day = 100% completion (dayCompleted === dayPossible)
                // For quantifiable habits, we already normalized to max 1 per habit
                if (dayCompleted >= dayPossible) {
                    perfectDaysCount++;
                }
            }
        });

        // Average completion percentage across all days
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

    // Trend icons available if needed for future use

    return (
        <div className="min-h-screen pb-24 bg-[#FFF8E7]">
            {/* Header */}
            <div className="px-4 pt-8 pb-4 safe-area-top">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Insights</h1>
                        <p className="text-gray-500 font-medium">Your progress at a glance</p>
                    </div>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-center bg-white rounded-xl p-2 shadow-sm border border-gray-100">
                    <button
                        onClick={handlePreviousMonth}
                        disabled={!canGoBack}
                        className={`p-2 rounded-lg transition-all active:scale-95 ${canGoBack ? 'hover:bg-gray-50 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <div className="px-4 py-1 min-w-[140px] text-center">
                        <span className="text-lg font-bold text-gray-800">
                            {format(selectedMonth, 'MMMM yyyy')}
                        </span>
                    </div>
                    <button
                        onClick={handleNextMonth}
                        disabled={!canGoForward}
                        className={`p-2 rounded-lg transition-all active:scale-95 ${canGoForward ? 'hover:bg-gray-50 text-gray-600' : 'text-gray-300 cursor-not-allowed'}`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Hero: Completion Ring */}
            <div className="flex justify-center py-6">
                <CompletionRing
                    percentage={ringData.percentage}
                    completedDays={ringData.perfectDays}
                    totalDays={ringData.totalDays}
                    size={180}
                />
            </div>

            {/* Summary Cards */}
            <div className="px-4 mb-6">
                <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    {/* Total Check-ins */}
                    <div className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Check-ins</div>
                        <div className="text-3xl font-black text-gray-800">{summaryStats.totalCheckIns}</div>
                        <div className="text-xs text-gray-400 mt-1">this month</div>
                    </div>

                    {/* Best Streak */}
                    <div className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Best Streak</div>
                        <div className="flex items-center gap-1">
                            <Flame className="w-5 h-5 text-orange-500" />
                            <span className="text-3xl font-black text-gray-800">{summaryStats.longestStreak.streak}</span>
                        </div>
                        <div className="text-xs text-gray-400 mt-1 truncate">{summaryStats.longestStreak.habitName || 'days'}</div>
                    </div>

                    {/* Best Day */}
                    <div className="flex-shrink-0 bg-white rounded-2xl p-4 shadow-sm border border-gray-100 min-w-[120px]">
                        <div className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Best Day</div>
                        <div className="text-3xl font-black text-gray-800">{summaryStats.bestDay.count || '-'}</div>
                        <div className="text-xs text-gray-400 mt-1">
                            {summaryStats.bestDay.date ? format(new Date(summaryStats.bestDay.date), 'MMM d') : 'habits'}
                        </div>
                    </div>
                </div>
            </div>

            {/* Weekly Activity Heatmap */}
            <div className="px-4 mb-6">
                <WeeklyHeatmap
                    logs={logs}
                    habits={activeHabits}
                    weeks={4}
                />
            </div>



            {/* Habit Leaderboard */}
            <div className="px-4 mb-6">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-500" />
                            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider">Habit Leaderboard</h3>
                        </div>
                    </div>

                    {habitPerformance.length === 0 ? (
                        <div className="p-8 text-center">
                            <p className="text-gray-400">No habits to display</p>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-50">
                            {habitPerformance.slice(0, 5).map(({ habit, rate, streak, completed, possible }, index) => {
                                const colorKey = categoryColorMap[habit.category] || 'coral';
                                const habitColor = colors.habitColors[colorKey].start;

                                return (
                                    <div
                                        key={habit.id}
                                        onClick={() => setSelectedHabit(habit)}
                                        className="group flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors cursor-pointer active:bg-gray-100"
                                    >
                                        {/* Rank */}
                                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold 
                                            ${index === 0 ? 'bg-yellow-100 text-yellow-600' :
                                                index === 1 ? 'bg-gray-200 text-gray-600' :
                                                    index === 2 ? 'bg-orange-100 text-orange-600' :
                                                        'bg-gray-100 text-gray-500'}`}
                                        >
                                            {index + 1}
                                        </div>

                                        {/* Emoji */}
                                        <div
                                            className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                                            style={{ backgroundColor: `${habitColor}15` }}
                                        >
                                            {getCategoryEmoji(habit.category)}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-gray-800 truncate">{habit.name}</h4>
                                            <div className="flex items-center gap-2 mt-0.5">
                                                <div className="flex items-center gap-1 text-orange-500 text-xs font-semibold">
                                                    <Flame className="w-3 h-3" />
                                                    {streak}
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {completed}/{possible}
                                                </span>
                                                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 text-gray-500 font-medium">
                                                    {getFrequencyLabel(getHabitFrequency(habit))}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Rate */}
                                        <div className="text-right">
                                            <div className="text-xl font-black text-gray-800">{rate}%</div>
                                            <div className="flex items-center justify-end gap-0.5 text-[10px] text-gray-300 font-medium mt-0.5 group-hover:text-gray-500 transition-colors">
                                                View <ChevronRight className="w-3 h-3" />
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
            {/* Habit Detail View Overlay */}
            <AnimatePresence>
                {selectedHabit && (
                    <HabitDetailView
                        habit={selectedHabit}
                        logs={logs}
                        onClose={() => setSelectedHabit(null)}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};
