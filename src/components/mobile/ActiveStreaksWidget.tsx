/**
 * ActiveStreaksWidget - Mobile top section widget
 * Shows active streaks in horizontal scroll format
 */
import { memo } from 'react';
import { Flame } from 'lucide-react';
import { Habit, HabitLog } from '../../types';
import { getActiveStreaks, getStreakColor } from '../../utils/analytics';

interface ActiveStreaksWidgetProps {
    habits: Habit[];
    logs: HabitLog[];
}

export const ActiveStreaksWidget = memo(function ActiveStreaksWidget({ habits, logs }: ActiveStreaksWidgetProps) {
    const activeStreaks = getActiveStreaks(habits, logs);

    if (activeStreaks.length === 0) {
        return (
            <div className="mx-4 mt-4 card-glass p-3 flex items-center gap-3">
                <div className="p-2 bg-orange-500/10 rounded-full">
                    <Flame className="w-4 h-4 text-gray-500" />
                </div>
                <div>
                    <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Active Streaks</h3>
                    <p className="text-[10px] text-gray-500">Complete habits to build streaks!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="mx-4 mt-4">
            <div className="flex items-center gap-2 mb-2 px-1">
                <Flame className="w-4 h-4 text-orange-400" fill="currentColor" />
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wide">Active Streaks</h3>
            </div>

            {/* Horizontal Scrollable Streak Cards */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {activeStreaks.map(({ habit, streak }) => {
                    const colors = getStreakColor(streak);
                    const emoji = habit.category.split(' ')[1] || '📌';

                    return (
                        <div
                            key={habit.id}
                            className={`
                                flex-shrink-0 w-24 p-3 rounded-xl border
                                ${colors.bg} ${colors.border}
                                flex flex-col items-center gap-2
                            `}
                        >
                            {/* Emoji Icon */}
                            <div className="text-2xl">{emoji}</div>

                            {/* Streak Count */}
                            <div className="flex items-center gap-1">
                                <Flame className={`w-4 h-4 ${colors.iconColor}`} fill="currentColor" />
                                <span className={`text-lg font-bold ${colors.text}`}>{streak}</span>
                            </div>

                            {/* Habit Name */}
                            <span className="text-[9px] font-medium text-gray-400 text-center truncate w-full">
                                {habit.name}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
});
