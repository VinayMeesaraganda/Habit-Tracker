/**
 * TopStreaksWidget - Desktop compact streak list
 * Shows top active streaks beside weekly performance
 */
import { memo } from 'react';
import { Flame } from 'lucide-react';
import { Habit, HabitLog } from '../../types';
import { getActiveStreaks, getStreakColor } from '../../utils/analytics';

interface TopStreaksWidgetProps {
    habits: Habit[];
    logs: HabitLog[];
    maxDisplay?: number;
}

export const TopStreaksWidget = memo(function TopStreaksWidget({
    habits,
    logs,
    maxDisplay = 3
}: TopStreaksWidgetProps) {
    const activeStreaks = getActiveStreaks(habits, logs).slice(0, maxDisplay);

    if (activeStreaks.length === 0) {
        return (
            <div className="card-glass p-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                    <Flame className="w-4 h-4" />
                    Top Streaks
                </h3>
                <p className="text-xs text-gray-500 text-center py-3">
                    Build streaks by completing habits daily!
                </p>
            </div>
        );
    }

    return (
        <div className="card-glass p-4">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-3 flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" fill="currentColor" />
                Top Streaks
            </h3>

            <div className="space-y-2">
                {activeStreaks.map(({ habit, streak }) => {
                    const colors = getStreakColor(streak);

                    return (
                        <div
                            key={habit.id}
                            className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                                <span className="text-lg">{habit.category.split(' ')[1] || '📌'}</span>
                                <span className="text-xs font-medium text-gray-300 truncate">
                                    {habit.name}
                                </span>
                            </div>

                            <div className={`
                                flex items-center gap-1 px-2 py-1 rounded-full font-bold text-xs
                                ${colors.bg} ${colors.border} ${colors.text}
                                border
                            `}>
                                <Flame className={`w-3 h-3 ${colors.iconColor}`} fill="currentColor" />
                                <span>{streak}</span>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
