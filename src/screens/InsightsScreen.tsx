import React, { useMemo, useState } from 'react';
import { startOfMonth, subMonths, addMonths, format, subDays } from 'date-fns';
import { useHabits } from '../context/HabitContext';
import { SectionDivider } from '../components/ui';
import { MonthYearPicker } from '../components/MonthYearPicker';
import { ProductivityPulse } from '../components/charts/ProductivityPulse';
import { HabitPerformanceCard } from '../components/charts/HabitPerformanceCard';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface InsightsScreenProps {
    currentMonth: Date;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({ currentMonth: propCurrentMonth }) => {
    const { habits, logs, setCurrentMonth } = useHabits();
    const [showDatePicker, setShowDatePicker] = useState(false);

    // Ensure we have a valid date
    const currentMonth = useMemo(() => {
        if (!propCurrentMonth || isNaN(propCurrentMonth.getTime())) {
            return new Date();
        }
        return propCurrentMonth;
    }, [propCurrentMonth]);

    // Get active habits
    const activeHabits = useMemo(() =>
        habits.filter(h => !h.archived_at).sort((a, b) => (a.priority || 0) - (b.priority || 0)),
        [habits]
    );

    const handlePreviousMonth = () => {
        setCurrentMonth(subMonths(currentMonth, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(addMonths(currentMonth, 1));
    };

    // --- Productivity Pulse Data Calculation ---
    const pulseData = useMemo(() => {
        const days = 30; // Last 30 days
        const data = [];
        const today = new Date();

        for (let i = days - 1; i >= 0; i--) {
            const date = subDays(today, i);
            const dateStr = format(date, 'yyyy-MM-dd');

            // Calculate score for this day
            // Score = (Sum of % completion of annual habits) / Total Active Habits
            let totalPercentage = 0;
            const dayLogs = logs.filter(l => l.date === dateStr);

            if (activeHabits.length === 0) {
                data.push({ date: dateStr, score: 0 });
                continue;
            }

            activeHabits.forEach(habit => {
                const log = dayLogs.find(l => l.habit_id === habit.id);
                if (habit.is_quantifiable) {
                    const value = log?.value || 0;
                    const target = habit.target_value || 1;
                    totalPercentage += Math.min((value / target), 1); // Cap at 100% contribution
                } else {
                    totalPercentage += log ? 1 : 0;
                }
            });

            const dailyScore = (totalPercentage / activeHabits.length) * 100;
            data.push({ date: dateStr, score: dailyScore });
        }
        return data;
    }, [activeHabits, logs]);


    return (
        <div className="min-h-screen pb-24 px-4 bg-[#FFF8E7]">
            <MonthYearPicker
                isOpen={showDatePicker}
                onClose={() => setShowDatePicker(false)}
                selectedDate={currentMonth}
                onSelect={setCurrentMonth}
            />

            {/* Header */}
            <div className="pt-8 pb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-extra-bold text-[#1F1F1F] tracking-tight mb-1">
                        Insights
                    </h1>
                    <p className="text-[#6B6B6B] font-medium">
                        Performance & Trends
                    </p>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center bg-white rounded-xl shadow-sm border border-gray-100 p-1.5">
                    <button
                        onClick={handlePreviousMonth}
                        className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors active:scale-95"
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setShowDatePicker(true)}
                        className="text-sm font-bold text-gray-700 w-28 text-center py-1 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                        {format(currentMonth, 'MMMM yyyy')}
                    </button>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg hover:bg-gray-50 text-gray-500 transition-colors active:scale-95"
                        disabled={currentMonth >= startOfMonth(new Date())}
                        style={{ opacity: currentMonth >= startOfMonth(new Date()) ? 0.3 : 1 }}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Productivity Pulse Chart */}
            <ProductivityPulse data={pulseData} />

            {/* Habit Performance Cards */}
            <div className="mt-8">
                <SectionDivider text="DETAILED BREAKDOWN" />

                {activeHabits.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-gray-100 mt-4">
                        <p className="text-gray-400">No active habits to analyze</p>
                    </div>
                ) : (
                    <div className="mt-4">
                        {activeHabits.map(habit => (
                            <HabitPerformanceCard
                                key={habit.id}
                                habit={habit}
                                logs={logs}
                                currentMonth={currentMonth}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};
