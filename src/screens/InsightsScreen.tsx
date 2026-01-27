import React, { useMemo, useState } from 'react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths, isSameMonth, isAfter, isBefore, getDaysInMonth, eachDayOfInterval } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { SectionDivider } from '../components/ui';
import { ProductivityPulse } from '../components/charts/ProductivityPulse';
import { SummaryStats } from '../components/charts/SummaryStats';
import { SmartInsights } from '../components/charts/SmartInsights';
import { ChevronLeft, ChevronRight, Flame, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { colors, categoryColorMap } from '../theme/colors';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import { calculateStreak } from '../utils/analytics';
import { isHabitScheduledForDate, getFrequencyLabel, getHabitFrequency } from '../utils/frequencyUtils';

interface InsightsScreenProps {
    currentMonth: Date;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = () => {
    const { habits, logs } = useHabits();
    const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());

    // Determine navigation bounds - allow 12 months back and 3 months forward
    const dataBounds = useMemo(() => {
        const today = new Date();
        // Allow going back up to 12 months or to earliest habit, whichever is earlier
        const activeHabits = habits.filter(h => !h.archived_at);
        let earliest = subMonths(today, 12);
        if (activeHabits.length > 0) {
            const earliestHabit = new Date(Math.min(...activeHabits.map(h => new Date(h.created_at).getTime())));
            earliest = startOfMonth(earliestHabit) < earliest ? startOfMonth(earliestHabit) : earliest;
        }
        // Allow going forward up to 3 months for planning
        const latest = addMonths(today, 3);
        return { earliest: startOfMonth(earliest), latest: startOfMonth(latest) };
    }, [habits]);

    // Calculate days in selected month (moved up for dependency order)
    const daysInMonth = getDaysInMonth(selectedMonth);
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    const isCurrentMonth = isSameMonth(selectedMonth, new Date());
    const isFutureMonth = isAfter(monthStart, new Date());

    // Get habits that were active during the selected month
    // This properly handles:
    // - Habits created after month end → excluded
    // - Habits archived before month start → excluded
    // - Habits archived during or after the month → included
    const habitsForMonth = useMemo(() => {
        return habits.filter(h => {
            const createdDate = startOfMonth(new Date(h.created_at));

            // Exclude if created after the selected month ends
            if (isAfter(createdDate, monthEnd)) return false;

            // If archived, check if archived before the selected month started
            if (h.archived_at) {
                const archivedDate = new Date(h.archived_at);
                // Exclude if archived before the selected month started
                if (isBefore(archivedDate, monthStart)) return false;
            }

            return true;
        }).sort((a, b) => (a.priority || 0) - (b.priority || 0));
    }, [habits, monthStart, monthEnd]);

    // Get currently active habits (for pulse data - only non-archived)
    const activeHabits = useMemo(() =>
        habits.filter(h => !h.archived_at).sort((a, b) => (a.priority || 0) - (b.priority || 0)),
        [habits]
    );

    // Navigation handlers
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

    // --- Productivity Pulse Data for Selected Month ---
    const pulseData = useMemo(() => {
        // For future months, return empty array (no data yet)
        if (isFutureMonth) {
            return [];
        }

        const today = new Date();
        const days = isCurrentMonth
            ? Math.min(today.getDate(), daysInMonth)
            : daysInMonth;

        const data = [];

        for (let i = 0; i < days; i++) {
            const date = new Date(monthStart);
            date.setDate(date.getDate() + i);

            // Don't go beyond today for current month
            if (isCurrentMonth && isAfter(date, today)) break;

            const dateStr = format(date, 'yyyy-MM-dd');

            let totalPercentage = 0;
            let habitCount = 0;
            const dayLogs = logs.filter(l => l.date === dateStr);

            habitsForMonth.forEach(habit => {
                // Only count if habit existed on this day AND is scheduled
                const habitCreated = new Date(habit.created_at);
                // Also check if habit was archived before this date
                const habitArchived = habit.archived_at ? new Date(habit.archived_at) : null;
                const isArchived = habitArchived && habitArchived < date;

                if (habitCreated <= date && !isArchived && isHabitScheduledForDate(habit, date)) {
                    habitCount++;
                    const log = dayLogs.find(l => l.habit_id === habit.id);
                    if (habit.is_quantifiable) {
                        const value = log?.value || 0;
                        const target = habit.target_value || 1;
                        totalPercentage += Math.min((value / target), 1);
                    } else {
                        totalPercentage += log ? 1 : 0;
                    }
                }
            });

            const dailyScore = habitCount > 0 ? (totalPercentage / habitCount) * 100 : 0;
            data.push({ date: dateStr, score: dailyScore });
        }
        return data;
    }, [habitsForMonth, logs, selectedMonth, isCurrentMonth, isFutureMonth, daysInMonth, monthStart]);

    // Calculate habit performance for the selected month
    // Uses habitsForMonth to properly filter by creation/archive dates
    const habitPerformance = useMemo(() => {
        return habitsForMonth.map(habit => {
            // Normalize habit creation date to start of day for proper comparison
            const habitCreatedDate = new Date(habit.created_at);
            habitCreatedDate.setHours(0, 0, 0, 0);

            let completed = 0;
            let possible = 0;

            // Determine the effective start date for this habit in this month
            // If habit was created after month start, use habit creation date
            // Otherwise use month start
            const effectiveStart = habitCreatedDate > monthStart ? habitCreatedDate : monthStart;

            // Determine the effective end date
            // Always use end of month for denominator - shows total scheduled days for the month
            // BUT cap it at the habit's archive date if it was archived this month
            let effectiveEnd = monthEnd;
            if (habit.archived_at) {
                const archiveDate = new Date(habit.archived_at);
                if (archiveDate < monthEnd) {
                    effectiveEnd = archiveDate;
                }
            }

            // Only calculate if habit existed during this month (and wasn't archived before start)
            if (effectiveStart <= effectiveEnd) {
                const days = eachDayOfInterval({ start: effectiveStart, end: effectiveEnd });

                days.forEach(day => {
                    // Only count if this day is scheduled for this habit
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

            // Calculate previous month for trend - only if habit existed then
            const prevMonthStart = startOfMonth(subMonths(selectedMonth, 1));
            const prevMonthEnd = endOfMonth(subMonths(selectedMonth, 1));
            let prevCompleted = 0;
            let prevPossible = 0;

            // Check if habit existed in previous month at all
            const habitExistedInPrevMonth = habitCreatedDate <= prevMonthEnd;

            if (habitExistedInPrevMonth) {
                const prevEffectiveStart = habitCreatedDate > prevMonthStart ? habitCreatedDate : prevMonthStart;

                if (prevEffectiveStart <= prevMonthEnd) {
                    const prevDays = eachDayOfInterval({ start: prevEffectiveStart, end: prevMonthEnd });
                    prevDays.forEach(day => {
                        // Only count scheduled days for frequency
                        if (isHabitScheduledForDate(habit, day)) {
                            prevPossible++;
                            const dateStr = format(day, 'yyyy-MM-dd');
                            const log = logs.find(l => l.habit_id === habit.id && l.date === dateStr);
                            if (log) {
                                if (habit.is_quantifiable) {
                                    prevCompleted += Math.min((log.value || 0) / (habit.target_value || 1), 1);
                                } else {
                                    prevCompleted++;
                                }
                            }
                        }
                    });
                }
            }

            const prevRate = prevPossible > 0 ? Math.round((prevCompleted / prevPossible) * 100) : 0;
            const trend = rate - prevRate;

            // Habit is "new" if it didn't exist at all in the previous month
            const isNew = !habitExistedInPrevMonth;

            return { habit, rate, streak, trend, completed: Math.round(completed), possible, isNew };
        });
    }, [activeHabits, logs, selectedMonth, isCurrentMonth, monthStart, monthEnd]);

    // Average completion
    const avgScore = useMemo(() => {
        if (pulseData.length === 0) return 0;
        const sum = pulseData.reduce((acc, d) => acc + d.score, 0);
        return Math.round(sum / pulseData.length);
    }, [pulseData]);

    const getTrendIcon = (trend: number) => {
        if (trend > 0) return <TrendingUp className="w-3 h-3" />;
        if (trend < 0) return <TrendingDown className="w-3 h-3" />;
        return <Minus className="w-3 h-3" />;
    };

    const getTrendColor = (trend: number) => {
        if (trend > 0) return 'text-green-600';
        if (trend < 0) return 'text-red-500';
        return 'text-gray-400';
    };

    return (
        <div className="min-h-screen pb-24 px-4 bg-[#FFF8E7]">
            {/* Header */}
            <div className="pt-8 pb-4 safe-area-top">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-3xl font-black text-[#1F1F1F] tracking-tight">
                            Insights
                        </h1>
                        <p className="text-[#6B6B6B] font-medium">
                            Your progress at a glance
                        </p>
                    </div>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-center bg-white rounded-xl p-2 shadow-sm border border-gray-100">
                    <button
                        onClick={handlePreviousMonth}
                        disabled={!canGoBack}
                        className={`p-2 rounded-lg transition-all active:scale-95 ${canGoBack ? 'hover:bg-gray-50 text-gray-600' : 'text-gray-300 cursor-not-allowed'
                            }`}
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
                        className={`p-2 rounded-lg transition-all active:scale-95 ${canGoForward ? 'hover:bg-gray-50 text-gray-600' : 'text-gray-300 cursor-not-allowed'
                            }`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Summary Stats Hero - for current range */}
            {isCurrentMonth && (
                <SummaryStats
                    habits={habits}
                    logs={logs}
                    periodDays={new Date().getDate()} // Days so far this month
                />
            )}

            {/* Smart Insights - only show for current month */}
            {isCurrentMonth && <SmartInsights habits={habits} logs={logs} />}

            {/* Productivity Pulse Chart */}
            <div className="mb-6">
                <ProductivityPulse
                    data={pulseData}
                    color="#FF7A6B"
                    height={120}
                />
                <div className="flex justify-center mt-2">
                    <span className="text-xs text-gray-400 font-medium">
                        {isCurrentMonth ? `Avg: ${avgScore}% completion` : `${format(selectedMonth, 'MMMM')} Avg: ${avgScore}%`}
                    </span>
                </div>
            </div>

            {/* Habit Performance Cards - Improved */}
            <SectionDivider text="HABIT BREAKDOWN" />

            {activeHabits.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 mt-4">
                    <p className="text-4xl mb-3">📊</p>
                    <p className="text-gray-600 font-medium">No habits to analyze yet</p>
                    <p className="text-gray-400 text-sm">Add habits to see your insights</p>
                </div>
            ) : (
                <div className="mt-4 space-y-3">
                    {habitPerformance.map(({ habit, rate, streak, trend, completed, possible, isNew }) => {
                        const colorKey = categoryColorMap[habit.category] || 'coral';
                        const habitColor = colors.habitColors[colorKey].start;

                        return (
                            <div
                                key={habit.id}
                                className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                            >
                                <div className="flex items-center gap-3">
                                    {/* Emoji */}
                                    <div
                                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: `${habitColor}15` }}
                                    >
                                        {getCategoryEmoji(habit.category)}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-gray-800 truncate">{habit.name}</h3>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <div className="flex items-center gap-1 text-orange-500 text-sm font-semibold">
                                                <Flame className="w-4 h-4" />
                                                {streak}
                                            </div>
                                            <span className="text-xs text-gray-400">
                                                {completed}/{possible} days
                                            </span>
                                            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-500 font-medium">
                                                {getFrequencyLabel(getHabitFrequency(habit))}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Rate & Trend */}
                                    <div className="text-right">
                                        <div className="text-2xl font-black text-gray-800">{rate}%</div>
                                        {isNew ? (
                                            <span className="text-xs font-semibold text-blue-500 bg-blue-50 px-2 py-0.5 rounded-full">
                                                ✨ New
                                            </span>
                                        ) : (
                                            <div className={`flex items-center justify-end gap-1 text-xs font-semibold ${getTrendColor(trend)}`}>
                                                {getTrendIcon(trend)}
                                                {Math.abs(trend)}% vs prev
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar */}
                                <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full rounded-full transition-all duration-500"
                                        style={{
                                            width: `${rate}%`,
                                            background: `linear-gradient(90deg, ${habitColor}, ${colors.habitColors[colorKey].end})`
                                        }}
                                    />
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
