import React from 'react';

interface StreakBadgeProps {
    count: number;
    type?: 'current' | 'best';
    size?: 'small' | 'medium' | 'large';
    className?: string;
}

export const StreakBadge: React.FC<StreakBadgeProps> = ({
    count,
    type = 'current',
    size = 'medium',
    className = '',
}) => {
    const sizeClasses = {
        small: 'px-3 py-1.5 text-sm gap-1.5',
        medium: 'px-4 py-2 text-base gap-2',
        large: 'px-6 py-3 text-lg gap-3',
    };

    const iconSizes = {
        small: 'text-base',
        medium: 'text-xl',
        large: 'text-2xl',
    };

    return (
        <div
            className={`streak-badge ${sizeClasses[size]} ${className}`}
            style={{
                background: type === 'current'
                    ? 'linear-gradient(135deg, rgba(255, 107, 53, 0.1) 0%, rgba(255, 107, 53, 0.05) 100%)'
                    : 'linear-gradient(135deg, rgba(255, 184, 0, 0.1) 0%, rgba(255, 184, 0, 0.05) 100%)',
                borderColor: type === 'current'
                    ? 'rgba(255, 107, 53, 0.2)'
                    : 'rgba(255, 184, 0, 0.2)',
            }}
        >
            <span className={iconSizes[size]}>🔥</span>
            <span className="font-semibold text-white">
                {count} {count === 1 ? 'day' : 'days'}
            </span>
            {type === 'best' && (
                <span className="text-text-tertiary text-xs ml-1">best</span>
            )}
        </div>
    );
};
