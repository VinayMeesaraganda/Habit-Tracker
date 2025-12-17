/**
 * HabitCard - Premium Dark Mobile Habit Card
 * Glassmorphism design with satisfying animations
 * Wrapped in React.memo for performance optimization
 */

import { memo } from 'react';
import { Habit } from '../types';
import { Check, Edit2, Target } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/colors';
import { calculateStreak } from '../utils/analytics';
import { useHabits } from '../context/HabitContext';
import { StreakBadge } from './StreakBadge';

interface HabitCardProps {
    habit: Habit;
    completed: boolean;
    onToggle: () => void;
    onEdit: () => void;
    disabled?: boolean;
}

export const HabitCard = memo(function HabitCard({ habit, completed, onToggle, onEdit, disabled }: HabitCardProps) {
    const { logs } = useHabits();
    const streak = calculateStreak(habit, logs);
    const categoryColor = CATEGORY_COLORS[habit.category as keyof typeof CATEGORY_COLORS]?.hex || CATEGORY_COLORS.default.hex;

    return (
        <div
            className={`relative card-glass p-4 transition-all duration-300 ${completed
                ? 'bg-green-500/10 border-green-500/20'
                : 'hover:bg-white/[0.08]'
                } ${disabled ? 'opacity-50 grayscale' : ''}`}
        >
            <div className="flex items-center gap-4">
                {/* Checkbox */}
                <button
                    onClick={onToggle}
                    className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${completed
                        ? 'bg-green-500 glow-success'
                        : disabled ? 'border-2 border-dashed border-gray-600 cursor-not-allowed' : 'border-2 border-white/20 hover:border-white/40'
                        }`}
                >
                    {completed && (
                        <Check
                            className="w-6 h-6 text-white animate-scale-in"
                            strokeWidth={3}
                        />
                    )}
                </button>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                        {habit.priority && (
                            <span className="text-xs font-mono font-bold text-gray-500 mr-1">#{habit.priority}</span>
                        )}
                        <h3 className={`font-semibold truncate transition-all duration-300 ${completed
                            ? 'text-green-400 line-through opacity-70'
                            : 'text-white'
                            }`}>
                            {habit.name}
                        </h3>
                        <StreakBadge streak={streak} size="sm" />
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
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                                <Target className="w-3 h-3" />
                                Weekly
                            </span>
                        )}
                    </div>
                </div>

                {/* Edit Button */}
                <button
                    onClick={onEdit}
                    className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-all duration-200"
                >
                    <Edit2 className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
});
