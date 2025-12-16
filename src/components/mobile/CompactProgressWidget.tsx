/**
 * CompactProgressWidget - Merged progress and streaks in single row
 * Compact design to save vertical space on mobile
 */
import { memo } from 'react';

interface CompactProgressWidgetProps {
    completedCount: number;
    totalHabits: number;
    progressPercent: number;
}

export const CompactProgressWidget = memo(function CompactProgressWidget({
    completedCount,
    totalHabits,
    progressPercent,
}: CompactProgressWidgetProps) {

    return (
        <div className="mx-4 mt-2 mb-2">
            <div className="card-glass p-3">
                <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${progressPercent === 100 ? 'bg-green-500/20 text-green-400' : 'bg-primary-500/20 text-primary-400'}`}>
                            <span className="text-xs font-bold">{progressPercent}%</span>
                        </div>
                        <span className="text-xs text-gray-400 font-medium">Daily Progress</span>
                    </div>
                    <span className="text-xs text-gray-400">
                        {completedCount}/{totalHabits} Done
                    </span>
                </div>

                <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${progressPercent === 100 ? 'bg-green-500' : 'bg-gradient-to-r from-primary-500 to-purple-500'}`}
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>
        </div>
    );
});
