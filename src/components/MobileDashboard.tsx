import { useState, useMemo, useRef, useEffect } from 'react';
import { useHabits } from '../context/HabitContext';
import { AddHabitModal } from './AddHabitModal';
import { ProfileModal } from './ProfileModal';
import { format, startOfMonth, endOfMonth, endOfWeek, startOfWeek, isSameDay, eachDayOfInterval, setYear, isSameMonth } from 'date-fns';
import { Calendar as CalendarIcon, List, BarChart2, CheckSquare, ChevronLeft, ChevronRight, Plus, Edit2, Search, Download } from 'lucide-react';
import { generateCSV, downloadCSV } from '../utils/export';
import { HorizontalCalendar } from './HorizontalCalendar';
import { HabitCard } from './HabitCard';
import { Habit } from '../types';
import { DailyCompletionChart, CategoryBreakdownChart } from './DashboardCharts';
import { RadialProgress } from './RadialProgress';
import { CATEGORY_COLORS } from '../utils/colors';
import { getBestDay, getConsistencyScore, getProgressBadges, getLongestStreak } from '../utils/analytics';

export function MobileDashboard() {
    const { habits, toggleHabit, getHabitLogs, currentMonth, setCurrentMonth, logs, user } = useHabits();
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [editingHabit, setEditingHabit] = useState<Habit | null>(null);
    const [activeTab, setActiveTab] = useState<'today' | 'habits' | 'analytics'>('today');
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const contentRef = useRef<HTMLDivElement>(null);

    // --- SEO: Dynamic Title ---
    useEffect(() => {
        const titles = {
            today: 'Today',
            habits: 'My Habits',
            analytics: 'Analytics'
        };
        document.title = `${titles[activeTab]} | Habit Tracker`;
    }, [activeTab]);

    const handleExportCSV = () => {
        // Prepare data for export
        const exportHabits = habits; // Can be filtered if needed, but usually export all for context
        const csvContent = generateCSV(exportHabits, logs, currentMonth);
        downloadCSV(csvContent, `habit - tracker - mobile - ${format(currentMonth, 'yyyy-MM')}.csv`);
    };

    // Scroll to top when switching tabs
    useEffect(() => {
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'auto' });
        }
    }, [activeTab]);

    // Ensure selectedDate is always in the currentMonth (syncs Year/Month changes)
    useEffect(() => {
        if (!isSameMonth(selectedDate, currentMonth)) {
            setSelectedDate(startOfMonth(currentMonth));
        }
    }, [currentMonth]); // Removed selectedDate dependency to avoid circular loops, though safe here

    // --- Helpers ---
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

    // --- Data Preparation (Today View) ---
    const activeHabits = useMemo(() => {
        const viewDate = selectedDate;

        return habits.filter(habit => {
            const createdAt = new Date(habit.created_at);
            if (createdAt.setHours(0, 0, 0, 0) > viewDate.getTime()) return false;
            if (habit.archived_at) {
                const archivedAt = new Date(habit.archived_at);
                if (archivedAt < viewDate) return false;
            }
            return true;
        });
    }, [habits, selectedDate]);

    const completedCount = activeHabits.filter(h => isCompleted(h.id, selectedDate)).length;
    const progressPercent = activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;


    // --- Data Preparation (Analytics/Stats) ---
    const monthDays = useMemo(() => eachDayOfInterval({
        start: startOfMonth(currentMonth),
        end: endOfMonth(currentMonth)
    }), [currentMonth]);

    const dailyHabits = useMemo(() => habits.filter(h => h.type === 'daily'), [habits]);
    const weeklyHabits = useMemo(() => habits.filter(h => h.type === 'weekly'), [habits]);

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
        if (habits.length === 0) return 0;
        const totalPercent = habits.reduce((sum, habit) => sum + getHabitProgress(habit).percent, 0);
        const avg = Math.round(totalPercent / habits.length);
        return isNaN(avg) ? 0 : avg;
    }, [habits, logs, currentMonth, weeklyStats]);


    const chartData = useMemo(() => {
        return monthDays.map(day => {
            const logs = getHabitLogs(day);
            const count = logs.filter(l => l.completed && dailyHabits.some(h => h.id === l.habit_id)).length;
            return { day: format(day, 'yyyy-MM-dd'), completed: count, date: day };
        });
    }, [monthDays, getHabitLogs, dailyHabits]);

    const categoryData = useMemo(() => {
        const counts: Record<string, number> = {};
        habits.forEach(h => {
            counts[h.category] = (counts[h.category] || 0) + 1;
        });
        return Object.entries(counts).map(([name, value]) => ({ name, value }));
    }, [habits]);


    // --- Month Picker Overlay ---
    const MonthPicker = () => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const year = currentMonth.getFullYear();

        return (
            <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-start justify-center pt-20" onClick={() => setIsMonthPickerOpen(false)}>
                <div className="card-glass w-[90%] max-w-sm overflow-hidden shadow-2xl animate-scale-in" onClick={e => e.stopPropagation()}>
                    <div className="bg-white/5 p-4 flex items-center justify-between border-b border-white/10">
                        <h3 className="font-bold text-white">Select Month</h3>
                        <div className="flex items-center gap-2 bg-white/5 rounded-lg p-1 border border-white/10">
                            <button onClick={() => setCurrentMonth(setYear(currentMonth, year - 1))} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                                <ChevronLeft className="w-4 h-4 text-gray-400" />
                            </button>
                            <span className="text-sm font-bold w-12 text-center text-white">{year}</span>
                            <button onClick={() => setCurrentMonth(setYear(currentMonth, year + 1))} className="p-1 hover:bg-white/10 rounded-md transition-colors">
                                <ChevronRight className="w-4 h-4 text-gray-400" />
                            </button>
                        </div>
                    </div>
                    <div className="p-4 grid grid-cols-3 gap-3">
                        {months.map((m, idx) => (
                            <button
                                key={m}
                                onClick={() => {
                                    const newMonth = new Date(year, idx, 1);
                                    setCurrentMonth(newMonth);
                                    setIsMonthPickerOpen(false);
                                    const now = new Date();
                                    if (isSameDay(newMonth, startOfMonth(now))) {
                                        setSelectedDate(now);
                                    } else {
                                        setSelectedDate(newMonth);
                                    }
                                }}
                                className={`py-3 rounded-xl text-sm font-bold transition-all ${idx === currentMonth.getMonth()
                                    ? 'bg-primary-500 text-white glow-primary'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {m}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-[#0A0A0B] pb-20 flex flex-col font-sans text-white">
            {isMonthPickerOpen && <MonthPicker />}

            <ProfileModal
                isOpen={isProfileModalOpen}
                onClose={() => setIsProfileModalOpen(false)}
            />

            {/* Header: Premium Dark */}
            <div className="bg-[#0A0A0B]/80 backdrop-blur-lg px-4 py-3 flex items-center justify-between sticky top-0 z-20 border-b border-white/5">
                <div className="flex items-center gap-2.5">
                    <button
                        onClick={() => setIsProfileModalOpen(true)}
                        className="w-9 h-9 bg-gradient-to-br from-primary-500 to-purple-600 rounded-xl flex items-center justify-center text-white hover:scale-105 transition-transform active:scale-95"
                    >
                        <span className="font-bold text-sm">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </span>
                    </button>
                    <div>
                        <p className="text-[10px] uppercase font-bold text-primary-400 tracking-wider mb-0.5">Habit Tracker</p>
                        <h1 className="text-lg font-bold text-white leading-none">
                            {activeTab === 'today' ? 'Today' : activeTab === 'habits' ? 'My Habits' : 'Analytics'}
                        </h1>
                        <p className="text-[10px] text-gray-500 font-medium leading-tight mt-0.5">
                            {format(currentMonth, 'MMMM yyyy')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setIsMonthPickerOpen(true)}
                        title="Select Month"
                        className={`p-2 rounded-lg transition-colors ${isMonthPickerOpen ? 'bg-primary-500/20 text-primary-400' : 'text-gray-500 hover:bg-white/5 hover:text-white'}`}
                    >
                        <CalendarIcon className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsAddModalOpen(true)}
                        title="Add New Habit"
                        className="p-2 rounded-lg bg-primary-500/20 text-primary-400 hover:bg-primary-500/30 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto" ref={contentRef}>
                {activeTab === 'today' && (
                    <>
                        {/* Calendar Strip (Synced with currentMonth) */}
                        <div className="sticky top-0 z-10 bg-[#0A0A0B]/90 backdrop-blur-lg border-b border-white/5 pb-2 pt-1">
                            <HorizontalCalendar
                                currentMonth={currentMonth}
                                selectedDate={selectedDate}
                                onSelectDate={(date) => {
                                    setSelectedDate(date);
                                }}
                            />
                        </div>

                        {/* Progress Card - Compact */}
                        {activeHabits.length > 0 && (
                            <div className="mx-4 mt-4 card-glass p-4 relative overflow-hidden">
                                <div className="absolute inset-0 bg-gradient-to-r from-primary-500/20 to-purple-500/20 pointer-events-none" />
                                <div className="relative z-10">
                                    <div className="flex justify-between items-center mb-3">
                                        <div>
                                            <h2 className="text-base font-bold text-white">Daily Goal</h2>
                                            <p className="text-gray-400 text-xs">{completedCount} of {activeHabits.length} done</p>
                                        </div>
                                        <div className="bg-white/10 px-3 py-1.5 rounded-lg backdrop-blur-sm">
                                            <span className="font-bold text-lg text-white">{progressPercent}%</span>
                                        </div>
                                    </div>
                                    <div className="w-full bg-white/10 rounded-full h-2">
                                        <div
                                            className="bg-gradient-to-r from-primary-500 to-purple-500 rounded-full h-2 transition-all duration-500"
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Habits List - Compact Spacing */}
                        <div className="px-4 mt-4 space-y-3 pb-24">
                            {activeHabits.map(habit => (
                                <HabitCard
                                    key={habit.id}
                                    habit={habit}
                                    completed={isCompleted(habit.id, selectedDate)}
                                    onToggle={() => handleToggle(habit.id, selectedDate)}
                                    onEdit={() => handleEditHabit(habit)}
                                />
                            ))}
                            {activeHabits.length === 0 && (
                                <div className="text-center py-10 text-gray-500 text-sm">
                                    <p>No habits for {format(selectedDate, 'MMM d')}.</p>
                                    <button
                                        onClick={() => setIsAddModalOpen(true)}
                                        className="text-primary-400 font-bold mt-2 hover:text-primary-300 transition-colors"
                                    >
                                        + Add a habit
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === 'habits' && (
                    <div className="px-4 py-4 pb-24 space-y-3">
                        <div className="card-glass p-3 mb-2 space-y-3">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-primary-500/20 rounded-full text-primary-400"><List className="w-4 h-4" /></div>
                                <div>
                                    <h3 className="text-sm font-bold text-white">Manage Habits</h3>
                                    <p className="text-xs text-gray-500">Viewing all habits for {format(currentMonth, 'MMMM')}</p>
                                </div>
                            </div>

                            {/* Mobile Controls */}
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                                    <input
                                        type="text"
                                        placeholder="Search habits..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="input-dark pl-9 pr-3 py-2 text-sm"
                                    />
                                </div>
                                <button
                                    onClick={handleExportCSV}
                                    className="p-2 bg-white/5 border border-white/10 rounded-lg text-gray-400 hover:bg-white/10 hover:text-white transition-colors"
                                    title="Export CSV"
                                >
                                    <Download className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {(() => {
                            const filteredHabits = habits.filter(habit => {
                                // Filter logic: Show if created before/during this month AND (not archived OR archived after/during this month)
                                const monthStart = startOfMonth(currentMonth);
                                const monthEnd = endOfMonth(currentMonth);
                                const createdAt = new Date(habit.created_at);

                                // 1. Must be created by the end of this month
                                if (createdAt > monthEnd) return false;

                                // 2. If archived, must be archived AFTER the start of this month
                                if (habit.archived_at) {
                                    const archivedAt = new Date(habit.archived_at);
                                    if (archivedAt < monthStart) return false;
                                }


                                // 3. Search Filter
                                if (searchTerm && !habit.name.toLowerCase().includes(searchTerm.toLowerCase())) {
                                    return false;
                                }

                                return true;
                            });

                            if (filteredHabits.length === 0) {
                                return (
                                    <div className="flex flex-col items-center justify-center py-12 text-center text-gray-500">
                                        <div className="bg-white/5 p-4 rounded-full mb-3">
                                            <List className="w-6 h-6 text-gray-600" />
                                        </div>
                                        <p className="text-sm font-medium mb-1 text-gray-400">No habits found</p>
                                        <p className="text-xs text-gray-500 mb-4 max-w-[200px]">
                                            You haven't tracked any habits for {format(currentMonth, 'MMMM')} yet.
                                        </p>
                                        <button
                                            onClick={() => {
                                                setEditingHabit(null);
                                                setIsAddModalOpen(true);
                                            }}
                                            className="text-primary-400 font-bold text-sm flex items-center gap-1 hover:bg-primary-500/10 px-3 py-1.5 rounded-lg transition-colors"
                                        >
                                            <Plus className="w-4 h-4" /> Create New Habit
                                        </button>
                                    </div>
                                );
                            }

                            return filteredHabits.map(habit => {
                                const progress = getHabitProgress(habit);
                                const catColor = CATEGORY_COLORS[habit.category];

                                return (
                                    <div key={habit.id} className="card-glass p-3 flex items-center justify-between">
                                        <div className="flex items-center gap-3 overflow-hidden flex-1">
                                            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 text-xl border border-white/10">
                                                {habit.category.split(' ')[1] || '📌'}
                                            </div>
                                            <div className="min-w-0">
                                                <h4 className="font-semibold text-sm text-white truncate">{habit.name}</h4>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <span className="text-[9px] font-bold px-1.5 py-px rounded-full" style={{ backgroundColor: `${catColor?.hex || '#6B7280'}20`, color: catColor?.hex || '#9CA3AF' }}>
                                                        {habit.category.split(' ')[0]}
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">
                                                        {habit.type === 'daily' ? 'Daily' : 'Weekly'} • {habit.month_goal || 'No'} Goal
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 pl-2">
                                            <div className="flex flex-col items-end">
                                                <span className={`text-sm font-bold ${progress.count >= progress.goal ? 'text-green-400' : 'text-gray-400'}`}>
                                                    {progress.count}/{progress.goal}
                                                </span>
                                                <div className="w-14 h-1 mt-1 bg-white/10 rounded-full overflow-hidden">
                                                    <div
                                                        className={`h-full rounded-full ${progress.count >= progress.goal ? 'bg-green-500' : 'bg-gray-500'}`}
                                                        style={{ width: `${progress.percent}%` }}
                                                    />
                                                </div>
                                            </div>

                                            {/* Edit Button */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleEditHabit(habit);
                                                }}
                                                className="p-2 text-gray-500 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            });
                        })()}
                    </div>
                )}

                {activeTab === 'analytics' && (
                    <div className="p-4 space-y-4 pb-24">
                        {/* Unified Performance Card */}
                        <div className="card-glass p-4 relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-primary-500/10 to-purple-500/10 blur-2xl rounded-full -mr-10 -mt-10" />

                            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Performance Overview</h3>

                            <div className="flex items-center justify-between mb-6">
                                {/* Left: Monthly Ring */}
                                <div className="flex flex-col items-center">
                                    <div className="relative">
                                        <RadialProgress
                                            percentage={monthlyAverageProgress}
                                            label="Score"
                                            color="#EC4899" // Pink-500
                                            size={100}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                            {/* Inner content handled by component */}
                                        </div>
                                    </div>
                                    <span className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">{format(currentMonth, 'MMMM')}</span>
                                </div>

                                {/* Right: Stats Column */}
                                <div className="flex-1 ml-6 space-y-3">
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Total Habits</p>
                                        <p className="text-xl font-bold text-white">{habits.length}</p>
                                    </div>
                                    <div className="bg-white/5 rounded-xl p-3 border border-white/10">
                                        <p className="text-[10px] text-gray-500 font-bold uppercase">Completion</p>
                                        <p className="text-xl font-bold text-white">{monthlyAverageProgress}%</p>
                                    </div>
                                </div>
                            </div>

                            {/* Divider with label */}
                            <div className="relative py-2">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-white/10"></div>
                                </div>
                                <div className="relative flex justify-center">
                                    <span className="bg-[#111113] px-2 text-xs text-gray-500 font-medium">Weekly Strength</span>
                                </div>
                            </div>

                            {/* Weekly Rings Row - Compacter */}
                            <div className="flex justify-between items-start pt-3 px-2">
                                {weeklyStats.map((week, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-1.5">
                                        <RadialProgress
                                            percentage={week.total > 0 ? (week.completed / week.total) * 100 : 0}
                                            label=""
                                            size={42}
                                            color={['#EF4444', '#F97316', '#F59E0B', '#10B981', '#3B82F6'][idx] || '#6C47FF'}
                                        />
                                        <span className="text-[10px] font-bold text-gray-400">W{idx + 1}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Charts Section */}
                        <div className="card-glass p-4">
                            <DailyCompletionChart data={chartData} />
                        </div>
                        <div className="card-glass p-4">
                            <CategoryBreakdownChart data={categoryData} />
                        </div>

                        {/* New: Insights Section */}
                        {(() => {
                            const bestDay = getBestDay(logs, currentMonth);
                            const consistencyScore = getConsistencyScore(habits, logs, currentMonth);
                            const longestStreak = getLongestStreak(habits, logs);
                            const badges = getProgressBadges(habits, logs);
                            const earnedBadges = badges.filter(b => b.earned);
                            const inProgressBadges = badges.filter(b => !b.earned);

                            return (
                                <>
                                    {/* Insights Card */}
                                    <div className="bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl p-4 shadow-lg text-white">
                                        <h3 className="text-xs font-bold uppercase tracking-widest mb-3 text-purple-200">✨ Insights</h3>
                                        <div className="grid grid-cols-2 gap-3">
                                            {/* Best Day */}
                                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                                <p className="text-[10px] text-purple-200 font-bold uppercase mb-1">Best Day</p>
                                                <p className="text-lg font-bold">
                                                    {bestDay.date ? format(new Date(bestDay.date), 'MMM d') : '-'}
                                                </p>
                                                <p className="text-xs text-purple-200">
                                                    {bestDay.count > 0 ? `${bestDay.count} habits completed` : 'No data yet'}
                                                </p>
                                            </div>

                                            {/* Consistency Score */}
                                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                                                <p className="text-[10px] text-purple-200 font-bold uppercase mb-1">Consistency</p>
                                                <p className="text-lg font-bold">{consistencyScore}%</p>
                                                <p className="text-xs text-purple-200">
                                                    {consistencyScore >= 80 ? 'Excellent!' : consistencyScore >= 50 ? 'Good progress' : 'Keep going!'}
                                                </p>
                                            </div>

                                            {/* Longest Streak */}
                                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3 col-span-2">
                                                <p className="text-[10px] text-purple-200 font-bold uppercase mb-1">🔥 Longest Streak</p>
                                                <div className="flex items-center justify-between">
                                                    <p className="text-2xl font-bold">{longestStreak.streak} days</p>
                                                    {longestStreak.habitName && (
                                                        <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
                                                            {longestStreak.habitName}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Badges Section */}
                                    <div className="card-glass p-4">
                                        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">🏆 Progress Badges</h3>

                                        {/* Earned Badges */}
                                        {earnedBadges.length > 0 && (
                                            <div className="mb-4">
                                                <p className="text-[10px] font-bold text-green-400 uppercase mb-2">Earned</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {earnedBadges.map(badge => (
                                                        <div key={badge.id} className="flex items-center gap-2 bg-green-500/10 border border-green-500/20 px-3 py-2 rounded-xl">
                                                            <span className="text-xl">{badge.icon}</span>
                                                            <div>
                                                                <p className="text-xs font-bold text-green-400">{badge.name}</p>
                                                                <p className="text-[9px] text-green-500/70">{badge.description}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* In Progress Badges */}
                                        {inProgressBadges.length > 0 && (
                                            <div>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase mb-2">In Progress</p>
                                                <div className="space-y-2">
                                                    {inProgressBadges.map(badge => (
                                                        <div key={badge.id} className="flex items-center gap-3 bg-white/5 border border-white/10 px-3 py-2 rounded-xl">
                                                            <span className="text-xl opacity-50">{badge.icon}</span>
                                                            <div className="flex-1">
                                                                <div className="flex justify-between items-center mb-1">
                                                                    <p className="text-xs font-bold text-gray-400">{badge.name}</p>
                                                                    <span className="text-[10px] text-gray-500">{badge.progress}%</span>
                                                                </div>
                                                                <div className="w-full bg-white/10 rounded-full h-1.5">
                                                                    <div
                                                                        className="bg-purple-500 h-1.5 rounded-full transition-all"
                                                                        style={{ width: `${badge.progress}%` }}
                                                                    />
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {earnedBadges.length === 0 && inProgressBadges.length === 0 && (
                                            <p className="text-center text-gray-500 text-sm py-4">Start tracking to earn badges!</p>
                                        )}
                                    </div>
                                </>
                            );
                        })()}

                        <div className="h-4" /> {/* Bottom spacer */}
                    </div>
                )}
            </div>

            {/* Bottom Navigation: Premium Dark */}
            <div className="fixed bottom-0 left-0 right-0 bg-[#0A0A0B]/90 backdrop-blur-lg border-t border-white/10 px-6 py-2 flex justify-around items-center z-30 pb-safe">
                <button
                    onClick={() => {
                        setActiveTab('today');
                        const now = new Date();
                        setSelectedDate(now);
                        setCurrentMonth(startOfMonth(now));
                    }}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'today' ? 'text-primary-400 bg-primary-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                >
                    <List className="w-6 h-6" strokeWidth={activeTab === 'today' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Today</span>
                </button>

                <button
                    onClick={() => setActiveTab('habits')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'habits' ? 'text-primary-400 bg-primary-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                >
                    <CheckSquare className="w-6 h-6" strokeWidth={activeTab === 'habits' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Habits</span>
                </button>

                <button
                    onClick={() => setActiveTab('analytics')}
                    className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${activeTab === 'analytics' ? 'text-purple-400 bg-purple-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-gray-300'}`}
                >
                    <BarChart2 className="w-6 h-6" strokeWidth={activeTab === 'analytics' ? 2.5 : 2} />
                    <span className="text-[10px] font-bold">Stats</span>
                </button>
            </div>

            {/* FAB - Today & Habits View Only */}
            {(activeTab === 'today' || activeTab === 'habits') && (
                <button
                    onClick={() => {
                        setEditingHabit(null);
                        setIsAddModalOpen(true);
                    }}
                    className="fixed bottom-24 right-5 w-12 h-12 bg-gradient-to-br from-primary-500 to-purple-600 text-white rounded-xl shadow-xl shadow-primary-500/30 flex items-center justify-center hover:scale-105 transition-transform active:scale-95 z-40"
                >
                    <Plus className="w-6 h-6" />
                </button>
            )}

            <AddHabitModal
                isOpen={isAddModalOpen}
                initialHabit={editingHabit}
                onClose={() => setIsAddModalOpen(false)}
            />
        </div>
    );
}
