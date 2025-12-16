/**
 * StreakBadge - Reusable streak indicator component
 * Shows flame icon with day count, color-coded by streak length
 */
import { memo } from 'react';
import { Flame } from 'lucide-react';
import { getStreakColor, isStreakMilestone } from '../utils/analytics';

interface StreakBadgeProps {
    streak: number;
    size?: 'sm' | 'md' | 'lg';
    showLabel?: boolean;
    className?: string;
}

export const StreakBadge = memo(function StreakBadge({
    streak,
    size = 'md',
    showLabel = false,
    className = ''
}: StreakBadgeProps) {
    const colors = getStreakColor(streak);
    const isMilestone = isStreakMilestone(streak);

    const sizeClasses = {
        sm: 'px-1.5 py-0.5 text-[10px] gap-0.5',
        md: 'px-2 py-1 text-xs gap-1',
        lg: 'px-3 py-1.5 text-sm gap-1.5'
    };

    const iconSizes = {
        sm: 'w-2.5 h-2.5',
        md: 'w-3 h-3',
        lg: 'w-4 h-4'
    };

    if (streak === 0) return null;

    return (
        <div
            className={`
                inline-flex items-center rounded-full font-bold
                ${sizeClasses[size]} 
                ${colors.bg} 
                ${colors.text}
                border ${colors.border}
                ${isMilestone ? 'animate-pulse' : ''}
                ${className}
            `}
        >
            <Flame className={`${iconSizes[size]} ${colors.iconColor}`} fill="currentColor" />
            <span>{streak}</span>
            {showLabel && <span className="text-[9px] opacity-70">day{streak !== 1 ? 's' : ''}</span>}
        </div>
    );
});
