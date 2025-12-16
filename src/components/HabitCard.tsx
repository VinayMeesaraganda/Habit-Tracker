/**
 * HabitCard - Mobile Habit Display Card
 * Used in MobileDashboard for displaying individual habits
 */

import { Habit } from '../types';
import { Check, Edit2, Flame, Target } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/colors';
import { calculateStreak } from '../utils/analytics';
import { useHabits } from '../context/HabitContext';

interface HabitCardProps {
    habit: Habit;
    completed: boolean;
    onToggle: () => void;
    onEdit: () => void;
}

export function HabitCard({ habit, completed, onToggle, onEdit }: HabitCardProps) {
    const { logs } = useHabits();
    const streak = calculateStreak(habit, logs);
    const categoryColor = CATEGORY_COLORS[habit.category as keyof typeof CATEGORY_COLORS]?.hex || CATEGORY_COLORS.default.hex;

    return (
        <div
            className={`relative bg-white rounded-2xl p-4 shadow-sm border transition-all duration-200 ${completed ? 'border-green-200 bg-green-50/50' : 'border-gray-100'
                }`}
        >
            <div className="flex items-center gap-4">
                {/* Checkbox */}
                <button
                    onClick={onToggle}
                    className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${completed
                            ? 'bg-green-500 text-white shadow-lg shadow-green-500/30'
                            : 'border-2 border-gray-200 hover:border-gray-300'
                        }`}
                >
                    {completed && <Check className="w-6 h-6" strokeWidth={3} />}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        <h3 className={`font-semibold truncate ${completed ? 'text-green-700 line-through' : 'text-gray-900'}`}>
                            {habit.name}
                        </h3>
                        {streak > 0 && (
                            <span className="flex items-center gap-0.5 text-xs px-2 py-0.5 rounded-full bg-orange-100 text-orange-600">
                                <Flame className="w-3 h-3 fill-orange-500" />
                                {streak}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-2 mt-1">
                        <span
                            className="text-xs px-2 py-0.5 rounded-full"
                            style={{
                                backgroundColor: `${categoryColor}20`,
                                color: categoryColor
                            }}
                        >
                            {habit.category}
                        </span>
                        {habit.type === 'weekly' && (
                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Weekly
                            </span>
                        )}
                    </div>
                </div>

                {/* Edit Button */}
                <button
                    onClick={onEdit}
                    className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}
