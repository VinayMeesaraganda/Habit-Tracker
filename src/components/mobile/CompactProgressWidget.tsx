/**
 * CompactProgressWidget - Merged progress and streaks in single row
 * Compact design to save vertical space on mobile
 */
import { memo, useState } from 'react';
import { Habit, HabitLog } from '../../types';
import { ChevronDown, ChevronUp, Flame } from 'lucide-react';
import { getActiveStreaks } from '../../utils/analytics';
import { StreakBadge } from '../StreakBadge';

interface CompactProgressWidgetProps {
    completedCount: number;
    totalHabits: number;
    progressPercent: number;
    habits: Habit[];
    logs: HabitLog[];
}

export const CompactProgressWidget = memo(function CompactProgressWidget({
    completedCount,
    totalHabits,
    progressPercent,
    habits,
    logs
}: CompactProgressWidgetProps) {
    const [expanded, setExpanded] = useState(false);
    const activeStreaks = getActiveStreaks(habits, logs);
    const topStreaks = activeStreaks.slice(0, 3);

    return (
        <div className="mx-4 mt-2 mb-2">
            {/* Clean Stats Strip */}
            <div
                className="card-glass p-3 cursor-pointer active:scale-[0.99] transition-transform"
                onClick={() => setExpanded(!expanded)}
            >
                {/* Top Row: Labels & Stats */}
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${progressPercent === 100 ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'}`}>
                            <span className="text-xs font-bold">{progressPercent}%</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">
                            {completedCount}/{totalHabits} Done
                        </span>
                    </div>

                    <div className="flex items-center gap-1.5 px-2 py-1 rounded-full bg-white/5 border border-white/5">
                        <Flame className={`w-3.5 h-3.5 ${activeStreaks.length > 0 ? 'text-orange-400 fill-orange-400/20' : 'text-gray-600'}`} />
                        <span className={`text-xs font-bold ${activeStreaks.length > 0 ? 'text-white' : 'text-gray-500'}`}>
                            {activeStreaks.length}
                        </span>
                        {expanded ?
                            <ChevronUp className="w-3 h-3 text-gray-500 ml-1" /> :
                            <ChevronDown className="w-3 h-3 text-gray-500 ml-1" />
                        }
                    </div>
                </div>

                {/* Bottom Row: Progress Bar */}
                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-primary-500 to-purple-500'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Expanded Streaks Table */}
            {expanded && activeStreaks.length > 0 && (
                <div className="card-glass mt-2 p-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    {topStreaks.map(({ habit, streak }, idx) => (
                        <div
                            key={habit.id}
                            className={`flex items-center justify-between p-2.5 ${idx !== topStreaks.length - 1 ? 'border-b border-white/5' : ''}`}
                        >
                            <div className="flex items-center gap-3 overflow-hidden flex-1">
                                <span className="text-base">{habit.category.split(' ')[1] || '📌'}</span>
                                <span className="text-xs font-medium text-gray-300 truncate">{habit.name}</span>
                            </div>
                            <StreakBadge streak={streak} size="sm" />
                        </div>
                    ))}
                    {activeStreaks.length > 3 && (
                        <div className="text-center py-2 text-[10px] text-gray-500 border-t border-white/5 bg-white/[0.02]">
                            +{activeStreaks.length - 3} more streaks
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});
