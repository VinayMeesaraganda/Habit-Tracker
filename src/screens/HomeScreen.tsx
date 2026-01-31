import React, { useMemo, useCallback, useState } from 'react';
import { format, startOfDay, isAfter, isToday, getHours } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { ColorfulHabitCard, QuantifiableHabitCard, MultiSegmentProgressRing, SectionDivider } from '../components/ui';
import { DatePickerModal } from '../components/DatePickerModal';
import { FocusTimer } from '../components/FocusTimer';
import { DATE_FORMATS } from '../utils/dateFormats';
import { Habit } from '../types';
import { Calendar, Plus, Settings, Edit2, Flame, TrendingUp } from 'lucide-react';
import { isHabitScheduledForDate } from '../utils/frequencyUtils';
import { getLongestStreak } from '../utils/analytics';
import { motion } from 'framer-motion';

interface HomeScreenProps {
    selectedDate: Date;
    onDateChange?: (date: Date) => void;
    onEditHabit?: (habit: Habit) => void;
    onAddHabit?: () => void;
    isEditMode?: boolean;
    onToggleEditMode?: (isEdit: boolean) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
    selectedDate,
    onDateChange,
    onEditHabit,
    onAddHabit,
    isEditMode: controlledEditMode,
    onToggleEditMode
}) => {
    const { habits, getHabitLogs, toggleLog, toggleSkipDay, isSkipped, addLogWithValue, updateLogValue, getHabitLogsForDate } = useHabits();
    const [showDatePicker, setShowDatePicker] = useState(false);

    const [internalEditMode, setInternalEditMode] = useState(false);
    const isEditMode = controlledEditMode ?? internalEditMode;

    const handleToggleEditMode = () => {
        if (onToggleEditMode) {
            onToggleEditMode(!isEditMode);
        } else {
            setInternalEditMode(!isEditMode);
        }
    };

    // Timer state
    const [timerHabit, setTimerHabit] = useState<Habit | null>(null);

    // Get active and archived habits
    const { activeHabits, archivedHabits } = useMemo(() => {
        const selectedDayStart = startOfDay(selectedDate);

        const active = habits.filter(h => !h.archived_at);
        const archived = habits.filter(h => h.archived_at);

        const visibleActive = isEditMode
            ? active.sort((a, b) => (a.priority || 0) - (b.priority || 0))
            : active.filter(h => {
                const habitStartDate = startOfDay(new Date(h.created_at));
                if (isAfter(habitStartDate, selectedDayStart)) return false;
                if (!isHabitScheduledForDate(h, selectedDate)) return false;
                return true;
            }).sort((a, b) => (a.priority || 0) - (b.priority || 0));

        return {
            activeHabits: visibleActive,
            archivedHabits: archived
        };
    }, [habits, selectedDate, isEditMode, selectedDate]);

    // Get logs for selected date
    const selectedDateLogs = useMemo(() =>
        getHabitLogs(selectedDate),
        [selectedDate, getHabitLogs]
    );

    // Calculate dashboard stats
    const dashboardStats = useMemo(() => {
        let completedToday = 0;

        activeHabits.forEach(habit => {
            const log = selectedDateLogs.find(l => l.habit_id === habit.id);
            if (!log) return;

            if (habit.is_quantifiable && habit.target_value) {
                if ((log.value || 0) >= habit.target_value) {
                    completedToday++;
                }
            } else {
                completedToday++;
            }
        });

        const totalHabits = activeHabits.length;
        const completionRate = totalHabits > 0 ? Math.round((completedToday / totalHabits) * 100) : 0;
        const longestStreak = getLongestStreak(activeHabits, selectedDateLogs);

        return {
            completed: completedToday,
            total: totalHabits,
            completionRate,
            longestStreak
        };
    }, [activeHabits, selectedDateLogs]);

    // Check if habit is completed on selected date
    const isCompleted = useCallback((habitId: string) => {
        const habit = habits.find(h => h.id === habitId);
        const log = selectedDateLogs.find(l => l.habit_id === habitId);

        if (!log) return false;
        if (habit?.is_quantifiable && habit.target_value) {
            return (log.value || 0) >= habit.target_value;
        }
        return true;
    }, [selectedDateLogs, habits]);

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
    const handleCardClick = (habit: Habit, isQuantifiable: boolean = false) => {
        if (isEditMode) {
            onEditHabit?.(habit);
        } else if (!isQuantifiable) {
            if (isSkipped(habit.id, selectedDateStr)) return;
            handleToggle(habit.id);
        }
    };

    // Handle date selection from calendar
    const handleDateSelect = useCallback((date: Date) => {
        onDateChange?.(date);
    }, [onDateChange]);

    // Get greeting based on time of day
    const getGreeting = () => {
        const hour = getHours(new Date());
        if (hour < 12) return { text: 'Morning', emoji: '☀️', color: '#FFD97D' };
        if (hour < 17) return { text: 'Afternoon', emoji: '🌤️', color: '#5BA3F5' };
        return { text: 'Evening', emoji: '🌙', color: '#9B6CF9' };
    };

    const greeting = getGreeting();
    const isTodayDate = isToday(selectedDate);
    const isFuture = isAfter(startOfDay(selectedDate), startOfDay(new Date()));

    return (
        <div className="min-h-screen pb-24 bg-[#FFF8E7]">
            <div className="max-w-7xl mx-auto w-full">
                {/* Enhanced Header with Greeting */}
                <div className="px-6 md:px-8 pt-8 pb-6 safe-area-top max-w-7xl mx-auto w-full">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex items-center justify-between"
                    >
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                                Good {greeting.text}
                            </h1>
                            <p className="text-gray-500 font-medium mt-1 text-base md:text-lg">
                                {isTodayDate ? "Ready to crush your goals?" : format(selectedDate, 'EEEE, MMMM d')}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={handleToggleEditMode}
                                className={`p-3 md:p-4 rounded-xl transition-all ${isEditMode
                                    ? 'bg-orange-100 ring-2 ring-orange-500'
                                    : 'bg-white hover:bg-gray-50 shadow-sm border border-gray-100'
                                    }`}
                            >
                                <Settings className={`w-5 h-5 md:w-6 md:h-6 ${isEditMode ? 'text-orange-600' : 'text-gray-400'}`} />
                            </motion.button>
                            <motion.button
                                whileTap={{ scale: 0.95 }}
                                onClick={() => setShowDatePicker(true)}
                                className="p-3 md:p-4 rounded-xl transition-all hover:scale-105 bg-white shadow-sm border border-gray-100"
                            >
                                <Calendar className="w-5 h-5 md:w-6 md:h-6" style={{ color: '#FF7A6B' }} />
                            </motion.button>
                        </div>
                    </motion.div>

                    {/* Dashboard Stats Cards */}
                    {!isEditMode && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="grid grid-cols-3 gap-2 md:gap-4 mt-6 md:mt-8 max-w-3xl"
                        >
                            {/* Completion Ring */}
                            <div className="bg-white rounded-xl md:rounded-2xl p-2 md:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all hover:shadow-md h-full">
                                <div className="scale-75 md:scale-100 transform origin-center">
                                    <MultiSegmentProgressRing
                                        completed={dashboardStats.completed}
                                        remaining={Math.max(0, dashboardStats.total - dashboardStats.completed)}
                                        overdue={0}
                                        size={80}
                                        strokeWidth={8}
                                    />
                                </div>
                                <span className="text-[10px] md:text-sm text-gray-400 mt-1 md:mt-3 font-medium">Today</span>
                            </div>

                            {/* Streak Card */}
                            <div className="bg-white rounded-xl md:rounded-2xl p-2 md:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all hover:shadow-md h-full">
                                <div className="flex items-center gap-1 md:gap-2">
                                    <Flame className="w-4 h-4 md:w-6 md:h-6 text-orange-500" />
                                    <span className="text-xl md:text-3xl font-black text-gray-800">
                                        {dashboardStats.longestStreak.streak || 0}
                                    </span>
                                </div>
                                <span className="text-[10px] md:text-sm text-gray-400 mt-1 md:mt-2 font-medium">Streak</span>
                            </div>

                            {/* Completion Rate Card */}
                            <div className="bg-white rounded-xl md:rounded-2xl p-2 md:p-6 shadow-sm border border-gray-100 flex flex-col items-center justify-center transition-all hover:shadow-md h-full">
                                <div className="flex items-center gap-1 md:gap-2">
                                    <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-green-500" />
                                    <span className="text-xl md:text-3xl font-black text-gray-800">
                                        {dashboardStats.completionRate}%
                                    </span>
                                </div>
                                <span className="text-[10px] md:text-sm text-gray-400 mt-1 md:mt-2 font-medium">Rate</span>
                            </div>
                        </motion.div>
                    )}

                    {/* Edit Mode Banner */}
                    {isEditMode && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3 max-w-2xl"
                        >
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                <Edit2 className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-bold text-orange-800">Edit Mode</h3>
                                <p className="text-xs text-orange-600">Tap any habit to edit details</p>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Habits Section */}
            <div className="px-6 md:px-8 max-w-7xl mx-auto w-full">
                <SectionDivider text="TODAY'S HABITS" />

                {activeHabits.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center py-20"
                    >
                        <div className="text-7xl mb-6">🎯</div>
                        <h3 className="text-2xl font-bold text-gray-700 mb-3">
                            {isTodayDate ? 'Start your journey!' : 'No habits for this day'}
                        </h3>
                        <p className="text-gray-500 mb-8 max-w-md mx-auto">
                            {isTodayDate
                                ? 'Create your first habit to begin tracking'
                                : 'Habits appear from their start date'
                            }
                        </p>
                        <motion.button
                            whileTap={{ scale: 0.95 }}
                            whileHover={{ scale: 1.05 }}
                            onClick={onAddHabit}
                            className="px-8 py-4 rounded-2xl font-bold text-white shadow-xl hover:shadow-2xl transition-all"
                            style={{
                                background: 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)',
                            }}
                        >
                            Add Your First Habit
                        </motion.button>
                    </motion.div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-5">
                        {activeHabits.map((habit, index) => (
                            <motion.div
                                key={habit.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ delay: index * 0.05 }}
                                className="relative group"
                            >
                                {habit.is_quantifiable ? (
                                    <QuantifiableHabitCard
                                        habit={habit}
                                        logs={getHabitLogsForDate(habit.id, selectedDateStr)}
                                        onAddValue={(value) => {
                                            if (isSkipped(habit.id, selectedDateStr)) return;
                                            addLogWithValue(habit.id, selectedDateStr, value);
                                        }}
                                        onUpdateValue={(value) => {
                                            if (isSkipped(habit.id, selectedDateStr)) return;
                                            updateLogValue(habit.id, selectedDateStr, value);
                                        }}
                                        skipped={isSkipped(habit.id, selectedDateStr)}
                                        onSkip={() => handleSkip(habit.id)}
                                        onClick={() => handleCardClick(habit, true)}
                                        disabled={!isEditMode && isFuture}
                                        className={`${isEditMode ? 'ring-2 ring-orange-400 ring-offset-2 scale-[0.98]' : ''} h-full`}
                                        reminderTime={habit.reminder_time}
                                    />
                                ) : (
                                    <ColorfulHabitCard
                                        name={habit.name}
                                        schedule={habit.type === 'daily' ? 'Everyday' : 'Weekly'}
                                        completed={isEditMode ? false : isCompleted(habit.id)}
                                        skipped={isEditMode ? false : isSkipped(habit.id, selectedDateStr)}
                                        category={habit.category}
                                        onToggle={() => handleCardClick(habit)}
                                        onSkip={isEditMode ? undefined : () => handleSkip(habit.id)}
                                        onTimer={habit.timer_minutes ? () => setTimerHabit(habit) : undefined}
                                        timerMinutes={habit.timer_minutes}
                                        disabled={!isEditMode && isFuture}
                                        className={`${isEditMode ? 'ring-2 ring-orange-400 ring-offset-2 scale-[0.98]' : ''} h-full`}
                                        reminderTime={habit.reminder_time}
                                        onClick={() => handleCardClick(habit)}
                                    />
                                )}
                                {isEditMode && (
                                    <div className="absolute -top-2 -right-2 bg-orange-500 text-white rounded-full p-1.5 shadow-md z-10 transition-transform group-hover:scale-110">
                                        <Edit2 className="w-4 h-4" />
                                    </div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                )}

                {/* Archived Habits (Only in Edit Mode) */}
                {isEditMode && archivedHabits.length > 0 && (
                    <>
                        <SectionDivider text="ARCHIVED" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8 opacity-60">
                            {archivedHabits.map(habit => (
                                <div key={habit.id} className="relative group grayscale">
                                    <ColorfulHabitCard
                                        name={habit.name}
                                        schedule={habit.type === 'daily' ? 'Everyday' : 'Weekly'}
                                        completed={false}
                                        category={habit.category}
                                        onToggle={() => onEditHabit?.(habit)}
                                        className="ring-2 ring-gray-200 ring-offset-2 scale-[0.98] h-full"
                                    />
                                    <div className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1.5 shadow-md">
                                        <Edit2 className="w-3 h-3" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Floating Action Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onAddHabit}
                className="fixed bottom-24 right-6 w-14 h-14 rounded-full flex items-center justify-center shadow-xl z-40"
                style={{
                    background: 'linear-gradient(135deg, #FF7A6B 0%, #FFA094 100%)',
                    boxShadow: '0 4px 20px rgba(255, 122, 107, 0.4)',
                }}
            >
                <Plus className="w-7 h-7 text-white" strokeWidth={2.5} />
            </motion.button>

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
