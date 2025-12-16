import { Habit, HabitLog } from '../types';
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';

export function generateCSV(habits: Habit[], logs: HabitLog[], currentMonth: Date): string {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // HEADER
    const header = [
        'Habit Name',
        'Category',
        'Goal',
        'Total Completed',
        ...days.map(d => format(d, 'yyyy-MM-dd'))
    ].join(',');

    // ROWS
    const rows = habits.map(habit => {
        // Filter logs for this habit and month to speed up lookup? 
        // Or just lazy check.
        // Let's pre-process logs for this habit to a Set of dates string for O(1) lookup
        const habitLogDates = new Set(
            logs
                .filter(l => l.habit_id === habit.id && l.completed)
                .map(l => l.date) // 'yyyy-MM-dd' from DB
        );

        const rowData = [
            `"${habit.name.replace(/"/g, '""')}"`, // Escape quotes
            habit.category,
            habit.month_goal || 0,
            habitLogDates.size,
            ...days.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                return habitLogDates.has(dateStr) ? 'X' : '';
            })
        ];

        return rowData.join(',');
    });

    return [header, ...rows].join('\n');
}

export function downloadCSV(content: string, filename: string) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}
