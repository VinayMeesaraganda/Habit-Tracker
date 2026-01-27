import React, { useMemo, useState } from 'react';
import { startOfMonth, subMonths, addMonths, format } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { SectionDivider } from '../components/ui';
import { StatsCard } from '../components/StatsCard';
import { Heatmap } from '../components/Heatmap';
import { MonthYearPicker } from '../components/MonthYearPicker';
import { calculateStreak } from '../utils/analytics';
import { getHabitMonthlyProgress } from '../utils/habitProgress';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import { Flame, CheckCircle2, Calendar, Trophy, ChevronLeft, ChevronRight } from 'lucide-react';

interface InsightsScreenProps {
    currentMonth: Date;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ currentMonth: propCurrentMonth }) => {
    const { habits, logs, setCurrentMonth } = useHabits();
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Ensure we have a valid date
    const currentMonth = useMemo(() => {
        if (!propCurrentMonth || isNaN(propCurrentMonth.getTime())) {
            return new Date();
        }
        return propCurrentMonth;
    }, [propCurrentMonth]);

    // Get active habits
    const activeHabits = useMemo(() =>
        habits.filter(h => !h.archived_at),
        [habits]
    );

    // --- Analytics Calculations ---

    const stats = useMemo(() => {
        // Filter logs for this month using string comparisons to avoid Timezone issues
        const monthPrefix = format(currentMonth, 'yyyy-MM');

        const monthLogs = logs.filter(log => log.date.startsWith(monthPrefix));

        // 1. Current Streak (Best active streak - All Time)
        const streaks = activeHabits.map(h => calculateStreak(h, logs));
        const bestStreak = Math.max(...streaks, 0);

        // 2. Total Completions (All Time - Requested by User)
        const totalCompletions = logs.length;

        // 3. Completion Rate (This Month)
        // Calculate total possible completions for this month (approximate)
        const totalActiveHabits = activeHabits.length;
        const monthCompletionsCount = monthLogs.length;

        // 4. Perfect Days (In Selected Month)
        const logsByDate = new Map<string, number>();
        monthLogs.forEach(log => {
            logsByDate.set(log.date, (logsByDate.get(log.date) || 0) + 1);
        });

        let monthPerfectDays = 0;
        logsByDate.forEach((count) => {
            // A day is perfect if ALL active habits were completed
            if (totalActiveHabits > 0 && count >= totalActiveHabits) {
                monthPerfectDays++;
            }
        });

        return {
            bestStreak,
            totalCompletions,
            monthCompletionsCount,
            monthPerfectDays
        };
    }, [activeHabits, logs, currentMonth]);


    // Habit Breakdown Data
    const habitBreakdown = useMemo(() => {
        return activeHabits.map(habit => {
            const progress = getHabitMonthlyProgress(habit, logs, currentMonth);
            return {
                habit,
                ...progress,
                streak: calculateStreak(habit, logs)
            };
        }).sort((a, b) => b.percentage - a.percentage);
    }, [activeHabits, logs, currentMonth]);

    const handlePreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    return (
        <div className="min-h-screen pb-24 px-4 bg-[#FFF8E7]">
            <MonthYearPicker
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                selectedDate={currentMonth}
                onSelect={setCurrentMonth}
            />

            {/* Header */}
            <div className="pt-8 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extra-bold text-[#1F1F1F] tracking-tight mb-1">
                        Insights
                    </h1>
                    <p className="text-[#6B6B6B] font-medium">
                        Your progress at a glance
                    </p>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-1.5">
                    <button
                        onClick={handlePreviousMonth}
                        className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors active:scale-95"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowDatePicker(true)}
                        className="text-sm font-bold text-gray-700 w-28 text-center py-1 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {format(currentMonth, 'MMMM yyyy')}
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors active:scale-95"
                        disabled={currentMonth >= startOfMonth(new Date())}
                        style={{ opacity: currentMonth >= startOfMonth(new Date()) ? 0.3 : 1 }}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mb-6">
                <StatsCard
                    title="Best Streak"
                    value={stats.bestStreak}
                    icon={Flame}
                    iconColor="#FF7A6B"
                    bgColor="#FFF0EE"
                    trend="All Time"
                    trendUp={true}
                />
                <StatsCard
                    title="Total Done"
                    value={stats.totalCompletions}
                    icon={CheckCircle2}
                    iconColor="#4CAF50"
                    bgColor="#E8F5E9"
                    trend="All Time"
                />
                <StatsCard
                    title={`Done (${format(currentMonth, 'MMM')})`}
                    value={stats.monthCompletionsCount}
                    icon={Calendar}
                    iconColor="#2196F3"
                    bgColor="#E3F2FD"
                    trend={`${format(currentMonth, 'MMM')}`}
                />
                <StatsCard
                    title={`Perfect Days (${format(currentMonth, 'MMM')})`}
                    value={stats.monthPerfectDays}
                    icon={Trophy}
                    iconColor="#FFC107"
                    bgColor="#FFF8E1"
                />
            </div>

            {/* Heatmap (Monthly Calendar) */}
            <div className="mb-6">
                <Heatmap logs={logs} month={currentMonth} />
            </div>

            {/* Habit Breakdown */}
            <div className="mb-8">
                <SectionDivider text="PERFORMANCE" />

                {habitBreakdown.length === 0 ? (
                    <div className="text-center py-8 bg-white rounded-2xl border border-gray-100">
                        <p className="text-gray-400">No habits tracked yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {habitBreakdown.map(item => (
                            <div
                                key={item.habit.id}
                                className="flex items-center p-4 rounded-xl bg-white border border-gray-100 shadow-sm transition-transform hover:scale-[1.01]"
                            >
                                {/* Icon */}
                                <div className="text-3xl mr-4">
                                    {getCategoryEmoji(item.habit.category)}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-center mb-1">
                                        <h3 className="font-bold text-gray-800 truncate">
                                            {item.habit.name}
                                        </h3>
                                        <div className="flex items-center gap-1.5 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-100">
                                            <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                            <span className="text-xs font-bold text-orange-600">{item.streak}</span>
                                        </div>
                                    </div>

                                    {/* Progress Bar */}
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${item.percentage}%`,
                                                    background: item.percentage >= 100
                                                        ? '#4CAF50'
                                                        : 'linear-gradient(90deg, #FF7A6B 0%, #FFA094 100%)'
                                                }}
                                            />
                                        </div>
                                        <span className="text-xs font-bold text-gray-500 w-8 text-right">
                                            {item.percentage}%
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
