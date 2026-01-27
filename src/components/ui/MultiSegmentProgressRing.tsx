import React from 'react';

interface MultiSegmentProgressRingProps {
    completed: number;
    remaining: number;
    overdue: number;
    size?: number;
    strokeWidth?: number;
}

export const MultiSegmentProgressRing: React.FC<MultiSegmentProgressRingProps> = ({
    completed,
    remaining,
    overdue,
    size = 140,
    strokeWidth = 14,
}) => {
    const total = completed + remaining + overdue;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Calculate segment lengths
    const completedLength = total > 0 ? (completed / total) * circumference : 0;
    const remainingLength = total > 0 ? (remaining / total) * circumference : 0;
    const overdueLength = total > 0 ? (overdue / total) * circumference : 0;

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="#F0F0F0"
                    strokeWidth={strokeWidth}
                />

                {/* Completed segment (amber) */}
                {completed > 0 && (
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#FFD97D"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${completedLength} ${circumference}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                    />
                )}

                {/* Remaining segment (coral) */}
                {remaining > 0 && (
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#FF7A6B"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${remainingLength} ${circumference}`}
                        strokeDashoffset={-completedLength}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                    />
                )}

                {/* Overdue segment (dark) */}
                {overdue > 0 && (
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#2D2D2D"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${overdueLength} ${circumference}`}
                        strokeDashoffset={-(completedLength + remainingLength)}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                    />
                )}
            </svg>

            {/* Center percentage */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-gray-900">{percentage}%</span>
                <span className="text-xs text-gray-500 font-medium mt-1">Habit Score</span>
            </div>
        </div>
    );
};
