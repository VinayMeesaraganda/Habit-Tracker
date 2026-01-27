import React from 'react';
import { format, subDays, startOfWeek, addDays } from 'date-fns';

interface WeeklyHeatmapProps {
    logs: Array<{ date: string; habit_id: string }>;
    habits: Array<{ id: string }>;
    weeks?: number;
}

export const WeeklyHeatmap: React.FC<WeeklyHeatmapProps> = ({
    logs,
    habits,
    weeks = 4
}) => {
    const today = new Date();
    const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

    // Build week data going back N weeks
    const weeksData: Array<Array<{ date: string; count: number; total: number }>> = [];

    for (let w = weeks - 1; w >= 0; w--) {
        const weekStart = startOfWeek(subDays(today, w * 7), { weekStartsOn: 0 });
        const weekDays: Array<{ date: string; count: number; total: number }> = [];

        for (let d = 0; d < 7; d++) {
            const day = addDays(weekStart, d);
            const dateStr = format(day, 'yyyy-MM-dd');
            const dayLogs = logs.filter(l => l.date === dateStr);
            const uniqueHabits = new Set(dayLogs.map(l => l.habit_id)).size;

            weekDays.push({
                date: dateStr,
                count: uniqueHabits,
                total: habits.length
            });
        }
        weeksData.push(weekDays);
    }

    // Get intensity color
    const getIntensity = (count: number, total: number): string => {
        if (total === 0 || count === 0) return 'bg-gray-100';
        const ratio = count / total;
        if (ratio >= 0.8) return 'bg-green-500';
        if (ratio >= 0.6) return 'bg-green-400';
        if (ratio >= 0.4) return 'bg-green-300';
        if (ratio >= 0.2) return 'bg-green-200';
        return 'bg-green-100';
    };

    const isFuture = (dateStr: string) => {
        return new Date(dateStr) > today;
    };

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                Activity
            </h3>

            {/* Day Labels */}
            <div className="flex gap-1 mb-2 pl-1">
                {dayLabels.map((label, i) => (
                    <div
                        key={i}
                        className="flex-1 text-center text-xs font-medium text-gray-400"
                    >
                        {label}
                    </div>
                ))}
            </div>

            {/* Weeks Grid */}
            <div className="space-y-1">
                {weeksData.map((week, wi) => (
                    <div key={wi} className="flex gap-1">
                        {week.map((day, di) => (
                            <div
                                key={di}
                                className={`flex-1 aspect-square rounded-md transition-all ${isFuture(day.date)
                                        ? 'bg-gray-50 border border-dashed border-gray-200'
                                        : getIntensity(day.count, day.total)
                                    }`}
                                title={`${format(new Date(day.date), 'MMM d')}: ${day.count}/${day.total}`}
                            />
                        ))}
                    </div>
                ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-1 mt-4">
                <span className="text-xs text-gray-400 mr-2">Less</span>
                <div className="w-3 h-3 rounded-sm bg-gray-100" />
                <div className="w-3 h-3 rounded-sm bg-green-200" />
                <div className="w-3 h-3 rounded-sm bg-green-300" />
                <div className="w-3 h-3 rounded-sm bg-green-400" />
                <div className="w-3 h-3 rounded-sm bg-green-500" />
                <span className="text-xs text-gray-400 ml-2">More</span>
            </div>
        </div>
    );
};
