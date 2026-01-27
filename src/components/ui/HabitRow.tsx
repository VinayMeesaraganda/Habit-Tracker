import React from 'react';

interface HabitRowProps {
    icon: string;
    name: string;
    metadata?: string;
    completed: boolean;
    onToggle: () => void;
    className?: string;
    // New props for enhanced functionality
    streak?: number;
    monthlyProgress?: { completed: number; goal: number };
    onEdit?: () => void;
    showActions?: boolean;
}

export const HabitRow: React.FC<HabitRowProps> = ({
    icon,
    name,
    metadata,
    completed,
    onToggle,
    className = '',
    streak,
    monthlyProgress,
    onEdit,
    showActions = false,
}) => {
    return (
        <div className={`habit-row ${className}`}>
            {/* Icon */}
            <div className="flex-shrink-0 text-3xl">
                {icon}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                    <h3 className="text-base font-medium text-text-primary truncate">
                        {name}
                    </h3>
                    {/* Streak Badge */}
                    {streak && streak > 0 && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-accent-fire/10 border border-accent-fire/20">
                            <span className="text-sm">🔥</span>
                            <span className="text-xs font-bold text-accent-fire">{streak}</span>
                        </div>
                    )}
                </div>

                {/* Metadata with monthly progress */}
                <div className="flex flex-col gap-0.5 mt-1">
                    {metadata && (
                        <p className="text-sm text-text-tertiary">
                            {metadata}
                        </p>
                    )}
                    {monthlyProgress && (
                        <p className="text-xs text-text-secondary font-medium">
                            {monthlyProgress.completed}/{monthlyProgress.goal} this month
                        </p>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0">
                {/* Edit Button */}
                {showActions && onEdit && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEdit();
                        }}
                        className="p-2 text-text-tertiary hover:text-text-primary transition-colors rounded-lg hover:bg-white/5"
                        aria-label="Edit habit"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                    </button>
                )}

                {/* Checkbox */}
                <div
                    className={`checkbox ${completed ? 'checked' : ''}`}
                    onClick={(e) => {
                        e.stopPropagation();
                        onToggle();
                    }}
                >
                    {completed && (
                        <svg
                            className="w-5 h-5 text-white animate-check"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M5 13l4 4L19 7" />
                        </svg>
                    )}
                </div>
            </div>
        </div>
    );
};
