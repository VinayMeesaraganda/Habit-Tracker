/**
 * DesktopDashboard - High Fidelity Matrix View
 * Dedicated Desktop Interface.
 */

import { useState, useMemo } from 'react';
import { useHabits } from '../context/HabitContext';
import { AddHabitModal } from './AddHabitModal';
import { RadialProgress } from './RadialProgress';
import { DailyCompletionChart, CategoryBreakdownChart } from './DashboardCharts';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, endOfWeek, startOfWeek, subMonths } from 'date-fns';
import { Plus, ChevronLeft, ChevronRight, Check, Settings } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/colors';
import { Habit } from '../types';

export function DesktopDashboard() {
    const { habits, logs, currentMonth, setCurrentMonth, toggleHabit, getHabitLogs } = useHabits();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

    // --- Helpers (Must be defined early for use in Memos) ---
    const isCompleted = (habitId: string, date: Date) => {
        const logs = getHabitLogs(date);
        return logs.some(l => l.habit_id === habitId && l.completed);
    };

    const handleToggle = (habitId: string, date: Date) => {
        toggleHabit(habitId, date);
    };

    const handleEditHabit = (habit: Habit) => {
        setEditingHabit(habit);
        setIsAddModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsAddModalOpen(false);
        setEditingHabit(null);
    };

    // --- Data Preparation ---

    const monthDays = useMemo(() => eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    }), [currentMonth]);

    // Filter habits based on Lifecycle (Created / Archived) for the Current Month View
    const activeHabits = useMemo(() => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);

        return habits.filter(habit => {
            const createdAt = new Date(habit.created_at);
            if (createdAt > monthEnd) return false;
            if (habit.archived_at) {
                const archivedAt = new Date(habit.archived_at);
                if (archivedAt < monthStart) return false;
            }
            return true;
        });
    }, [habits, currentMonth]);

    const dailyHabits = useMemo(() => activeHabits.filter(h => h.type === 'daily'), [activeHabits]);
    const weeklyHabits = useMemo(() => activeHabits.filter(h => h.type === 'weekly'), [activeHabits]);

    // Weekly Stats Logic
    const weeklyStats = useMemo(() => {
        const weeks: { start: Date; end: Date; completed: number; total: number }[] = [];
        let currentIterDate = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(currentMonth);
        let safetyCounter = 0;

        while (currentIterDate <= monthEnd && safetyCounter < 10) {
            safetyCounter++;
            const weekStart = currentIterDate;
            let weekEnd = endOfWeek(currentIterDate);
            if (weekEnd > monthEnd) weekEnd = monthEnd;

            let completed = 0;
            let total = 0;
            const daysInWeek = eachDayOfInterval({ start: weekStart, end: weekEnd });

            daysInWeek.forEach(day => {
                const dayLogs = getHabitLogs(day);
                dailyHabits.forEach(habit => {
                    total++;
                    if (dayLogs.some(log => log.habit_id === habit.id && log.completed)) {
                        completed++;
                    }
                });
            });

            weeklyHabits.forEach(habit => {
                total += 1;
                const doneThisWeek = logs.some(log =>
                    log.habit_id === habit.id &&
                    log.completed &&
                    log.date >= format(weekStart, 'yyyy-MM-dd') &&
                    log.date <= format(weekEnd, 'yyyy-MM-dd')
                );
                if (doneThisWeek) completed += 1;
            });

            weeks.push({ start: weekStart, end: weekEnd, completed, total });
            if (weekEnd >= monthEnd) break;
            currentIterDate = new Date(weekEnd.getTime() + 86400000);
            if (currentIterDate > endOfWeek(currentIterDate)) currentIterDate = startOfWeek(currentIterDate);
        }
        while (weeks.length < 5) weeks.push({ start: new Date(), end: new Date(), completed: 0, total: 1 });
        return weeks.slice(0, 5);
    }, [currentMonth, dailyHabits, weeklyHabits, getHabitLogs, logs]);

    const getHabitProgress = (habit: Habit) => {
        const start = startOfMonth(currentMonth);
        const end = endOfMonth(currentMonth);

        if (habit.type === 'weekly') {
            const goal = weeklyStats.length || 1;
            const count = weeklyStats.filter(week => isCompleted(habit.id, week.end)).length;
            const rawPercent = (count / goal) * 100;
            const percent = isNaN(rawPercent) ? 0 : Math.min(Math.round(rawPercent), 100);
            return { count, goal, percent };
        }

        const habitLogs = logs.filter(log => {
            return log.habit_id === habit.id &&
                log.completed &&
                log.date >= format(start, 'yyyy-MM-dd') &&
                log.date <= format(end, 'yyyy-MM-dd');
        });

        const count = habitLogs.length;
        const goal = habit.month_goal || 1;
        const rawPercent = (count / goal) * 100;
        const percent = isNaN(rawPercent) ? 0 : Math.min(Math.round(rawPercent), 100);
        return { count, goal, percent };
    };

    const monthlyAverageProgress = useMemo(() => {
        if (activeHabits.length === 0) return 0;
        const totalPercent = activeHabits.reduce((sum, habit) => sum + getHabitProgress(habit).percent, 0);
        const avg = Math.round(totalPercent / activeHabits.length);
        return isNaN(avg) ? 0 : avg;
    }, [activeHabits, logs, currentMonth, weeklyStats]);

    const chartData = useMemo(() => {
        return monthDays.map(day => {
            const logs = getHabitLogs(day);
            const count = logs.filter(l => l.completed && dailyHabits.some(h => h.id === l.habit_id)).length;
            return { day: format(day, 'yyyy-MM-dd'), completed: count, date: day };
        });
    }, [monthDays, getHabitLogs, dailyHabits]);

    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        activeHabits.forEach(h => {
            counts[h.category] = (counts[h.category] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [activeHabits]);

    const renderDailyHabitRow = (habit: Habit) => (
        <div key={habit.id} className="flex hover:bg-gray-50 transition-colors group">
            {/* Habit Name (Sticky) */}
            <div className="sticky left-0 z-10 w-[240px] bg-white group-hover:bg-gray-50 transition-colors p-3 border-r border-gray-100 flex items-center justify-between shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                <div className="flex-1 min-w-0 pr-2">
                    <div className="text-sm font-semibold text-gray-900 truncate">{habit.name}</div>
                </div>
                <button
                    onClick={() => handleEditHabit(habit)}
                    className="text-gray-300 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-200 transition-all opacity-0 group-hover:opacity-100"
                    title="Edit Habit"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>

            {/* Category */}
            <div className="w-[120px] p-2 flex items-center justify-center border-r border-gray-100">
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${CATEGORY_COLORS[habit.category]?.bg} ${CATEGORY_COLORS[habit.category]?.text} ${CATEGORY_COLORS[habit.category]?.border}`}>
                    {habit.category}
                </div>
            </div>

            {/* Goal (Dynamic Progress) */}
            <div className="w-[80px] flex items-center justify-center text-xs font-medium text-gray-500 border-r border-gray-100">
                {(() => {
                    const { count, goal } = getHabitProgress(habit);
                    return (
                        <span className={count >= goal ? "text-emerald-600 font-bold" : ""}>
                            {count}/{goal}
                        </span>
                    );
                })()}
            </div>

            {/* Checkboxes */}
            {monthDays.map(day => {
                const completed = isCompleted(habit.id, day);
                return (
                    <div key={day.toISOString()} className="w-[36px] border-r border-gray-100/50 flex items-center justify-center relative">
                        <button
                            onClick={() => handleToggle(habit.id, day)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center transition-all duration-200 border ${completed
                                ? 'bg-primary-500 border-primary-500 text-white shadow-sm scale-100'
                                : 'bg-white border-gray-200 text-transparent hover:border-primary-300 hover:shadow-sm scale-90'
                                }`}
                        >
                            <Check className="w-4 h-4" strokeWidth={3} />
                        </button>
                    </div>
                );
            })}
        </div>
    );

    const renderWeeklyHabitRow = (habit: Habit) => (
        <div key={habit.id} className="flex hover:bg-gray-50 transition-colors group">
            <div className="sticky left-0 z-10 w-[240px] bg-white group-hover:bg-gray-50 transition-colors p-3 border-r border-gray-100 flex items-center justify-between shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                <span className="text-sm font-semibold text-gray-900 truncate flex-1">{habit.name}</span>
                <button
                    onClick={() => handleEditHabit(habit)}
                    className="text-gray-300 hover:text-gray-600 p-1.5 rounded-md hover:bg-gray-200 transition-all opacity-0 group-hover:opacity-100"
                    title="Edit Habit"
                >
                    <Settings className="w-4 h-4" />
                </button>
            </div>

            <div className="w-[120px] p-2 flex items-center justify-center border-r border-gray-100">
                <div className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${CATEGORY_COLORS[habit.category]?.bg} ${CATEGORY_COLORS[habit.category]?.text} ${CATEGORY_COLORS[habit.category]?.border}`}>
                    {habit.category}
                </div>
            </div>

            <div className="w-[80px] flex items-center justify-center text-xs font-medium text-gray-500 border-r border-gray-100">
                {(() => {
                    const { count, goal } = getHabitProgress(habit);
                    return (
                        <span className={count >= goal ? "text-emerald-600 font-bold" : ""}>
                            {count}/{goal}
                        </span>
                    );
                })()}
            </div>

            <div className="flex-1 flex items-center px-4 gap-4 min-w-[1116px]">
                {weeklyStats.map((week, idx) => {
                    const isDone = isCompleted(habit.id, week.end);
                    return (
                        <div key={idx} className="flex-1 flex flex-col items-center">
                            <button
                                onClick={() => handleToggle(habit.id, week.end)}
                                className={`w-full py-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all shadow-sm ${isDone
                                    ? 'bg-gradient-to-br from-green-500 to-emerald-600 border-emerald-600 text-white shadow-emerald-200'
                                    : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {isDone ? <Check className="w-4 h-4" strokeWidth={3} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
                                <span className={`text-xs font-bold ${isDone ? 'text-white' : 'text-gray-500'}`}>Week {idx + 1}</span>
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 max-w-[1400px] mx-auto pb-20 pt-6 px-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row gap-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100 items-stretch">
                <div className="flex-1 flex flex-col justify-center border-r border-gray-100 pr-8">
                    <h1 className="text-5xl font-serif font-medium text-gray-900 mb-2 tracking-tight">
                        {format(currentMonth, 'MMMM')}
                    </h1>
                    <div className="text-sm font-bold tracking-[0.2em] text-gray-400 uppercase">
                        - Habit Tracker -
                    </div>
                </div>
                <div className="w-[200px] flex flex-col items-center justify-center border-r border-gray-100 pr-8">
                    <RadialProgress
                        percentage={monthlyAverageProgress}
                        label="Summary"
                        color="#DC2626"
                        size={140}
                    />
                </div>
                <div className="flex-1 flex justify-between gap-4 items-center pl-4">
                    {weeklyStats.map((week, idx) => (
                        <RadialProgress
                            key={idx}
                            percentage={week.total > 0 ? (week.completed / week.total) * 100 : 0}
                            label={`Week ${idx + 1}`}
                            size={100}
                            color={['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6'][idx] || '#6C47FF'}
                        />
                    ))}
                </div>
            </div>

            {/* Analytics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <DailyCompletionChart data={chartData} />
                <CategoryBreakdownChart data={categoryData} />
            </div>

            {/* Matrix */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden flex flex-col">
                <div className="overflow-x-auto custom-scrollbar">
                    <div className="min-w-max">
                        {/* Matrix Header */}
                        <div className="flex bg-blue-50/50 border-b border-gray-200">
                            <div className="sticky left-0 z-10 w-[240px] bg-blue-50/90 backdrop-blur-sm p-3 font-bold text-xs text-blue-900 uppercase tracking-wider border-r border-gray-200/50 flex items-center shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)]">
                                Habit
                            </div>
                            <div className="w-[120px] p-3 font-bold text-xs text-blue-900 uppercase tracking-wider border-r border-gray-200/50 flex items-center justify-center">
                                Category
                            </div>
                            <div className="w-[80px] p-3 font-bold text-xs text-blue-900 uppercase tracking-wider border-r border-gray-200/50 flex items-center justify-center">
                                Goal
                            </div>
                            {monthDays.map(day => (
                                <div key={day.toISOString()} className="w-[36px] flex flex-col items-center justify-center p-2 border-r border-gray-100">
                                    <span className="text-[10px] font-bold text-gray-400 mb-0.5">{format(day, 'EEEEE')}</span>
                                    <span className={`text-xs font-bold ${isSameDay(day, new Date()) ? 'text-primary-600' : 'text-gray-700'}`}>
                                        {format(day, 'd')}
                                    </span>
                                </div>
                            ))}
                        </div>

                        {/* Matrix Rows */}
                        <div className="divide-y divide-gray-100">
                            <div className="bg-gray-50/50 p-2 text-xs font-bold text-gray-400 uppercase tracking-wider sticky left-0 px-4">
                                Daily Habits
                            </div>
                            {dailyHabits.length > 0 ? (
                                dailyHabits.map(renderDailyHabitRow)
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-sm italic">
                                    No daily habits yet.
                                </div>
                            )}

                            <div className="bg-gray-50/50 p-2 text-xs font-bold text-gray-400 uppercase tracking-wider sticky left-0 px-4 border-t border-gray-200 mt-2">
                                Weekly Habits
                            </div>
                            {weeklyHabits.length > 0 ? (
                                weeklyHabits.map(renderWeeklyHabitRow)
                            ) : (
                                <div className="p-8 text-center text-gray-400 text-sm italic">
                                    No weekly habits yet.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation */}
            <div className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur shadow-2xl border border-gray-200 p-2 rounded-2xl flex items-center gap-4 z-40">
                <button
                    onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                </button>
                <div className="font-bold text-gray-900 min-w-[140px] text-center">
                    {format(currentMonth, 'MMMM yyyy')}
                </div>
                <button
                    onClick={() => setCurrentMonth(startOfMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1)))}
                    className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                </button>
                <div className="w-px h-6 bg-gray-200 mx-2" />
                <button
                    onClick={() => {
                        setEditingHabit(null);
                        setIsAddModalOpen(true);
                    }}
                    className="bg-primary-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg hover:bg-primary-700 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-4 h-4" />
                    New Habit
                </button>
            </div>

            <AddHabitModal
                isOpen={isAddModalOpen}
                initialHabit={editingHabit}
                onClose={handleCloseModal}
            />
        </div>
    );
}
