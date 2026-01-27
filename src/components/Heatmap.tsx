import React, { useMemo } from 'react';
import { eachDayOfInterval, endOfMonth, format, isSameMonth, startOfMonth, startOfWeek, endOfWeek, isSameDay } from 'date-fns';
import { HabitLog } from '../types';

interface HeatmapProps {
    logs: HabitLog[];
    month: Date;
}

export const Heatmap: React.FC<HeatmapProps> = ({ logs = [], month }) => {
    // Safety check for invalid date
    if (!month || isNaN(month.getTime())) {
        return null; // Or return a fallback UI
    }

    // Generate dates for the calendar view of the selected month
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const startDate = startOfWeek(monthStart); // Start from the beginning of the week
    const endDate = endOfWeek(monthEnd);       // End at the end of the week

    const calendarDays = useMemo(() => {
        return eachDayOfInterval({
            start: startDate,
            end: endDate
        });
    }, [startDate, endDate]);

    // Process logs into a map for O(1) lookup
    const logsMap = useMemo(() => {
        const map = new Map<string, number>();
        logs.forEach(log => {
            const count = map.get(log.date) || 0;
            map.set(log.date, count + 1);
        });
        return map;
    }, [logs]);

    // Calculate max completions to normalize intensity
    // We only care about max in THIS month for relative scaling? 
    // Or global max? Global max is stable. Local max makes low-activity months look busy.
    // Let's use a fixed reasonably high number (e.g. 5 habits/day) as baseline, 
    // or dynamic max from the month if it's higher.
    const maxCompletions = Math.max(
        ...Array.from(logsMap.values()),
        3 // Minimum baseline to avoid 1 habit looking super intense
    );

    const getColor = (count: number, isCurrentMonth: boolean) => {
        if (!isCurrentMonth) return 'transparent'; // Hide/dim non-month days
        if (count === 0) return '#F5F5F5';

        // Intensity variations
        const intensity = count / maxCompletions;
        if (intensity < 0.25) return '#FFD9D4'; // Level 1
        if (intensity < 0.5) return '#FFA094';  // Level 2
        if (intensity < 0.75) return '#FF7A6B'; // Level 3
        return '#E55A4B';                       // Level 4 (Max)
    };

    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    return (
        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                    Consistency
                </h3>
                <span className="text-xs font-bold px-2 py-1 rounded-full bg-orange-50 text-orange-600">
                    {format(month, 'MMMM')}
                </span>
            </div>

            {/* Calendar Grid */}
            <div className="w-full">
                {/* Weekday Headers */}
                <div className="grid grid-cols-7 mb-2">
                    {weekDays.map(day => (
                        <div key={day} className="text-center text-xs font-medium text-gray-300">
                            {day}
                        </div>
                    ))}
                </div>

                {/* Days */}
                <div className="grid grid-cols-7 gap-1 sm:gap-2">
                    {calendarDays.map(day => {
                        const dateStr = format(day, 'yyyy-MM-dd');
                        const count = logsMap.get(dateStr) || 0;
                        const isCurrentMonth = isSameMonth(day, month);
                        const isToday = isSameDay(day, new Date());

                        return (
                            <div
                                key={day.toString()}
                                className={`
                                    aspect-square rounded-lg flex flex-col items-center justify-center relative group
                                    ${!isCurrentMonth ? 'opacity-0' : 'opacity-100'}
                                    transition-all duration-300
                                `}
                                style={{
                                    background: getColor(count, isCurrentMonth),
                                    border: isToday ? '2px solid #1F1F1F' : 'none'
                                }}
                            >
                                <span className={`
                                    text-[10px] sm:text-xs font-medium z-10
                                    ${count > 0 ? 'text-white' : 'text-gray-400'}
                                    ${isToday && count === 0 ? 'text-gray-800' : ''}
                                `}>
                                    {format(day, 'd')}
                                </span>

                                {/* Tooltip */}
                                {isCurrentMonth && (
                                    <div className="absolute bottom-full mb-2 bg-gray-800 text-white text-[10px] px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-20 transition-opacity">
                                        {count} habits
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Legend */}
            <div className="flex items-center justify-end gap-2 mt-4">
                <span className="text-xs text-gray-400">Low</span>
                <div className="flex gap-1">
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#FFD9D4' }} />
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#FFA094' }} />
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#FF7A6B' }} />
                    <div className="w-2.5 h-2.5 rounded-sm" style={{ background: '#E55A4B' }} />
                </div>
                <span className="text-xs text-gray-400">High</span>
            </div>
        </div>
    );
};
