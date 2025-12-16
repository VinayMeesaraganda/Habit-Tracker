
import { Check, Edit2 } from 'lucide-react';
import { CATEGORY_COLORS } from '../utils/colors';
import { Habit } from '../types';

interface HabitCardProps {
    habit: Habit;
    completed: boolean;
    onToggle: () => void;
    onEdit: () => void;
}

export function HabitCard({ habit, completed, onToggle, onEdit }: HabitCardProps) {
    const isArchived = !!habit.archived_at;
    const categoryColor = CATEGORY_COLORS[habit.category];

    // Determine completion gradient
    const checkGradient = completed
        ? 'bg-gradient-to-br from-emerald-400 to-emerald-600 border-transparent shadow-sm shadow-emerald-200'
        : 'bg-white border-gray-200 text-transparent hover:border-emerald-400';

    return (
        <div className="bg-white rounded-xl p-3 shadow-sm border border-gray-100 flex items-center gap-3 active:scale-[0.99] transition-transform">
            {/* Left: Category Icon/Indicator - Smaller */}
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${categoryColor.bg} ${categoryColor.border}`}>
                <span className="text-lg">{habit.category.split(' ')[1] || '📌'}</span>
            </div>

            {/* Middle: Content */}
            <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-base text-gray-900 truncate leading-tight ${completed ? 'line-through text-gray-400 decoration-2 decoration-emerald-200' : ''}`}>
                    {habit.name}
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                    <span className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-px rounded-full border ${categoryColor.bg} ${categoryColor.border} ${categoryColor.text}`}>
                        {habit.category.split(' ')[0]}
                    </span>
                    {isArchived && (
                        <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-px rounded-full border border-amber-200">
                            Stopped
                        </span>
                    )}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2">
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onEdit();
                    }}
                    className="p-2 text-gray-300 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                >
                    <Edit2 className="w-4 h-4" />
                </button>

                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                    disabled={isArchived}
                    className={`w-12 h-12 rounded-xl flex items-center justify-center border transition-all duration-200 ${checkGradient} ${isArchived ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                >
                    <Check className={`w-6 h-6 ${completed ? 'text-white' : 'text-gray-200'} transition-all`} strokeWidth={3} />
                </button>
            </div>
        </div>
    );
}
