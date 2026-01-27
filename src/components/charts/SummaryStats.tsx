/**
 * SummaryStats - Hero stats section for Insights page
 * Shows completion rate, best streak, and total logged
 */

import React, { useMemo } from 'react';
import { format, subDays } from 'date-fns';
import { Habit, HabitLog } from '../../types';
import { TrendingUp, TrendingDown, Minus, Flame, CheckCircle2, Target } from 'lucide-react';
import { calculateStreak } from '../../utils/analytics';

interface SummaryStatsProps {
    habits: Habit[];
    logs: HabitLog[];
    periodDays: number; // 7 for week, 30 for month
}

export const SummaryStats: React.FC<SummaryStatsProps> = ({ habits, logs, periodDays }) => {
    const stats = useMemo(() => {
        const today = new Date();
        const periodStart = subDays(today, periodDays - 1);

        // Filter active habits
        const activeHabits = habits.filter(h => !h.archived_at);
        if (activeHabits.length === 0) {
            return { completionRate: 0, trend: 0, bestStreak: 0, bestHabit: null, totalLogged: 0 };
        }

        // Calculate current period completion
        let currentCompleted = 0;
        let currentPossible = 0;
        let previousCompleted = 0;
        let previousPossible = 0;

        for (let i = 0; i < periodDays; i++) {
            const currentDate = format(subDays(today, i), 'yyyy-MM-dd');
            const previousDate = format(subDays(periodStart, i + 1), 'yyyy-MM-dd');

            activeHabits.forEach(habit => {
                // Only count habits that existed on that day
                const habitCreated = new Date(habit.created_at);

                // Current period
                if (new Date(currentDate) >= habitCreated) {
                    currentPossible++;
                    const log = logs.find(l => l.habit_id === habit.id && l.date === currentDate);
                    if (log) {
                        if (habit.is_quantifiable) {
                            currentCompleted += Math.min((log.value || 0) / (habit.target_value || 1), 1);
                        } else {
                            currentCompleted++;
                        }
                    }
                }

                // Previous period
                if (new Date(previousDate) >= habitCreated) {
                    previousPossible++;
                    const prevLog = logs.find(l => l.habit_id === habit.id && l.date === previousDate);
                    if (prevLog) {
                        if (habit.is_quantifiable) {
                            previousCompleted += Math.min((prevLog.value || 0) / (habit.target_value || 1), 1);
                        } else {
                            previousCompleted++;
                        }
                    }
                }
            });
        }

        const completionRate = currentPossible > 0 ? Math.round((currentCompleted / currentPossible) * 100) : 0;
        const previousRate = previousPossible > 0 ? Math.round((previousCompleted / previousPossible) * 100) : 0;
        const trend = completionRate - previousRate;

        // Find best streak
        let bestStreak = 0;
        let bestHabit: Habit | null = null;
        activeHabits.forEach(habit => {
            const streak = calculateStreak(habit, logs);
            if (streak > bestStreak) {
                bestStreak = streak;
                bestHabit = habit;
            }
        });

        // Total logged in period
        const periodLogs = logs.filter(l => {
            const logDate = new Date(l.date);
            return logDate >= periodStart && logDate <= today;
        });
        const totalLogged = periodLogs.length;

        return { completionRate, trend, bestStreak, bestHabit, totalLogged };
    }, [habits, logs, periodDays]);

    const getTrendIcon = () => {
        if (stats.trend > 0) return <TrendingUp className="w-4 h-4" />;
        if (stats.trend < 0) return <TrendingDown className="w-4 h-4" />;
        return <Minus className="w-4 h-4" />;
    };

    const getTrendColor = () => {
        if (stats.trend > 0) return 'text-green-600 bg-green-50';
        if (stats.trend < 0) return 'text-red-500 bg-red-50';
        return 'text-gray-500 bg-gray-50';
    };

    return (
        <div className="grid grid-cols-3 gap-3 mb-6">
            {/* Completion Rate */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-orange-50">
                        <Target className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Rate</span>
                </div>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-gray-800">{stats.completionRate}%</span>
                    <div className={`flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-xs font-bold ${getTrendColor()}`}>
                        {getTrendIcon()}
                        {Math.abs(stats.trend)}%
                    </div>
                </div>
            </div>

            {/* Best Streak */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-orange-50">
                        <Flame className="w-4 h-4 text-orange-500" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Streak</span>
                </div>
                <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-gray-800">{stats.bestStreak}</span>
                    <span className="text-sm text-gray-400 mb-1">days</span>
                </div>
            </div>

            {/* Total Logged */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-lg bg-green-50">
                        <CheckCircle2 className="w-4 h-4 text-green-500" />
                    </div>
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Done</span>
                </div>
                <div className="flex items-end gap-1">
                    <span className="text-3xl font-black text-gray-800">{stats.totalLogged}</span>
                    <span className="text-sm text-gray-400 mb-1">logs</span>
                </div>
            </div>
        </div>
    );
};
