import React, { useMemo } from 'react';
import { Habit, HabitLog } from '../../types';
import { colors, categoryColorMap } from '../../theme/colors';
import { SimpleBarChart } from './SimpleBarChart';

import { calculateStreak } from '../../utils/analytics';
import { format, subDays, parseISO } from 'date-fns';
import { Flame, Target } from 'lucide-react';
import { getCategoryEmoji } from '../../utils/categoryEmojis';

interface HabitPerformanceCardProps {
    habit: Habit;
    logs: HabitLog[];
    currentMonth: Date; // Keep for context if needed, but we might show recent data
}

export const HabitPerformanceCard: React.FC<HabitPerformanceCardProps> = ({
    habit,
    logs
}) => {
    const isQuantifiable = habit.is_quantifiable;

    // Color setup
    const colorKey = categoryColorMap[habit.category] || 'coral';
    const habitColor = colors.habitColors[colorKey].start; // Use primary start color

    // --- Stats Calculation ---
    const streak = calculateStreak(habit, logs);

    // Data for Bar Chart (Last 14 days)
    const barData = useMemo(() => {
        if (!isQuantifiable) return [];

        const days = 14;
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');

            const log = logs.find(l => l.habit_id === habit.id && l.date === dateStr);
            const value = log ? (log.value || 0) : 0;

            data.push({
                label: format(date, 'd'), // Just the day number
                fullDate: dateStr,
                value: value,
                target: habit.target_value || 1
            });
        }
        return data;
    }, [habit, logs]);

    // Volume Stats (for quantifiable)
    const volumeStats = useMemo(() => {
        if (!isQuantifiable) return null;

        // Filter for current month window (or general recent)
        // Let's settle on "Last 30 Days" for a rollingstat
        const now = new Date();
        const thirtyDaysAgo = subDays(now, 30);

        const recentLogs = logs.filter(l =>
            l.habit_id === habit.id &&
            parseISO(l.date) >= thirtyDaysAgo
        );

        const totalVolume = recentLogs.reduce((sum, l) => sum + (l.value || 0), 0);
        const avgVolume = recentLogs.length > 0 ? Math.round(totalVolume / 30) : 0; // Avg per day over 30 days
        // Or avg per LOGGED day? usually avg per day is more "honest" about consistency

        return { total: totalVolume, avg: avgVolume };
    }, [habit, logs, isQuantifiable]);


    // For Quantifiable: Full Card
    if (isQuantifiable) {
        return (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-4 transition-all hover:shadow-md">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <div className="text-3xl bg-gray-50 w-12 h-12 flex items-center justify-center rounded-xl">
                            {getCategoryEmoji(habit.category)}
                        </div>
                        <div>
                            <h3 className="font-bold text-gray-800 text-lg">{habit.name}</h3>
                            <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                                Daily Volume
                            </p>
                        </div>
                    </div>

                    {/* Top Right Highlight Stat */}
                    <div className="flex flex-col items-end">
                        <div className="flex items-center gap-1 text-gray-800 font-bold text-lg">
                            <Target className="w-4 h-4 text-gray-400" />
                            {volumeStats?.total} {habit.unit}
                        </div>
                        <span className="text-xs text-gray-400">Last 30 Days</span>
                    </div>
                </div>

                {/* Quantifiable View: Bar Chart */}
                <div className="space-y-4">
                    <SimpleBarChart
                        data={barData}
                        color={habitColor}
                        height={100}
                    />

                    {/* Secondary Stats Row */}
                    <div className="flex gap-4 pt-2 border-t border-gray-50">
                        <div className="flex-1">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Daily Avg</p>
                            <p className="font-semibold text-gray-700">{volumeStats?.avg} {habit.unit}</p>
                        </div>
                        <div className="flex-1">
                            <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Goal</p>
                            <p className="font-semibold text-gray-700">{habit.target_value} {habit.unit}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // For Non-Quantifiable: Compact Row
    return (
        <div className="bg-white rounded-xl border border-gray-100 p-3 mb-2 flex items-center gap-4 shadow-sm transition-all hover:scale-[1.01] active:scale-95">
            {/* Compact Icon */}
            <div className="text-xl bg-gray-50 w-10 h-10 flex items-center justify-center rounded-lg flex-shrink-0">
                {getCategoryEmoji(habit.category)}
            </div>

            {/* Compact Name & Streak */}
            <div className="w-24 flex-shrink-0">
                <h3 className="font-bold text-gray-700 text-sm truncate">{habit.name}</h3>
                <div className="flex items-center gap-1 text-xs text-orange-600 font-bold">
                    <Flame className="w-3 h-3" />
                    {streak}
                </div>
            </div>

            {/* Compact Mini Heatmap */}
            <div className="flex-1 flex items-end justify-end gap-1 h-8">
                {(() => {
                    const days = 10; // Show slightly fewer days to fit compact width
                    const today = new Date();
                    const historyData = [];

                    for (let i = days - 1; i >= 0; i--) {
                        const date = subDays(today, i);
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const isDone = logs.some(l => l.habit_id === habit.id && l.date === dateStr);
                        historyData.push({ date, dateStr, isDone });
                    }

                    return historyData.map((day) => (
                        <div key={day.dateStr} className="flex-1 max-w-[8px] flex flex-col items-center gap-1 h-full justify-end group relative">
                            {/* Simple tooltip on hover */}
                            <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                {format(day.date, 'MMM d')}
                            </div>

                            <div
                                className={`w-full rounded-sm transition-all duration-300 ${day.isDone ? '' : 'bg-gray-100'}`}
                                style={{
                                    background: day.isDone ? habitColor : undefined,
                                    height: day.isDone ? '100%' : '4px',
                                    minHeight: '4px'
                                }}
                            />
                        </div>
                    ));
                })()}
            </div>
        </div>
    );
};
