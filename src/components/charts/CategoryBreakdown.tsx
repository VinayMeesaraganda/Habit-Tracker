import React from 'react';
import { Habit, HabitLog } from '../../types';
import { colors, categoryColorMap } from '../../theme/colors';
import { getCategoryEmoji } from '../../utils/categoryEmojis';

interface CategoryBreakdownProps {
    habits: Habit[];
    logs: HabitLog[];
    startDate: string;
    endDate: string;
}

interface CategoryData {
    category: string;
    completed: number;
    total: number;
    percentage: number;
    color: string;
}

export const CategoryBreakdown: React.FC<CategoryBreakdownProps> = ({
    habits,
    logs,
    startDate,
    endDate
}) => {
    // Group habits by category
    const categoryMap = new Map<string, { habits: Habit[]; logs: HabitLog[] }>();

    habits.forEach(habit => {
        const cat = habit.category || 'Other';
        if (!categoryMap.has(cat)) {
            categoryMap.set(cat, { habits: [], logs: [] });
        }
        categoryMap.get(cat)!.habits.push(habit);
    });

    // Count completions per category
    logs.forEach(log => {
        if (log.date >= startDate && log.date <= endDate) {
            const habit = habits.find(h => h.id === log.habit_id);
            if (habit) {
                const cat = habit.category || 'Other';
                if (categoryMap.has(cat)) {
                    categoryMap.get(cat)!.logs.push(log);
                }
            }
        }
    });

    // Calculate percentages
    const categories: CategoryData[] = [];
    let maxCompleted = 0;

    categoryMap.forEach((data, category) => {
        const completed = data.logs.length;
        const total = data.habits.length * 30; // Rough estimate
        maxCompleted = Math.max(maxCompleted, completed);

        const colorKey = categoryColorMap[category] || 'coral';
        const color = colors.habitColors[colorKey]?.start || '#FF7A6B';

        categories.push({
            category,
            completed,
            total,
            percentage: total > 0 ? Math.round((completed / total) * 100) : 0,
            color
        });
    });

    // Sort by completed count
    categories.sort((a, b) => b.completed - a.completed);

    if (categories.length === 0) {
        return null;
    }

    return (
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">
                By Category
            </h3>

            <div className="space-y-4">
                {categories.map(({ category, completed, color }) => {
                    const barWidth = maxCompleted > 0 ? (completed / maxCompleted) * 100 : 0;

                    return (
                        <div key={category}>
                            <div className="flex items-center justify-between mb-1.5">
                                <div className="flex items-center gap-2">
                                    <span className="text-lg">{getCategoryEmoji(category)}</span>
                                    <span className="font-semibold text-gray-700 text-sm">{category}</span>
                                </div>
                                <span className="text-sm font-bold text-gray-600">
                                    {completed}
                                </span>
                            </div>
                            <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full rounded-full transition-all duration-500"
                                    style={{
                                        width: `${barWidth}%`,
                                        backgroundColor: color
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
