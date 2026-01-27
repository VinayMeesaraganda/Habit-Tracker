import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, Calendar as CalendarIcon, Flame, TrendingUp, Award } from 'lucide-react';
import { format, subDays, eachDayOfInterval, isSameMonth, startOfMonth, endOfMonth, getDay } from 'date-fns';
import { Habit, HabitLog } from '../types';
import { colors, categoryColorMap } from '../theme/colors';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import { calculateStreak, getLongestStreak } from '../utils/analytics';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

interface HabitDetailViewProps {
    habit: Habit | null;
    logs: HabitLog[];
    onClose: () => void;
}

export const HabitDetailView: React.FC<HabitDetailViewProps> = ({ habit, logs, onClose }) => {
    if (!habit) return null;

    const colorKey = categoryColorMap[habit.category] || 'coral';
    const habitColor = colors.habitColors[colorKey].start;

    // Calculate stats
    const stats = useMemo(() => {
        const today = new Date();
        const last30DaysStart = subDays(today, 29);
        const logsLast30Days = logs.filter(l =>
            l.habit_id === habit.id &&
            l.date >= format(last30DaysStart, 'yyyy-MM-dd')
        );

        const currentStreak = calculateStreak(habit, logs);
        const bestStreak = getLongestStreak([habit], logs).streak;

        // Average
        let average = 0;
        let totalValue = 0;
        if (habit.is_quantifiable) {
            totalValue = logsLast30Days.reduce((acc, log) => acc + (log.value || 0), 0);
            average = Math.round((totalValue / 30) * 10) / 10;
        } else {
            totalValue = logsLast30Days.length;
            average = Math.round((totalValue / 30) * 100); // Percentage for non-quantifiable
        }

        // Completion Rate (Consistency)
        // Ideally we'd check frequency for every day, but for a quick stat:
        const completionRate = Math.round((logsLast30Days.length / 30) * 100);

        return { currentStreak, bestStreak, average, totalValue, completionRate };
    }, [habit, logs]);

    // Chart Data (Last 30 Days)
    const chartData = useMemo(() => {
        const today = new Date();
        const days = eachDayOfInterval({ start: subDays(today, 29), end: today });

        return days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const log = logs.find(l => l.habit_id === habit.id && l.date === dateStr);
            let value = 0;
            if (log) {
                value = habit.is_quantifiable ? (log.value || 0) : 1;
            }
            return {
                date: format(day, 'MMM d'),
                value: value,
                rawDate: dateStr
            };
        });
    }, [habit, logs]);

    // Calendar Heatmap Data (Current Month)
    const calendarData = useMemo(() => {
        const today = new Date();
        const start = startOfMonth(today);
        const end = endOfMonth(today);
        const days = eachDayOfInterval({ start, end });

        // Pad start days
        const startDay = getDay(start); // 0 = Sunday
        const padding = Array(startDay).fill(null);

        return [...padding, ...days.map(day => {
            const dateStr = format(day, 'yyyy-MM-dd');
            const log = logs.find(l => l.habit_id === habit.id && l.date === dateStr);
            const isCompleted = !!log;
            const value = log?.value || 0;
            const progress = habit.is_quantifiable
                ? Math.min(value / (habit.target_value || 1), 1)
                : (isCompleted ? 1 : 0);

            return { date: day, progress };
        })];
    }, [habit, logs]);

    return (
        <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-0 bg-white z-50 overflow-y-auto"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
        >
            {/* Header */}
            <div className="sticky top-0 bg-white/80 backdrop-blur-md z-10 border-b border-gray-100 px-4 py-3 flex items-center justify-between">
                <button
                    onClick={onClose}
                    className="p-2 -ml-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors"
                >
                    <ChevronLeft className="w-6 h-6" />
                </button>
                <div className="flex flex-col items-center">
                    <span className="text-sm font-medium text-gray-500 uppercase tracking-wider">Analysis</span>
                    <span className="font-bold text-gray-900">{habit.name}</span>
                </div>
                <div className="w-10" /> {/* Spacer for centering */}
            </div>

            <div className="p-5 space-y-6 pb-20">
                {/* Hero Stats */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-orange-50 rounded-2xl p-4 flex flex-col justify-between h-32">
                        <div className="flex items-center gap-2 text-orange-600">
                            <Flame className="w-5 h-5" />
                            <span className="font-bold text-sm">Current Streak</span>
                        </div>
                        <div>
                            <span className="text-4xl font-black text-gray-900">{stats.currentStreak}</span>
                            <span className="text-gray-500 ml-1 font-medium">days</span>
                        </div>
                    </div>
                    <div className="bg-blue-50 rounded-2xl p-4 flex flex-col justify-between h-32">
                        <div className="flex items-center gap-2 text-blue-600">
                            <Award className="w-5 h-5" />
                            <span className="font-bold text-sm">Best Streak</span>
                        </div>
                        <div>
                            <span className="text-4xl font-black text-gray-900">{stats.bestStreak}</span>
                            <span className="text-gray-500 ml-1 font-medium">days</span>
                        </div>
                    </div>
                </div>

                {/* 30-Day Trend */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-gray-400" />
                            <h3 className="font-bold text-gray-700">Last 30 Days</h3>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-black text-gray-900">
                                {stats.average}
                                {habit.is_quantifiable ? '' : '%'}
                            </div>
                            <div className="text-xs text-gray-400 font-medium uppercase">
                                {habit.is_quantifiable ? `Avg ${habit.unit}` : 'Consistency'}
                            </div>
                        </div>
                    </div>

                    <div className="h-48 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="date"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#9CA3AF', fontSize: 10 }}
                                    interval={6}
                                />
                                <YAxis
                                    hide
                                    domain={[0, habit.is_quantifiable ? 'auto' : 1]}
                                />
                                <Tooltip
                                    cursor={{ stroke: habitColor, strokeWidth: 1, strokeDasharray: '4 4' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="value"
                                    stroke={habitColor}
                                    strokeWidth={3}
                                    dot={false}
                                    activeDot={{ r: 6, fill: habitColor, stroke: '#fff', strokeWidth: 2 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Monthly Calendar */}
                <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <CalendarIcon className="w-5 h-5 text-gray-400" />
                        <h3 className="font-bold text-gray-700">{format(new Date(), 'MMMM')} History</h3>
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(d => (
                            <div key={d} className="text-center text-xs text-gray-300 font-bold mb-1">{d}</div>
                        ))}
                        {calendarData.map((day, i) => {
                            if (!day) return <div key={`pad-${i}`} className="aspect-square" />;

                            const isToday = isSameMonth(day.date, new Date()) && day.date.getDate() === new Date().getDate();

                            return (
                                <div
                                    key={day.date.toString()}
                                    className="aspect-square rounded-lg flex items-center justify-center relative"
                                    style={{
                                        backgroundColor: day.progress > 0
                                            ? `${habitColor}${Math.max(15, Math.round(day.progress * 100))}` // Opacity handled by hex if using custom util, simplified here
                                            : '#F3F4F6' // Gray-100
                                    }}
                                >
                                    {/* Using inline style for opacity hack or just dynamic classes if possible. 
                                        Since we have hex colors, let's just use opacity with rgba or style. 
                                        Actually better to use style with background color.
                                    */}
                                    <div
                                        className="absolute inset-0 rounded-lg"
                                        style={{
                                            backgroundColor: day.progress > 0 ? habitColor : 'transparent',
                                            opacity: day.progress > 0 ? Math.max(0.1, day.progress) : 0
                                        }}
                                    />

                                    <span className={`text-[10px] font-medium z-10 ${day.progress > 0.5 ? 'text-white' : 'text-gray-400'}`}>
                                        {day.date.getDate()}
                                    </span>

                                    {isToday && (
                                        <div className="absolute -bottom-1 w-1 h-1 bg-black rounded-full" />
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Info Card */}
                <div className="bg-gray-50 rounded-2xl p-4 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-2xl">
                        {getCategoryEmoji(habit.category)}
                    </div>
                    <div>
                        <div className="font-bold text-gray-900">{habit.name}</div>
                        <div className="text-sm text-gray-500">{habit.frequency?.type || 'Daily'}</div>
                    </div>
                </div>

            </div>
        </motion.div>
    );
};
