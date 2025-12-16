/**
 * HabitRow - Individual habit row with checkboxes for each day
 */

import { useMemo } from 'react';
import { useHabits } from '../context/HabitContext';
import { Habit } from '../types';
import { format } from 'date-fns';
import { getHabitMetrics } from '../utils/analytics';
import { Trash2 } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/colors';

interface HabitRowProps {
    habit: Habit;
    monthDays: Date[];
}

export function HabitRow({ habit, monthDays }: HabitRowProps) {
    const { logs, toggleLog, deleteHabit, currentMonth } = useHabits();

    const metrics = useMemo(() =>
        getHabitMetrics(habit, logs, currentMonth),
        [habit, logs, currentMonth]
    );

    const handleToggle = async (date: Date) => {
        try {
            await toggleLog(habit.id, format(date, 'yyyy-MM-dd'));
        } catch (error) {
            console.error('Error toggling log:', error);
        }
    };

    const isCompleted = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const log = logs.find(l => l.habit_id === habit.id && l.date === dateStr);
        return log?.completed || false;
    };

    const handleDelete = async () => {
        if (confirm(`Delete habit "${habit.name}"?`)) {
            try {
                await deleteHabit(habit.id);
            } catch (error) {
                console.error('Error deleting habit:', error);
            }
        }
    };

    return (
        <>
            {/* Desktop Table Row */}
            <div className="hidden md:grid grid-cols-[240px_160px_100px_repeat(31,minmax(40px,1fr))_120px] gap-2 py-4 border-b border-gray-100 hover:bg-gray-50/80 transition-all items-center group">
                {/* Habit Name */}
                <div className="flex items-center gap-3 pl-4">
                    <span className="text-gray-900 font-semibold truncate text-[15px] tracking-tight">{habit.name}</span>
                    <button
                        onClick={handleDelete}
                        className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 hover:text-red-500 p-1.5 rounded-full hover:bg-red-50"
                        aria-label="Delete habit"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                    </button>
                </div>

                {/* Category Pill */}
                <div className="flex items-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${CATEGORY_COLORS[habit.category]?.bg || 'bg-gray-100'} ${CATEGORY_COLORS[habit.category]?.text || 'text-gray-700'} ${CATEGORY_COLORS[habit.category]?.border || 'border-gray-200'}`}>
                        {habit.category}
                    </span>
                </div>

                {/* Month Goal */}
                <div className="text-sm text-gray-500 font-medium text-center bg-gray-50 mx-4 py-1 rounded-md border border-gray-100/50">
                    {habit.month_goal} <span className="text-[10px] uppercase tracking-wider text-gray-400 ml-0.5">/ mo</span>
                </div>

                {/* Day Checkboxes */}
                {monthDays.map((day, i) => (
                    <div key={i} className="flex justify-center">
                        <input
                            type="checkbox"
                            checked={isCompleted(day)}
                            onChange={() => handleToggle(day)}
                            className="w-5 h-5 rounded-[5px] border-2 border-gray-200 bg-white checked:bg-primary-600 checked:border-primary-600 focus:ring-2 focus:ring-primary-100 cursor-pointer transition-all duration-200 hover:border-gray-300 checked:hover:bg-primary-700"
                            aria-label={`${habit.name} on ${format(day, 'MMM d')}`}
                        />
                    </div>
                ))}

                {/* Progress */}
                <div className="pr-4 flex flex-col items-end gap-1">
                    <div className="flex items-baseline gap-1.5">
                        <span className="text-gray-900 font-bold text-sm">{metrics.percentage * 100}%</span>
                        <span className="text-xs text-gray-400 font-medium">done</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-1.5 overflow-hidden">
                        <div
                            className="bg-primary-500 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.min(metrics.percentage * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Mobile Card View - Refined */}
            <div className="md:hidden card p-5 mb-4 border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)]">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 tracking-tight">{habit.name}</h3>
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${CATEGORY_COLORS[habit.category]?.bg || 'bg-gray-100'} ${CATEGORY_COLORS[habit.category]?.text || 'text-gray-700'} ${CATEGORY_COLORS[habit.category]?.border || 'border-gray-200'}`}>
                                {habit.category}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <div className="flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-md border border-gray-100">
                                <span className="font-semibold text-gray-700">{habit.month_goal}</span>
                                <span className="text-xs">target</span>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={handleDelete}
                        className="text-gray-400 hover:text-red-500 p-2 -mr-2 -mt-2 transition-colors"
                        aria-label="Delete habit"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-5 bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <div className="flex justify-between text-sm mb-2">
                        <span className="text-gray-600 font-medium flex items-center gap-1.5">
                            Progress
                            <span className="bg-white px-1.5 py-0.5 rounded border border-gray-200 text-xs text-gray-500 font-normal">{metrics.completedText}</span>
                        </span>
                        <span className="text-primary-600 font-bold">{Math.round(metrics.percentage * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div
                            className="bg-primary-500 h-2.5 rounded-full transition-all shadow-[0_0_10px_rgba(108,71,255,0.3)]"
                            style={{ width: `${Math.min(metrics.percentage * 100, 100)}%` }}
                        />
                    </div>
                </div>

                {/* Days Grid - Scrollable */}
                <div className="overflow-x-auto -mx-5 px-5 pb-2 custom-scrollbar">
                    <div className="flex gap-3 min-w-max">
                        {monthDays.map((day, i) => {
                            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                            return (
                                <div key={i} className={`flex flex-col items-center gap-2 p-2 rounded-xl border ${isToday ? 'border-primary-200 bg-primary-50/50' : 'border-transparent'}`}>
                                    <div className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">{format(day, 'EEE')}</div>
                                    <div className={`text-sm font-bold mb-1 ${isToday ? 'text-primary-700' : 'text-gray-700'}`}>{format(day, 'd')}</div>
                                    <input
                                        type="checkbox"
                                        checked={isCompleted(day)}
                                        onChange={() => handleToggle(day)}
                                        className="w-8 h-8 rounded-lg border-2 border-gray-200 bg-white checked:bg-primary-600 checked:border-primary-600 focus:ring-0 cursor-pointer transition-all hover:scale-105 hover:shadow-sm"
                                        aria-label={`${habit.name} on ${format(day, 'MMM d')}`}
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </>
    );
}
