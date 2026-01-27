/**
 * SmartInsights - AI-style insights and tips based on habit data
 */

import React, { useMemo } from 'react';
import { format, subDays, getDay } from 'date-fns';
import { Habit, HabitLog } from '../../types';
import { Lightbulb, TrendingUp, Calendar, Zap } from 'lucide-react';
import { calculateStreak } from '../../utils/analytics';

interface SmartInsightsProps {
    habits: Habit[];
    logs: HabitLog[];
}

interface Insight {
    icon: React.ReactNode;
    text: string;
    type: 'success' | 'tip' | 'warning' | 'info';
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const SmartInsights: React.FC<SmartInsightsProps> = ({ habits, logs }) => {
    const insights = useMemo(() => {
        const result: Insight[] = [];
        const activeHabits = habits.filter(h => !h.archived_at);
        const today = new Date();

        if (activeHabits.length === 0) {
            return [{ icon: <Lightbulb className="w-4 h-4" />, text: "Add some habits to start tracking your progress!", type: 'info' as const }];
        }

        // 1. Streak achievements
        activeHabits.forEach(habit => {
            const streak = calculateStreak(habit, logs);
            if (streak >= 7) {
                result.push({
                    icon: <Zap className="w-4 h-4" />,
                    text: `Amazing! ${streak} day streak on "${habit.name}"! 🔥`,
                    type: 'success'
                });
            }
        });

        // 2. Find best day of week
        const dayCompletions = [0, 0, 0, 0, 0, 0, 0];
        const dayCounts = [0, 0, 0, 0, 0, 0, 0];

        for (let i = 0; i < 30; i++) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');
            const dayOfWeek = getDay(date);

            dayCounts[dayOfWeek]++;
            const dayLogs = logs.filter(l => l.date === dateStr);
            dayCompletions[dayOfWeek] += dayLogs.length;
        }

        let bestDay = 0;
        let bestRate = 0;
        dayCompletions.forEach((completions, day) => {
            const rate = dayCounts[day] > 0 ? completions / dayCounts[day] : 0;
            if (rate > bestRate) {
                bestRate = rate;
                bestDay = day;
            }
        });

        if (bestRate > 0) {
            result.push({
                icon: <Calendar className="w-4 h-4" />,
                text: `${DAYS[bestDay]} is your most productive day!`,
                type: 'info'
            });
        }

        // 3. Recent improvement
        const last7Days = logs.filter(l => {
            const logDate = new Date(l.date);
            return logDate >= subDays(today, 7);
        }).length;

        const prev7Days = logs.filter(l => {
            const logDate = new Date(l.date);
            return logDate >= subDays(today, 14) && logDate < subDays(today, 7);
        }).length;

        if (last7Days > prev7Days && prev7Days > 0) {
            const improvement = Math.round(((last7Days - prev7Days) / prev7Days) * 100);
            result.push({
                icon: <TrendingUp className="w-4 h-4" />,
                text: `You're ${improvement}% more consistent than last week!`,
                type: 'success'
            });
        }

        // 4. Tip for least consistent habit
        let worstHabit: Habit | null = null;
        let worstRate = 1;

        activeHabits.forEach(habit => {
            let completed = 0;
            let possible = 0;

            for (let i = 0; i < 14; i++) {
                const dateStr = format(subDays(today, i), 'yyyy-MM-dd');
                if (new Date(dateStr) >= new Date(habit.created_at)) {
                    possible++;
                    if (logs.some(l => l.habit_id === habit.id && l.date === dateStr)) {
                        completed++;
                    }
                }
            }

            const rate = possible > 0 ? completed / possible : 1;
            if (rate < worstRate && possible >= 3) {
                worstRate = rate;
                worstHabit = habit;
            }
        });

        if (worstHabit && worstRate < 0.5) {
            result.push({
                icon: <Lightbulb className="w-4 h-4" />,
                text: `Tip: Try doing "${(worstHabit as Habit).name}" at the same time each day`,
                type: 'tip'
            });
        }

        // Limit to 3 insights
        return result.slice(0, 3);
    }, [habits, logs]);

    const getInsightStyle = (type: string) => {
        switch (type) {
            case 'success': return 'bg-green-50 border-green-200 text-green-800';
            case 'tip': return 'bg-amber-50 border-amber-200 text-amber-800';
            case 'warning': return 'bg-red-50 border-red-200 text-red-800';
            default: return 'bg-blue-50 border-blue-200 text-blue-800';
        }
    };

    if (insights.length === 0) return null;

    return (
        <div className="space-y-2 mb-6">
            {insights.map((insight, index) => (
                <div
                    key={index}
                    className={`flex items-center gap-3 p-3 rounded-xl border ${getInsightStyle(insight.type)}`}
                >
                    <div className="flex-shrink-0">{insight.icon}</div>
                    <p className="text-sm font-medium">{insight.text}</p>
                </div>
            ))}
        </div>
    );
};
