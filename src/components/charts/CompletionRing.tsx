import React, { useEffect, useState } from 'react';

interface CompletionRingProps {
    percentage: number;
    completedDays: number;
    totalDays: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export const CompletionRing: React.FC<CompletionRingProps> = ({
    percentage,
    completedDays,
    totalDays,
    size = 200,
    strokeWidth = 16
}) => {
    const [animatedPercentage, setAnimatedPercentage] = useState(0);

    // Animate on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedPercentage(percentage);
        }, 100);
        return () => clearTimeout(timer);
    }, [percentage]);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const offset = circumference - (animatedPercentage / 100) * circumference;

    // Color gradient based on percentage
    const getGradientColors = () => {
        if (percentage >= 80) return { start: '#10B981', end: '#34D399' }; // Green
        if (percentage >= 60) return { start: '#3B82F6', end: '#60A5FA' }; // Blue
        if (percentage >= 40) return { start: '#F59E0B', end: '#FBBF24' }; // Yellow
        return { start: '#FF7A6B', end: '#FF9A8B' }; // Coral/Orange
    };

    const gradientColors = getGradientColors();
    const gradientId = `ring-gradient-${Math.random().toString(36).substr(2, 9)}`;

    return (
        <div className="flex flex-col items-center">
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={gradientColors.start} />
                            <stop offset="100%" stopColor={gradientColors.end} />
                        </linearGradient>
                    </defs>

                    {/* Background ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth={strokeWidth}
                    />

                    {/* Progress ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        style={{
                            transition: 'stroke-dashoffset 1s ease-out'
                        }}
                    />
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span
                        className="font-black text-gray-900"
                        style={{ fontSize: size * 0.22 }}
                    >
                        {Math.round(percentage)}%
                    </span>
                    <span
                        className="text-gray-500 font-medium"
                        style={{ fontSize: size * 0.08 }}
                    >
                        Completed
                    </span>
                </div>
            </div>

            {/* Perfect Days Counter */}
            <div className="mt-4 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
                <span className="text-2xl font-black text-gray-900">{completedDays}</span>
                <span className="text-gray-400 font-medium">/</span>
                <span className="text-lg font-semibold text-gray-500">{totalDays} perfect days</span>
            </div>
        </div>
    );
};
