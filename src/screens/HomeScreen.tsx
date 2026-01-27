import React, { useMemo, useCallback } from 'react';
import { format } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { ColorfulHabitCard, MultiSegmentProgressRing, SectionDivider } from '../components/ui';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import { DATE_FORMATS } from '../utils/dateFormats';
import { Habit } from '../types';

interface HomeScreenProps {
    selectedDate: Date;
    onEditHabit?: (habit: Habit) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ selectedDate, onEditHabit }) => {
    const { habits, logs, getHabitLogs, toggleLog } = useHabits();

    // Get active habits
    const activeHabits = useMemo(() =>
        habits.filter(h => !h.archived_at),
        [habits]
    );

    // Get today's logs
    const todayLogs = useMemo(() =>
        getHabitLogs(selectedDate),
        [selectedDate, getHabitLogs]
    );

    // Calculate stats for multi-segment ring
    const stats = useMemo(() => {
        const completed = todayLogs.length;
        const remaining = Math.max(0, activeHabits.length - completed);
        const overdue = 0; // Can be calculated based on time of day

        return { completed, remaining, overdue };
    }, [activeHabits.length, todayLogs.length]);

    // Check if habit is completed
    const isCompleted = useCallback((habitId: string) => {
        return todayLogs.some(log => log.habit_id === habitId);
    }, [todayLogs]);

    // Handle habit toggle
    const handleToggle = useCallback(async (habitId: string) => {
        const dateStr = format(selectedDate, DATE_FORMATS.ISO_DATE);
        await toggleLog(habitId, dateStr);
    }, [selectedDate, toggleLog]);

    // Get schedule text
    const getScheduleText = (habit: Habit) => {
        if (habit.type === 'daily') return 'Everyday';
        // For weekly, show days (simplified)
        return 'Weekly';
    };

    return (
        <div className="min-h-screen pb-24 px-4" style={{ background: '#FFF8E7' }}>
            {/* Header */}
            <div className="pt-8 pb-4">
                <h1 className="text-2xl font-bold mb-1" style={{ color: '#1F1F1F' }}>
                    Good <span style={{ color: '#FF7A6B' }}>Afternoon</span>
                </h1>
                <p className="text-sm" style={{ color: '#6B6B6B' }}>
                    ☀️ 32°C
                </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex gap-2 mb-6">
                <button
                    className="px-4 py-2 rounded-full text-sm font-semibold transition-all"
                    style={{
                        background: '#FFFFFF',
                        color: '#1F1F1F',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
                    }}
                >
                    Today
                </button>
                <button
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{ color: '#9E9E9E' }}
                >
                    This Week
                </button>
                <button
                    className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                    style={{ color: '#9E9E9E' }}
                >
                    This Month
                </button>
            </div>

            {/* Habits Section */}
            <div className="mb-6">
                <h2 className="text-xl font-bold mb-4" style={{ color: '#1F1F1F' }}>
                    Habits
                </h2>

                <div className="flex items-center justify-between mb-6">
                    {/* Legend */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: '#FFD97D' }} />
                            <span className="text-sm" style={{ color: '#6B6B6B' }}>Completed</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: '#FF7A6B' }} />
                            <span className="text-sm" style={{ color: '#6B6B6B' }}>Remaining</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ background: '#2D2D2D' }} />
                            <span className="text-sm" style={{ color: '#6B6B6B' }}>Overdue</span>
                        </div>
                    </div>

                    {/* Progress Ring */}
                    <MultiSegmentProgressRing
                        completed={stats.completed}
                        remaining={stats.remaining}
                        overdue={stats.overdue}
                    />
                </div>
            </div>

            {/* Habits Progress */}
            <SectionDivider text="HABITS PROGRESS" />

            {activeHabits.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-gray-500 text-lg mb-2">No habits yet</p>
                    <p className="text-gray-400 text-sm">
                        Tap the + button to create your first habit
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {activeHabits.map(habit => (
                        <ColorfulHabitCard
                            key={habit.id}
                            icon={getCategoryEmoji(habit.category)}
                            name={habit.name}
                            schedule={getScheduleText(habit)}
                            completed={isCompleted(habit.id)}
                            category={habit.category}
                            onToggle={() => handleToggle(habit.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
