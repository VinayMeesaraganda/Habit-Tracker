import React, { useMemo, useState, useCallback } from 'react';
import { format, addMonths, subMonths } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { ColorfulHabitCard, SectionDivider } from '../components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useVisibleHabits } from '../hooks/useVisibleHabits';
import { calculateStreak } from '../utils/analytics';
import { getHabitMonthlyProgress } from '../utils/habitProgress';
import { getCategoryEmoji } from '../utils/categoryEmojis';
import { DATE_FORMATS } from '../utils/dateFormats';
import { Habit } from '../types';

interface CalendarScreenProps {
    currentMonth: Date;
    onEditHabit?: (habit: Habit) => void;
}

export const CalendarScreen: React.FC<CalendarScreenProps> = ({ currentMonth: initialMonth, onEditHabit }) => {
    const { habits, logs, getHabitLogs, toggleLog, setCurrentMonth } = useHabits();
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [viewMonth, setViewMonth] = useState<Date>(initialMonth);

    // Use shared hook for filtering habits
    const visibleHabits = useVisibleHabits(habits, selectedDate);

    // Get selected date logs
    const selectedDateLogs = useMemo(() =>
        getHabitLogs(selectedDate),
        [selectedDate, getHabitLogs]
    );

    // Get habits for selected date with completion status
    const selectedDateHabits = useMemo(() => {
        return visibleHabits.map(habit => ({
            ...habit,
            completed: selectedDateLogs.some(log => log.habit_id === habit.id),
        }));
    }, [visibleHabits, selectedDateLogs]);

    // Calculate selected date stats
    const selectedDateStats = useMemo(() => {
        const completed = selectedDateLogs.length;
        const total = visibleHabits.length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
        return { completed, total, percentage };
    }, [selectedDateLogs.length, visibleHabits.length]);

    // Handle habit toggle for selected date
    const handleToggle = useCallback(async (habitId: string) => {
        const dateStr = format(selectedDate, DATE_FORMATS.ISO_DATE);
        await toggleLog(habitId, dateStr);
    }, [selectedDate, toggleLog]);

    // Handle month navigation
    const handlePreviousMonth = useCallback(() => {
        const newMonth = subMonths(viewMonth, 1);
        const firstDayOfMonth = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1, 12, 0, 0);
        setViewMonth(newMonth);
        setCurrentMonth(newMonth);
        setSelectedDate(firstDayOfMonth);
    }, [viewMonth, setCurrentMonth]);

    const handleNextMonth = useCallback(() => {
        const newMonth = addMonths(viewMonth, 1);
        const firstDayOfMonth = new Date(newMonth.getFullYear(), newMonth.getMonth(), 1, 12, 0, 0);
        setViewMonth(newMonth);
        setCurrentMonth(newMonth);
        setSelectedDate(firstDayOfMonth);
    }, [viewMonth, setCurrentMonth]);

    // Handle date change
    const handleDateChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const newDate = new Date(e.target.value + 'T12:00:00');
        setSelectedDate(newDate);
        setViewMonth(newDate);
        setCurrentMonth(newDate);
    }, [setCurrentMonth]);

    // Get schedule text
    const getScheduleText = (habit: Habit) => {
        if (habit.type === 'daily') return 'Everyday';
        return 'Weekly';
    };

    return (
        <div className="min-h-screen pb-24 px-4" style={{ background: '#FFF8E7' }}>
            {/* Header */}
            <div className="pt-8 pb-4">
                <h1 className="text-2xl font-bold mb-4" style={{ color: '#1F1F1F' }}>
                    Calendar
                </h1>

                {/* Compact Month Navigation */}
                <div className="flex items-center justify-between mb-3">
                    <button
                        onClick={handlePreviousMonth}
                        className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                        aria-label="Previous month"
                    >
                        <ChevronLeft className="w-5 h-5" style={{ color: '#6B6B6B' }} />
                    </button>
                    <span className="text-sm font-medium" style={{ color: '#1F1F1F' }}>
                        {format(viewMonth, DATE_FORMATS.MONTH_YEAR)}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="p-1.5 rounded-lg hover:bg-white/50 transition-colors"
                        aria-label="Next month"
                    >
                        <ChevronRight className="w-5 h-5" style={{ color: '#6B6B6B' }} />
                    </button>
                </div>

                {/* Compact Date Picker */}
                <input
                    type="date"
                    value={format(selectedDate, DATE_FORMATS.ISO_DATE)}
                    onChange={handleDateChange}
                    className="w-full max-w-full px-3 py-2 rounded-lg border text-sm text-center focus:outline-none focus:ring-2 transition-all"
                    style={{
                        colorScheme: 'dark',
                        maxWidth: '100%',
                        background: '#FFFFFF',
                        borderColor: '#E0E0E0',
                        color: '#1F1F1F',
                    }}
                />
            </div>

            {/* Compact Date Info */}
            <div className="mb-4 px-4 py-3 rounded-lg" style={{ background: '#FFFFFF', border: '1px solid #F0F0F0' }}>
                <div className="flex items-center justify-between mb-2">
                    <div>
                        <h2 className="text-base font-semibold" style={{ color: '#1F1F1F' }}>
                            {format(selectedDate, DATE_FORMATS.SHORT_DATE)}
                        </h2>
                        <p className="text-xs" style={{ color: '#6B6B6B' }}>
                            {selectedDateStats.completed}/{selectedDateStats.total} completed
                        </p>
                    </div>
                    <span className="text-2xl font-semibold" style={{ color: '#1F1F1F' }}>
                        {selectedDateStats.percentage}%
                    </span>
                </div>
                <div className="w-full h-1 rounded-full overflow-hidden" style={{ background: '#F0F0F0' }}>
                    <div
                        className="h-full transition-all duration-300"
                        style={{
                            width: `${selectedDateStats.percentage}%`,
                            background: '#52C55A',
                        }}
                    />
                </div>
            </div>

            {/* Habits List */}
            <SectionDivider text="HABITS" />

            {selectedDateHabits.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-sm" style={{ color: '#6B6B6B' }}>No habits for this day</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {selectedDateHabits.map(habit => (
                        <ColorfulHabitCard
                            key={habit.id}
                            icon={getCategoryEmoji(habit.category)}
                            name={habit.name}
                            schedule={getScheduleText(habit)}
                            completed={habit.completed}
                            category={habit.category}
                            onToggle={() => handleToggle(habit.id)}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
