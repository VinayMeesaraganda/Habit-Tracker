/**
 * AddHabitModal - Premium Dark Modal for creating/editing habits
 */

import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext.tsx';
import { HABIT_CATEGORIES, HabitCategory, Habit } from '../types.ts';
import { X, Trash2, Archive, RotateCcw, Save, Loader } from 'lucide-react';

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialHabit?: Habit | null;
}

export function AddHabitModal({ isOpen, onClose, initialHabit }: AddHabitModalProps) {
    const { addHabit, updateHabit, deleteHabit, habits } = useHabits();

    const [name, setName] = useState('');
    const [category, setCategory] = useState<HabitCategory>(HABIT_CATEGORIES[0]);
    const [monthGoal, setMonthGoal] = useState(25);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Default to today YYYY-MM-DD
    const [type, setType] = useState<'daily' | 'weekly'>('daily');
    const [loading, setLoading] = useState(false);
    // Quantifiable habit state
    const [isQuantifiable, setIsQuantifiable] = useState(false);
    const [targetValue, setTargetValue] = useState(2000);
    const [unit, setUnit] = useState('ml');
    // Focus Timer state
    const [hasTimer, setHasTimer] = useState(false);
    const [timerMinutes, setTimerMinutes] = useState(25);
    const [autoComplete, setAutoComplete] = useState(true);


    useEffect(() => {
        if (isOpen) {

            if (initialHabit) {
                setName(initialHabit.name);
                setCategory(initialHabit.category as HabitCategory);
                setMonthGoal(initialHabit.month_goal);
                setType(initialHabit.type);
                // Quantifiable fields
                setIsQuantifiable(initialHabit.is_quantifiable || false);
                setTargetValue(initialHabit.target_value || 2000);
                setUnit(initialHabit.unit || 'ml');
                // Timer fields
                setHasTimer(!!initialHabit.timer_minutes);
                setTimerMinutes(initialHabit.timer_minutes || 25);
                setAutoComplete(initialHabit.auto_complete || false);
                if (initialHabit.created_at) {
                    setStartDate(initialHabit.created_at.split('T')[0]);
                }
            } else {
                setName('');
                setCategory(HABIT_CATEGORIES[0]);
                setMonthGoal(25);
                setType('daily');
                setStartDate(new Date().toISOString().split('T')[0]);
                // Reset quantifiable
                setIsQuantifiable(false);
                setTargetValue(2000);
                setUnit('ml');
                // Reset timer
                setHasTimer(false);
                setTimerMinutes(25);
                setAutoComplete(true);
            }
        }
    }, [isOpen, initialHabit, habits]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Parse date to ensure local noon (avoiding UTC midnight shift)
            const [y, m, d] = startDate.split('-').map(Number);
            const localDate = new Date(y, m - 1, d, 12, 0, 0);

            if (initialHabit) {
                await updateHabit(initialHabit.id, {
                    name,
                    category,
                    month_goal: monthGoal,
                    type,
                    updated_at: new Date().toISOString(),
                    created_at: localDate.toISOString(),
                    is_quantifiable: isQuantifiable,
                    target_value: isQuantifiable ? targetValue : undefined,
                    unit: isQuantifiable ? unit : undefined,
                    timer_minutes: hasTimer ? timerMinutes : undefined,
                    auto_complete: hasTimer ? autoComplete : undefined,
                });
            } else {
                await addHabit({
                    name,
                    category,
                    month_goal: monthGoal,
                    type,
                    created_at: localDate.toISOString(),
                    is_quantifiable: isQuantifiable,
                    target_value: isQuantifiable ? targetValue : undefined,
                    unit: isQuantifiable ? unit : undefined,
                    timer_minutes: hasTimer ? timerMinutes : undefined,
                    auto_complete: hasTimer ? autoComplete : undefined,
                });
            }
            onClose();
        } catch (error) {
            console.error('Error saving habit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!initialHabit) return;
        setLoading(true);
        try {
            await deleteHabit(initialHabit.id);
            onClose();
        } catch (error) {
            console.error('Error deleting habit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleArchive = async () => {
        if (!initialHabit) return;
        setLoading(true);
        try {
            // Set archived_at to TODAY's date (not end of month)
            // This ensures the habit is hidden from TOMORROW onwards
            await updateHabit(initialHabit.id, { archived_at: new Date().toISOString() });
            onClose();
        } catch (error) {
            console.error('Error discontinuing habit:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleResume = async () => {
        if (!initialHabit) return;
        setLoading(true);
        try {
            await updateHabit(initialHabit.id, { archived_at: null });
            onClose();
        } catch (error) {
            console.error('Error resuming habit:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div
                className="relative w-full max-w-lg rounded-2xl shadow-2xl animate-scale-in flex flex-col"
                style={{
                    background: '#FFFFFF',
                    maxHeight: '85vh',
                }}
            >
                {/* Header */}
                <div
                    className="flex-shrink-0 flex items-center justify-between px-6 py-5 rounded-t-2xl"
                    style={{
                        background: 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {initialHabit ? 'Edit Habit' : 'New Habit'}
                        </h2>
                        <p className="text-sm text-white/90 font-medium">
                            {initialHabit ? 'Update your tracking details' : 'Commit to a new goal'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="overflow-y-auto">
                    <form onSubmit={handleSubmit} className="p-5 space-y-4">
                        {/* Name Input */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E9E9E' }}>
                                Habit Name
                            </label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl text-base font-medium transition-all focus:outline-none focus:ring-2"
                                style={{
                                    background: '#F5F5F5',
                                    border: '1px solid #E0E0E0',
                                    color: '#1F1F1F',
                                }}
                                placeholder="e.g. detailed reading, morning jog..."
                                required
                                autoFocus
                            />
                        </div>

                        {/* Start Date */}
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E9E9E' }}>
                                Start Date
                            </label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-xl font-medium transition-all focus:outline-none focus:ring-2"
                                style={{
                                    background: '#F5F5F5',
                                    border: '1px solid #E0E0E0',
                                    color: '#1F1F1F',
                                }}
                                required
                            />
                        </div>

                        {/* Monthly Goal and Frequency Row */}
                        <div className="grid grid-cols-2 gap-3">
                            {/* Monthly Goal */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E9E9E' }}>
                                    Monthly Goal
                                </label>
                                <div className="relative">
                                    <input
                                        type="number"
                                        value={monthGoal}
                                        onChange={(e) => setMonthGoal(parseInt(e.target.value))}
                                        className="w-full px-3 py-2.5 rounded-xl font-medium transition-all focus:outline-none focus:ring-2"
                                        style={{
                                            background: '#F5F5F5',
                                            border: '1px solid #E0E0E0',
                                            color: '#1F1F1F',
                                        }}
                                        min="1"
                                        max="31"
                                        required
                                    />
                                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-medium pointer-events-none" style={{ color: '#6B6B6B' }}>
                                        days
                                    </span>
                                </div>
                            </div>

                            {/* Frequency */}
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E9E9E' }}>
                                    Frequency
                                </label>
                                <div className="flex p-0.5 rounded-xl" style={{ background: '#F5F5F5', border: '1px solid #E0E0E0' }}>
                                    <button
                                        type="button"
                                        onClick={() => setType('daily')}
                                        className="flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-bold transition-all"
                                        style={{
                                            background: type === 'daily' ? '#FF7A6B' : 'transparent',
                                            color: type === 'daily' ? '#FFFFFF' : '#6B6B6B',
                                        }}
                                    >
                                        Daily
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setType('weekly')}
                                        className="flex-1 flex items-center justify-center py-2 rounded-lg text-sm font-bold transition-all"
                                        style={{
                                            background: type === 'weekly' ? '#FF7A6B' : 'transparent',
                                            color: type === 'weekly' ? '#FFFFFF' : '#6B6B6B',
                                        }}
                                    >
                                        Weekly
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quantifiable Habit Toggle */}
                        <div className="space-y-3">
                            <div
                                className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                                style={{ background: '#F5F5F5', border: '1px solid #E0E0E0' }}
                                onClick={() => setIsQuantifiable(!isQuantifiable)}
                            >
                                <div>
                                    <span className="font-semibold text-gray-800">Track Quantity</span>
                                    <p className="text-xs text-gray-500">e.g., water, pages, minutes</p>
                                </div>
                                <div
                                    className={`w-12 h-7 rounded-full transition-all flex items-center px-1 ${isQuantifiable ? 'bg-orange-500' : 'bg-gray-300'}`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${isQuantifiable ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </div>
                            </div>

                            {/* Target Value and Unit (shown when quantifiable) */}
                            {isQuantifiable && (
                                <div className="grid grid-cols-2 gap-3 animate-fadeIn">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E9E9E' }}>
                                            Daily Target
                                        </label>
                                        <input
                                            type="number"
                                            value={targetValue}
                                            onChange={(e) => setTargetValue(parseInt(e.target.value) || 0)}
                                            className="w-full px-3 py-2.5 rounded-xl font-medium transition-all focus:outline-none focus:ring-2"
                                            style={{
                                                background: '#FFFFFF',
                                                border: '1px solid #E0E0E0',
                                                color: '#1F1F1F',
                                            }}
                                            min="1"
                                            required={isQuantifiable}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E9E9E' }}>
                                            Unit
                                        </label>
                                        <select
                                            value={unit}
                                            onChange={(e) => setUnit(e.target.value)}
                                            className="w-full px-3 py-2.5 rounded-xl font-medium appearance-none transition-all focus:outline-none focus:ring-2"
                                            style={{
                                                background: '#FFFFFF',
                                                border: '1px solid #E0E0E0',
                                                color: '#1F1F1F',
                                            }}
                                        >
                                            <option value="ml">ml</option>
                                            <option value="L">L</option>
                                            <option value="glasses">glasses</option>
                                            <option value="oz">oz</option>
                                            <option value="pages">pages</option>
                                            <option value="minutes">minutes</option>
                                            <option value="hours">hours</option>
                                            <option value="reps">reps</option>
                                            <option value="steps">steps</option>
                                            <option value="calories">calories</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Focus Timer Toggle */}
                        <div className="space-y-3">
                            <div
                                className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all hover:bg-gray-50"
                                style={{ background: '#F5F5F5', border: '1px solid #E0E0E0' }}
                                onClick={() => setHasTimer(!hasTimer)}
                            >
                                <div>
                                    <span className="font-semibold text-gray-800">Focus Timer</span>
                                    <p className="text-xs text-gray-500">Pomodoro-style focus sessions</p>
                                </div>
                                <div
                                    className={`w-12 h-7 rounded-full transition-all flex items-center px-1 ${hasTimer ? 'bg-orange-500' : 'bg-gray-300'}`}
                                >
                                    <div
                                        className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${hasTimer ? 'translate-x-5' : 'translate-x-0'}`}
                                    />
                                </div>
                            </div>

                            {/* Timer duration and auto-complete (shown when timer enabled) */}
                            {hasTimer && (
                                <div className="space-y-3 animate-fadeIn">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold uppercase tracking-wider" style={{ color: '#9E9E9E' }}>
                                            Timer Duration
                                        </label>
                                        <div className="flex gap-2">
                                            {[15, 25, 45, 60].map((mins) => (
                                                <button
                                                    key={mins}
                                                    type="button"
                                                    onClick={() => setTimerMinutes(mins)}
                                                    className="flex-1 py-2 rounded-lg font-semibold text-sm transition-all"
                                                    style={{
                                                        background: timerMinutes === mins ? '#FF7A6B' : '#F5F5F5',
                                                        color: timerMinutes === mins ? '#FFF' : '#6B6B6B',
                                                        border: '1px solid #E0E0E0',
                                                    }}
                                                >
                                                    {mins}m
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Auto-complete toggle */}
                                    <div
                                        className="flex items-center justify-between p-3 rounded-xl cursor-pointer transition-all"
                                        style={{ background: '#FFFFFF', border: '1px solid #E0E0E0' }}
                                        onClick={() => setAutoComplete(!autoComplete)}
                                    >
                                        <span className="text-sm font-medium text-gray-700">Auto-complete when timer ends</span>
                                        <div
                                            className={`w-10 h-6 rounded-full transition-all flex items-center px-0.5 ${autoComplete ? 'bg-green-500' : 'bg-gray-300'}`}
                                        >
                                            <div
                                                className={`w-5 h-5 rounded-full bg-white shadow-sm transition-transform ${autoComplete ? 'translate-x-4' : 'translate-x-0'}`}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="flex gap-3 pt-2">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95"
                                style={{
                                    background: '#F5F5F5',
                                    color: '#6B6B6B',
                                }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 py-2.5 rounded-xl font-semibold transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                style={{
                                    background: 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)',
                                    color: '#FFFFFF',
                                }}
                            >
                                {loading ? (
                                    <>
                                        <Loader className="w-4 h-4 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        {initialHabit ? 'Update' : 'Create'}
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Danger Zone (Only for existing habits) */}
                        {initialHabit && (
                            <div className="pt-6 mt-6 border-t border-gray-100">
                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">
                                    Manage Habit
                                </h4>

                                <div className="space-y-3">
                                    {/* Archive Option */}
                                    {!initialHabit.archived_at ? (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (window.confirm("Discontinue this habit? It will be moved to archives and hidden from your daily view.")) {
                                                    handleArchive();
                                                }
                                            }}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-orange-50 transition-colors group"
                                            style={{ border: '1px solid #FFE0B2' }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-500">
                                                    <Archive className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm font-semibold text-gray-700">Discontinue Habit</span>
                                                    <span className="block text-xs text-gray-500">Stop tracking but keep history</span>
                                                </div>
                                            </div>
                                        </button>
                                    ) : (
                                        <button
                                            type="button"
                                            onClick={handleResume}
                                            className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-green-50 transition-colors group"
                                            style={{ border: '1px solid #C8E6C9' }}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-500">
                                                    <RotateCcw className="w-4 h-4" />
                                                </div>
                                                <div className="text-left">
                                                    <span className="block text-sm font-semibold text-gray-700">Resume Habit</span>
                                                    <span className="block text-xs text-gray-500">Add back to active list</span>
                                                </div>
                                            </div>
                                        </button>
                                    )}

                                    {/* Delete Option */}
                                    <button
                                        type="button"
                                        onClick={() => {
                                            if (window.confirm("Delete this habit permanently? This action cannot be undone and all history will be lost.")) {
                                                handleDelete();
                                            }
                                        }}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-red-50 transition-colors group"
                                        style={{ border: '1px solid #FFCDD2' }}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-500">
                                                <Trash2 className="w-4 h-4" />
                                            </div>
                                            <div className="text-left">
                                                <span className="block text-sm font-semibold text-gray-700 group-hover:text-red-600">Delete Habit</span>
                                                <span className="block text-xs text-gray-500 group-hover:text-red-400">Permanently remove all data</span>
                                            </div>
                                        </div>
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
