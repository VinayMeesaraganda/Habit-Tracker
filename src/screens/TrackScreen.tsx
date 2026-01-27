import React, { useMemo, useCallback, useState } from 'react';
import { format, isAfter, isSameDay, startOfDay } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { ColorfulHabitCard, QuantifiableHabitCard, MultiSegmentProgressRing, SectionDivider } from '../components/ui';
import { DatePickerModal } from '../components/DatePickerModal';
import { FocusTimer } from '../components/FocusTimer';
import { DATE_FORMATS } from '../utils/dateFormats';
import { Habit } from '../types';
import { Calendar, Plus, Settings, Edit2 } from 'lucide-react';
import { isHabitScheduledForDate } from '../utils/frequencyUtils';

interface TrackScreenProps {
    selectedDate: Date;
    onDateChange?: (date: Date) => void;
    onEditHabit?: (habit: Habit) => void;
    onAddHabit?: () => void;
}

export const TrackScreen: React.FC<TrackScreenProps> = ({
    selectedDate,
    onDateChange,
    onEditHabit,
    onAddHabit
}) => {
    const { habits, getHabitLogs, toggleLog, toggleSkipDay, isSkipped, addLogWithValue, updateLogValue, getHabitLogsForDate } = useHabits();
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [isEditMode, setIsEditMode] = useState(false);

    // Timer state
    const [timerHabit, setTimerHabit] = useState<Habit | null>(null);

    // Get active and archived habits
    const { activeHabits, archivedHabits } = useMemo(() => {
        const selectedDayStart = startOfDay(selectedDate);

        const active = habits.filter(h => !h.archived_at);
        const archived = habits.filter(h => h.archived_at);

        // Filter active habits for display
        const visibleActive = isEditMode
            ? active.sort((a, b) => (a.priority || 0) - (b.priority || 0))
            : active.filter(h => {
                const habitStartDate = startOfDay(new Date(h.created_at));
                // Check if habit started before or on selected date
                if (isAfter(habitStartDate, selectedDayStart)) return false;
                // Check if habit is scheduled for this day (frequency filter)
                if (!isHabitScheduledForDate(h, selectedDate)) return false;
                return true;
            }).sort((a, b) => (a.priority || 0) - (b.priority || 0));

        return {
            activeHabits: visibleActive,
            archivedHabits: archived
        };
    }, [habits, selectedDate, isEditMode]);

    // Get logs for selected date
    const selectedDateLogs = useMemo(() =>
        getHabitLogs(selectedDate),
        [selectedDate, getHabitLogs]
    );



    // Check if habit is completed on selected date
    const isCompleted = useCallback((habitId: string) => {
        return selectedDateLogs.some(log => log.habit_id === habitId);
    }, [selectedDateLogs]);

    // Handle habit toggle for selected date
    const handleToggle = useCallback(async (habitId: string) => {
        const dateStr = format(selectedDate, DATE_FORMATS.ISO_DATE);
        await toggleLog(habitId, dateStr);
    }, [selectedDate, toggleLog]);

    // Handle skip toggle for selected date
    const handleSkip = useCallback(async (habitId: string) => {
        const dateStr = format(selectedDate, DATE_FORMATS.ISO_DATE);
        await toggleSkipDay(habitId, dateStr);
    }, [selectedDate, toggleSkipDay]);

    // Get date string for skip checks
    const selectedDateStr = format(selectedDate, DATE_FORMATS.ISO_DATE);

    // Handle card click based on mode
    // For quantifiable habits, only edit mode clicks should work (not toggle)
    const handleCardClick = (habit: Habit, isQuantifiable: boolean = false) => {
        if (isEditMode) {
            onEditHabit?.(habit);
        } else if (!isQuantifiable) {
            // Only toggle for non-quantifiable habits
            handleToggle(habit.id);
        }
        // For quantifiable habits in normal mode, do nothing (use quick-add buttons)
    };

    // Handle date selection from calendar
    const handleDateSelect = useCallback((date: Date) => {
        onDateChange?.(date);
    }, [onDateChange]);

    // Get schedule text
    const getScheduleText = (habit: Habit) => {
        if (habit.type === 'daily') return 'Everyday';
        return 'Weekly';
    };

    // Check if selected date is today
    const isToday = isSameDay(selectedDate, new Date());
    const isFuture = isAfter(startOfDay(selectedDate), startOfDay(new Date()));

    return (
        <div className="min-h-screen pb-24 px-4" style={{ background: '#FFF8E7' }}>
            {/* Header */}
            <div className="pt-8 pb-6 flex items-center justify-between safe-area-top">
                <div>
                    <h1 className="text-2xl font-bold" style={{ color: '#1F1F1F' }}>
                        {isToday ? 'Today' : format(selectedDate, 'EEEE')}
                    </h1>
                    <p className="text-sm" style={{ color: '#6B6B6B' }}>
                        {format(selectedDate, 'EEEE, MMM d')}
                    </p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setIsEditMode(!isEditMode)}
                        className={`p-3 rounded-xl transition-all active:scale-95 ${isEditMode ? 'bg-orange-100 ring-2 ring-orange-500' : 'bg-white hover:bg-gray-50'}`}
                        style={{
                            border: isEditMode ? 'none' : '1px solid #F0F0F0',
                        }}
                    >
                        <Settings className={`w-5 h-5 ${isEditMode ? 'text-orange-600' : 'text-gray-400'}`} />
                    </button>
                    <button
                        onClick={() => setShowDatePicker(true)}
                        className="p-3 rounded-xl transition-all hover:scale-105 active:scale-95"
                        style={{
                            background: '#FFFFFF',
                            border: '1px solid #F0F0F0',
                        }}
                    >
                        <Calendar className="w-5 h-5" style={{ color: '#FF7A6B' }} />
                    </button>
                </div>
            </div>

            {/* Habits Section */}
            {!isEditMode && (
                <div className="mb-6">
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
                        </div>

                        {/* Progress Ring - with proportional contribution for quantifiable habits */}
                        {(() => {
                            // Calculate proportional completion
                            // - Non-quantifiable: 0% or 100%
                            // - Quantifiable: actual percentage (e.g., 500/2000 = 25%)
                            const totalHabits = activeHabits.length;
                            if (totalHabits === 0) {
                                return (
                                    <MultiSegmentProgressRing
                                        completed={0}
                                        remaining={0}
                                        overdue={0}
                                    />
                                );
                            }

                            let totalContribution = 0;
                            activeHabits.forEach(habit => {
                                if (habit.is_quantifiable) {
                                    // Get current value for this habit on selected date
                                    const habitLogs = getHabitLogsForDate(habit.id, selectedDateStr);
                                    const currentValue = habitLogs.reduce((sum, log) => sum + (log.value || 0), 0);
                                    const targetValue = habit.target_value || 1;
                                    const percentage = Math.min(currentValue / targetValue, 1);
                                    totalContribution += percentage;
                                } else {
                                    // Non-quantifiable: 0 or 1
                                    totalContribution += isCompleted(habit.id) ? 1 : 0;
                                }
                            });

                            // Convert to counts for the ring (out of totalHabits)
                            const completedEquivalent = totalContribution;
                            const remainingEquivalent = totalHabits - completedEquivalent;

                            return (
                                <MultiSegmentProgressRing
                                    completed={completedEquivalent}
                                    remaining={Math.max(0, remainingEquivalent)}
                                    overdue={0}
                                />
                            );
                        })()}
                    </div>
                </div>
            )}

            {/* Edit Mode Banner */}
            {isEditMode && (
                <div className="mb-6 bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                        <Edit2 className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-orange-800">Edit Mode</h3>
                        <p className="text-xs text-orange-600">Tap any habit to edit details</p>
                    </div>
                </div>
            )}

            {/* Habits Progress */}
            <SectionDivider text="HABITS" />

            {activeHabits.length === 0 ? (
                <div className="text-center py-12">
                    <p className="text-lg mb-2" style={{ color: '#6B6B6B' }}>
                        {isToday ? 'No habits yet' : 'No habits for this date'}
                    </p>
                    <p className="text-sm" style={{ color: '#9E9E9E' }}>
                        {isToday
                            ? 'Tap the + button to create your first habit'
                            : 'Habits only appear from their start date onwards'
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {activeHabits.map(habit => (
                        <div key={habit.id} className="relative group">
                            {/* Render QuantifiableHabitCard for quantifiable habits */}
                            {habit.is_quantifiable ? (
                                <QuantifiableHabitCard
                                    habit={habit}
                                    logs={getHabitLogsForDate(habit.id, selectedDateStr)}
                                    onAddValue={(value) => addLogWithValue(habit.id, selectedDateStr, value)}
                                    onUpdateValue={(value) => updateLogValue(habit.id, selectedDateStr, value)}
                                    skipped={isSkipped(habit.id, selectedDateStr)}
                                    onSkip={() => handleSkip(habit.id)}
                                    onClick={() => handleCardClick(habit, true)}
                                    disabled={!isEditMode && isFuture}
                                    className={isEditMode ? 'ring-2 ring-orange-400 ring-offset-2 scale-[0.98]' : ''}
                                />
                            ) : (
                                <ColorfulHabitCard
                                    name={habit.name}
                                    schedule={getScheduleText(habit)}
                                    completed={isEditMode ? false : isCompleted(habit.id)}
                                    skipped={isEditMode ? false : isSkipped(habit.id, selectedDateStr)}
                                    category={habit.category}
                                    onToggle={() => handleCardClick(habit)}
                                    onSkip={isEditMode ? undefined : () => handleSkip(habit.id)}
                                    onTimer={habit.timer_minutes ? () => setTimerHabit(habit) : undefined}
                                    timerMinutes={habit.timer_minutes}
                                    disabled={!isEditMode && isFuture}
                                    className={isEditMode ? 'ring-2 ring-orange-400 ring-offset-2 scale-[0.98]' : ''}
                                />
                            )}
                            {isEditMode && (
                                <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1.5 shadow-md">
                                    <Edit2 className="w-3 h-3" />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}

            {/* Archived Habits (Only in Edit Mode) */}
            {isEditMode && archivedHabits.length > 0 && (
                <>
                    <SectionDivider text="ARCHIVED" />
                    <div className="grid grid-cols-2 gap-3 mb-8 opacity-60">
                        {archivedHabits.map(habit => (
                            <div key={habit.id} className="relative group grayscale">
                                <ColorfulHabitCard
                                    name={habit.name}
                                    schedule={getScheduleText(habit)}
                                    completed={false}
                                    category={habit.category}
                                    onToggle={() => onEditHabit?.(habit)}
                                    className="ring-2 ring-gray-200 ring-offset-2 scale-[0.98]"
                                />
                                <div className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1.5 shadow-md">
                                    <Edit2 className="w-3 h-3" />
                                </div>
                            </div>
                        ))}
                    </div>
                </>
            )}

            {/* Floating Action Button */}
            <button
                onClick={onAddHabit}
                className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 z-40"
                style={{
                    background: '#1F1F1F', // Dark background for high contrast
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)', // Stronger shadow
                    border: '2px solid rgba(255,255,255,0.1)'
                }}
            >
                <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
            </button>

            {/* Date Picker Modal */}
            <DatePickerModal
                isOpen={showDatePicker}
                selectedDate={selectedDate}
                onDateSelect={handleDateSelect}
                onClose={() => setShowDatePicker(false)}
            />

            {/* Focus Timer Modal */}
            {timerHabit && (
                <FocusTimer
                    habit={timerHabit}
                    isOpen={!!timerHabit}
                    onClose={() => setTimerHabit(null)}
                    onComplete={() => {
                        handleToggle(timerHabit.id);
                        setTimerHabit(null);
                    }}
                />
            )}
        </div>
    );
};
