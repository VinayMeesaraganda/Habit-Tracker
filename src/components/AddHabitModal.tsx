/**
 * AddHabitModal - Premium Dark Modal for creating/editing habits
 * Redesigned with Segmented Tabs for cleaner UI
 */

import React, { useState, useEffect } from 'react';
import { useHabits } from '../context/HabitContext.tsx';
import { HABIT_CATEGORIES, HabitCategory, Habit, HabitFrequency, FrequencyType } from '../types.ts';
import { X, Trash2, Archive, RotateCcw, Save, Loader, Calendar, Target, Clock } from 'lucide-react';
import { SegmentedControl } from './ui/SegmentedControl';

interface AddHabitModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialHabit?: Habit | null;
}

const STANDARD_UNITS = ['ml', 'oz', 'g', 'lb', 'km', 'steps', 'calories', 'min', 'hr', 'pages'];
type TabType = 'Schedule' | 'Details' | 'Reminders';

export function AddHabitModal({ isOpen, onClose, initialHabit }: AddHabitModalProps) {
    const { addHabit, updateHabit, deleteHabit } = useHabits();

    // Tab State
    const [activeTab, setActiveTab] = useState<TabType>('Schedule');

    const [name, setName] = useState('');
    const [category, setCategory] = useState<HabitCategory>(HABIT_CATEGORIES[0]);
    const [monthGoal, setMonthGoal] = useState(25);
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]); // Default to today YYYY-MM-DD
    const [type, setType] = useState<'daily' | 'weekly'>('daily');

    // Frequency settings
    const [frequencyType, setFrequencyType] = useState<FrequencyType>('daily');
    const [daysPerWeek, setDaysPerWeek] = useState(3);
    const [customDays, setCustomDays] = useState<number[]>([1, 2, 3, 4, 5]); // Default Mon-Fri
    const [loading, setLoading] = useState(false);

    // Quantifiable habit state
    const [isQuantifiable, setIsQuantifiable] = useState(false);
    const [targetValue, setTargetValue] = useState(2000);
    const [unit, setUnit] = useState('ml');
    const [isCustomUnit, setIsCustomUnit] = useState(false);

    // Focus Timer state
    const [hasTimer, setHasTimer] = useState(false);
    const [timerMinutes, setTimerMinutes] = useState(25);
    const [autoComplete, setAutoComplete] = useState(true);

    // Smart Reminder state
    const [hasReminder, setHasReminder] = useState(false);
    const [reminderTime, setReminderTime] = useState('09:00'); // Default to 9 AM

    useEffect(() => {
        if (isOpen) {
            if (initialHabit) {
                // ... existing hydration ...
                setName(initialHabit.name);
                setCategory(initialHabit.category as HabitCategory);
                setMonthGoal(initialHabit.month_goal);
                setType(initialHabit.type);
                // Frequency
                if (initialHabit.frequency) {
                    setFrequencyType(initialHabit.frequency.type);
                    setDaysPerWeek(initialHabit.frequency.days_per_week || 3);
                    setCustomDays(initialHabit.frequency.custom_days || [1, 2, 3, 4, 5]);
                } else {
                    setFrequencyType('daily');
                }
                // Quantifiable fields
                setIsQuantifiable(initialHabit.is_quantifiable || false);
                setTargetValue(initialHabit.target_value || 2000);
                const u = initialHabit.unit || 'ml';
                setUnit(u);
                setIsCustomUnit(!STANDARD_UNITS.includes(u));
                // Timer fields
                setHasTimer(!!initialHabit.timer_minutes);
                setTimerMinutes(initialHabit.timer_minutes || 25);
                setAutoComplete(initialHabit.auto_complete || false);

                // Reminder fields
                if (initialHabit.reminder_time) {
                    setHasReminder(true);
                    setReminderTime(initialHabit.reminder_time);
                } else {
                    setHasReminder(false);
                    setReminderTime('09:00');
                }

                if (initialHabit.created_at) {
                    setStartDate(initialHabit.created_at.split('T')[0]);
                }

                // Smart tab selection based on habit data
                if (initialHabit.reminder_time) {
                    setActiveTab('Reminders');
                } else if (initialHabit.is_quantifiable || initialHabit.timer_minutes) {
                    setActiveTab('Details');
                } else {
                    setActiveTab('Schedule');
                }
            } else {
                setName('');
                setCategory(HABIT_CATEGORIES[0]);
                setMonthGoal(25);
                setType('daily');
                setFrequencyType('daily');
                setDaysPerWeek(3);
                setCustomDays([1, 2, 3, 4, 5]);
                setStartDate(new Date().toISOString().split('T')[0]);
                // Reset quantifiable
                setIsQuantifiable(false);
                setTargetValue(2000);
                setUnit('ml');
                setIsCustomUnit(false);
                // Reset timer
                setHasTimer(false);
                setTimerMinutes(25);
                setAutoComplete(true);
                // Reset reminder
                setHasReminder(false);
                setReminderTime('09:00');

                setActiveTab('Schedule');
            }
        }
    }, [isOpen, initialHabit]);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Parse date to ensure local noon (avoiding UTC midnight shift)
            const [y, m, d] = startDate.split('-').map(Number);
            const localDate = new Date(y, m - 1, d, 12, 0, 0);

            if (initialHabit) {
                // Build frequency object
                const frequency: HabitFrequency = { type: frequencyType };
                if (frequencyType === 'weekly') frequency.days_per_week = daysPerWeek;
                if (frequencyType === 'custom') frequency.custom_days = customDays;

                await updateHabit(initialHabit.id, {
                    name,
                    category,
                    month_goal: monthGoal,
                    type,
                    frequency,
                    updated_at: new Date().toISOString(),
                    created_at: localDate.toISOString(),
                    is_quantifiable: isQuantifiable,
                    target_value: isQuantifiable ? targetValue : undefined,
                    unit: isQuantifiable ? unit : undefined,
                    timer_minutes: hasTimer ? timerMinutes : undefined,
                    auto_complete: hasTimer ? autoComplete : undefined,
                    reminder_time: hasReminder ? reminderTime : null,
                });
            } else {
                // Build frequency object
                const frequency: HabitFrequency = { type: frequencyType };
                if (frequencyType === 'weekly') frequency.days_per_week = daysPerWeek;
                if (frequencyType === 'custom') frequency.custom_days = customDays;

                await addHabit({
                    name,
                    category,
                    month_goal: monthGoal,
                    type,
                    frequency,
                    created_at: localDate.toISOString(),
                    is_quantifiable: isQuantifiable,
                    target_value: isQuantifiable ? targetValue : undefined,
                    unit: isQuantifiable ? unit : undefined,
                    timer_minutes: hasTimer ? timerMinutes : undefined,
                    auto_complete: hasTimer ? autoComplete : undefined,
                    reminder_time: hasReminder ? reminderTime : null,
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
                    maxHeight: '90vh',
                }}
            >
                {/* Header */}
                <div
                    className="flex-shrink-0 flex items-center justify-between px-6 py-4 rounded-t-2xl"
                    style={{
                        background: 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)',
                        borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    }}
                >
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                            {initialHabit ? 'Edit Habit' : 'New Habit'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-white/80 hover:text-white p-2 rounded-full hover:bg-white/20 transition-all"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="px-6 py-3 border-b border-gray-100 bg-white">
                    <SegmentedControl
                        options={['Schedule', 'Details', 'Reminders']}
                        selected={activeTab}
                        onChange={(val) => setActiveTab(val as TabType)}
                    />
                </div>

                <div className="overflow-y-auto flex-1">
                    <form onSubmit={handleSubmit} className="p-5 space-y-6">

                        {/* --- TAB 1: SCHEDULE --- */}
                        {activeTab === 'Schedule' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Name Input */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Habit Name
                                    </label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="w-full px-4 py-3 rounded-xl text-lg font-medium transition-all focus:outline-none focus:ring-2 focus:ring-orange-100"
                                        style={{
                                            background: '#F9FAFB',
                                            border: '1px solid #E5E7EB',
                                            color: '#1F2937',
                                        }}
                                        placeholder="e.g. Morning Jog"
                                        required
                                        autoFocus
                                    />
                                </div>

                                {/* Category Selector */}
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500">
                                        Category
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={category}
                                            onChange={(e) => setCategory(e.target.value as HabitCategory)}
                                            className="w-full pl-4 pr-10 py-3 rounded-xl appearance-none bg-gray-50 border border-gray-200 text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-orange-100 transition-shadow"
                                        >
                                            {HABIT_CATEGORIES.map((cat) => (
                                                <option key={cat} value={cat}>
                                                    {cat}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Frequency Selector */}
                                <div className="space-y-3">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 flex items-center gap-2">
                                        <Calendar className="w-3 h-3" />
                                        Frequency
                                    </label>

                                    <div className="grid grid-cols-3 gap-2">
                                        {[
                                            { value: 'daily' as FrequencyType, label: 'Every Day' },
                                            { value: 'weekdays' as FrequencyType, label: 'Weekdays' },
                                            { value: 'custom' as FrequencyType, label: 'Custom' },
                                        ].map((option) => (
                                            <button
                                                key={option.value}
                                                type="button"
                                                onClick={() => setFrequencyType(option.value)}
                                                className={`py-3 px-2 rounded-xl text-sm font-semibold transition-all border ${frequencyType === option.value
                                                    ? 'bg-orange-50 border-orange-200 text-orange-600'
                                                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>

                                    {/* Weekly/Custom Logic */}
                                    {frequencyType === 'weekly' && (
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <span className="text-xs font-semibold text-gray-500 mb-2 block">Days per week</span>
                                            <div className="flex gap-2">
                                                {[1, 2, 3, 4, 5, 6].map((num) => (
                                                    <button
                                                        key={num}
                                                        type="button"
                                                        onClick={() => setDaysPerWeek(num)}
                                                        className={`flex-1 py-2 rounded-lg text-sm font-bold transition-all border ${daysPerWeek === num
                                                            ? 'bg-white border-orange-300 text-orange-600 shadow-sm'
                                                            : 'bg-transparent border-transparent text-gray-400 hover:text-gray-600'
                                                            }`}
                                                    >
                                                        {num}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {frequencyType === 'custom' && (
                                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                                            <span className="text-xs font-semibold text-gray-500 mb-2 block">Active Days</span>
                                            <div className="flex justify-between gap-1">
                                                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                                                    <button
                                                        key={index}
                                                        type="button"
                                                        onClick={() => {
                                                            if (customDays.includes(index)) {
                                                                setCustomDays(customDays.filter(d => d !== index));
                                                            } else {
                                                                setCustomDays([...customDays, index].sort());
                                                            }
                                                        }}
                                                        className={`w-9 h-9 rounded-full text-xs font-bold transition-all border ${customDays.includes(index)
                                                            ? 'bg-orange-500 border-orange-600 text-white shadow-md'
                                                            : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        {day}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- TAB 2: DETAILS --- */}
                        {activeTab === 'Details' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Quantifiable Toggle */}
                                <div className="space-y-3">
                                    <div
                                        onClick={() => setIsQuantifiable(!isQuantifiable)}
                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${isQuantifiable ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${isQuantifiable ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <Target className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className={`font-semibold block ${isQuantifiable ? 'text-gray-900' : 'text-gray-600'}`}>Track Quantity</span>
                                                <span className="text-xs text-gray-400">e.g. 2000ml water, 10 pages</span>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full transition-colors relative ${isQuantifiable ? 'bg-orange-500' : 'bg-gray-200'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${isQuantifiable ? 'left-7' : 'left-1'}`} />
                                        </div>
                                    </div>

                                    {isQuantifiable && (
                                        <div className="grid grid-cols-2 gap-3 pl-2">
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">Target</label>
                                                <input
                                                    type="number"
                                                    value={targetValue}
                                                    onChange={(e) => setTargetValue(parseInt(e.target.value) || 0)}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                                                />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-xs font-medium text-gray-500">Unit</label>
                                                {!isCustomUnit ? (
                                                    <select
                                                        value={STANDARD_UNITS.includes(unit) ? unit : 'custom'}
                                                        onChange={(e) => {
                                                            const val = e.target.value;
                                                            if (val === 'custom') {
                                                                setIsCustomUnit(true);
                                                                setUnit('');
                                                            } else {
                                                                setUnit(val);
                                                            }
                                                        }}
                                                        className="w-full px-3 py-2 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                                                    >
                                                        {STANDARD_UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                                        <option value="custom">Custom...</option>
                                                    </select>
                                                ) : (
                                                    <div className="relative">
                                                        <input
                                                            autoFocus
                                                            type="text"
                                                            value={unit}
                                                            onChange={(e) => setUnit(e.target.value)}
                                                            className="w-full px-3 py-2 pr-8 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-100"
                                                            placeholder="Unit"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => { setIsCustomUnit(false); setUnit('ml'); }}
                                                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Timer Toggle */}
                                <div className="space-y-3">
                                    <div
                                        onClick={() => setHasTimer(!hasTimer)}
                                        className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${hasTimer ? 'bg-orange-50 border-orange-100' : 'bg-white border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-full ${hasTimer ? 'bg-orange-100 text-orange-600' : 'bg-gray-100 text-gray-400'}`}>
                                                <Clock className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <span className={`font-semibold block ${hasTimer ? 'text-gray-900' : 'text-gray-600'}`}>Focus Timer</span>
                                                <span className="text-xs text-gray-400">Pomodoro sessions</span>
                                            </div>
                                        </div>
                                        <div className={`w-12 h-6 rounded-full transition-colors relative ${hasTimer ? 'bg-orange-500' : 'bg-gray-200'}`}>
                                            <div className={`w-4 h-4 rounded-full bg-white absolute top-1 transition-transform ${hasTimer ? 'left-7' : 'left-1'}`} />
                                        </div>
                                    </div>

                                    {hasTimer && (
                                        <div className="space-y-3 pl-2">
                                            <div className="flex gap-2">
                                                {[15, 25, 45, 60].map((mins) => (
                                                    <button
                                                        key={mins}
                                                        type="button"
                                                        onClick={() => setTimerMinutes(mins)}
                                                        className={`flex-1 py-1.5 rounded-lg text-sm font-medium border transition-all ${timerMinutes === mins
                                                            ? 'bg-orange-500 border-orange-600 text-white'
                                                            : 'bg-white border-gray-200 text-gray-600'
                                                            }`}
                                                    >
                                                        {mins}m
                                                    </button>
                                                ))}
                                            </div>
                                            <label className="flex items-center gap-2 text-sm text-gray-600">
                                                <input
                                                    type="checkbox"
                                                    checked={autoComplete}
                                                    onChange={(e) => setAutoComplete(e.target.checked)}
                                                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                                                />
                                                Auto-complete habit when timer ends
                                            </label>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* --- TAB 3: REMINDERS --- */}
                        {activeTab === 'Reminders' && (
                            <div className="space-y-6 animate-fadeIn">
                                {/* Start Date - Styled to match Reminder Card */}
                                <div className="p-4 rounded-xl border border-gray-200 bg-white">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2 block">
                                        Starting On
                                    </label>
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-full bg-gray-100 text-gray-500">
                                            <Calendar className="w-5 h-5" />
                                        </div>
                                        <input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            className="flex-1 text-base font-medium text-gray-900 focus:outline-none"
                                        />
                                    </div>
                                </div>

                                {/* Smart Reminder Input */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <label className="text-sm font-semibold text-gray-700">
                                            Reminder Time
                                        </label>
                                    </div>

                                    <div className="animate-fadeIn space-y-3">
                                        <div className="flex gap-2">
                                            {[
                                                { label: 'Morning', time: '09:00' },
                                                { label: 'Noon', time: '12:00' },
                                                { label: 'Evening', time: '20:00' },
                                            ].map((preset) => (
                                                <button
                                                    key={preset.time}
                                                    type="button"
                                                    onClick={() => {
                                                        setHasReminder(true);
                                                        setReminderTime(preset.time);
                                                        // Request permission if needed
                                                        if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
                                                            Notification.requestPermission();
                                                        }
                                                    }}
                                                    className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${hasReminder && reminderTime === preset.time
                                                        ? 'bg-orange-500 border-orange-600 text-white'
                                                        : 'bg-white border-gray-200 text-gray-600'
                                                        }`}
                                                >
                                                    {preset.label}
                                                </button>
                                            ))}
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    setHasReminder(false);
                                                    setReminderTime('');
                                                }}
                                                className={`flex-1 py-2 px-3 rounded-lg text-sm font-medium border transition-all ${!hasReminder
                                                    ? 'bg-gray-200 border-gray-300 text-gray-700'
                                                    : 'bg-white border-gray-200 text-gray-600'
                                                    }`}
                                            >
                                                No Reminder
                                            </button>
                                        </div>
                                        <div className="relative">
                                            <Clock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            <input
                                                type="time"
                                                value={reminderTime}
                                                onChange={(e) => setReminderTime(e.target.value)}
                                                className="w-full px-4 py-3 rounded-xl font-medium text-center text-lg bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-100"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Danger Zone */}
                                {initialHabit && (
                                    <div className="pt-6 mt-6 border-t border-gray-100 space-y-3">
                                        <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Manage</h4>

                                        {!initialHabit.archived_at ? (
                                            <button
                                                type="button"
                                                onClick={() => {
                                                    if (window.confirm("Discontinue this habit?")) handleArchive();
                                                }}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl border border-orange-100 hover:bg-orange-50 text-gray-600 hover:text-gray-800 transition-all"
                                            >
                                                <Archive className="w-4 h-4 text-orange-400" />
                                                <span className="text-sm font-medium">Archive Habit</span>
                                            </button>
                                        ) : (
                                            <button
                                                type="button"
                                                onClick={handleResume}
                                                className="w-full flex items-center gap-3 p-3 rounded-xl border border-green-100 hover:bg-green-50 text-gray-600 hover:text-gray-800 transition-all"
                                            >
                                                <RotateCcw className="w-4 h-4 text-green-500" />
                                                <span className="text-sm font-medium">Resume Habit</span>
                                            </button>
                                        )}

                                        <button
                                            type="button"
                                            onClick={() => {
                                                if (window.confirm("Delete permanently?")) handleDelete();
                                            }}
                                            className="w-full flex items-center gap-3 p-3 rounded-xl border border-red-100 hover:bg-red-50 text-gray-600 hover:text-red-700 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4 text-red-400" />
                                            <span className="text-sm font-medium">Delete Permanently</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        )}
                    </form>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-gray-100 bg-white rounded-b-2xl">
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl font-semibold text-gray-500 bg-gray-50 hover:bg-gray-100 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading}
                            className="flex-1 py-3 rounded-xl font-semibold text-white bg-gradient-to-r from-[#FF7A6B] to-[#FFA094] hover:shadow-lg hover:shadow-orange-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            {initialHabit ? 'Save Changes' : 'Create Habit'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
