/**
 * AddHabitModal - Premium Dark Modal for creating/editing habits
 */

import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext.tsx';
import { HABIT_CATEGORIES, HabitCategory, Habit } from '../types.ts';
import { X, Trash2, Archive, RotateCcw } from 'lucide-react';
import { endOfMonth } from 'date-fns';

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialHabit?: Habit | null;
}

export function AddHabitModal({ isOpen, onClose, initialHabit }: AddHabitModalProps) {
    const { addHabit, updateHabit, deleteHabit } = useHabits();

    const [name, setName] = useState('');
    const [category, setCategory] = useState<HabitCategory>(HABIT_CATEGORIES[0]);
    const [monthGoal, setMonthGoal] = useState(25);
    const [type, setType] = useState<'daily' | 'weekly'>('daily');
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setShowDeleteConfirm(false);
            if (initialHabit) {
                setName(initialHabit.name);
                setCategory(initialHabit.category as HabitCategory);
                setMonthGoal(initialHabit.month_goal);
                setType(initialHabit.type);
            } else {
                setName('');
                setCategory(HABIT_CATEGORIES[0]);
                setMonthGoal(25);
                setType('daily');
            }
        }
    }, [isOpen, initialHabit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (initialHabit) {
                await updateHabit(initialHabit.id, { name, category, month_goal: monthGoal, type });
            } else {
                await addHabit({ name, category, month_goal: monthGoal, type });
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
            await updateHabit(initialHabit.id, { archived_at: endOfMonth(new Date()).toISOString() });
            onClose();
        } catch (error) {
            console.error('Error archiving habit:', error);
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
                className="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            {/* Modal Card */}
            <div className="relative w-full max-w-lg card-glass shadow-2xl animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {initialHabit ? 'Edit Habit' : 'New Habit'}
                        </h2>
                        <p className="text-sm text-gray-400 font-medium">
                            {initialHabit ? 'Update your tracking details' : 'Commit to a new goal'}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-gray-500 hover:text-white p-2 rounded-full hover:bg-white/10 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Name Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Habit Name
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-dark text-lg font-medium"
                            placeholder="e.g. detailed reading, morning jog..."
                            required
                            autoFocus
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        {/* Category Select */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Category
                            </label>
                            <div className="relative">
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value as HabitCategory)}
                                    className="input-dark appearance-none font-medium"
                                >
                                    {HABIT_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>{cat}</option>
                                    ))}
                                </select>
                                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                                </div>
                            </div>
                        </div>

                        {/* Goal Input */}
                        <div className="space-y-2">
                            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                                Monthly Goal
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={monthGoal}
                                    onChange={(e) => setMonthGoal(parseInt(e.target.value))}
                                    className="input-dark font-medium"
                                    min="1"
                                    max="31"
                                    required
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-medium pointer-events-none">
                                    days
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Frequency Segmented Control */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                            Frequency
                        </label>
                        <div className="flex p-1 bg-white/5 rounded-xl border border-white/10">
                            <button
                                type="button"
                                onClick={() => setType('daily')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'daily' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Daily
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('weekly')}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-bold transition-all ${type === 'weekly' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                            >
                                Weekly
                            </button>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="pt-4 flex items-center justify-between gap-3">
                        {initialHabit ? (
                            <div className="flex items-center gap-2">
                                {!showDeleteConfirm ? (
                                    <>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            className="px-4 py-2.5 rounded-xl text-red-400 font-bold hover:bg-red-500/10 transition-all flex items-center gap-2"
                                            title="Delete permanently"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                            <span className="hidden sm:inline">Delete</span>
                                        </button>

                                        {initialHabit.archived_at ? (
                                            <button
                                                type="button"
                                                onClick={handleResume}
                                                className="px-4 py-2.5 rounded-xl text-green-400 font-bold hover:bg-green-500/10 transition-all flex items-center gap-2"
                                                title="Resume tracking this habit"
                                            >
                                                <RotateCcw className="w-4 h-4" />
                                                <span className="hidden sm:inline">Resume Tracking</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleArchive}
                                                className="px-4 py-2.5 rounded-xl text-amber-400 font-bold hover:bg-amber-500/10 transition-all flex items-center gap-2"
                                                title="Stop tracking after this month"
                                            >
                                                <Archive className="w-4 h-4" />
                                                <span className="hidden sm:inline">Stop Tracking</span>
                                            </button>
                                        )}
                                    </>
                                ) : (
                                    <div className="flex items-center gap-2 animate-scale-in">
                                        <span className="text-xs font-bold text-red-400 mr-1">Are you sure?</span>
                                        <button
                                            type="button"
                                            onClick={handleDelete}
                                            className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors"
                                        >
                                            Yes, delete
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowDeleteConfirm(false)}
                                            className="px-3 py-1.5 rounded-lg bg-white/10 text-gray-300 text-xs font-bold hover:bg-white/20 transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div />
                        )}

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-6 py-2.5 rounded-xl text-gray-400 font-bold hover:bg-white/5 hover:text-white transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-gradient-to-r from-primary-500 to-purple-600 text-white px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary-500/20 hover:shadow-primary-500/30 active:scale-95 transition-all text-sm"
                            >
                                {loading ? 'Saving...' : (initialHabit ? 'Save Changes' : 'Create Habit')}
                            </button>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
