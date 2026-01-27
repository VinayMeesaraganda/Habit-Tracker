import React from 'react';

interface ProgressRingProps {
    percentage: number;
    size?: 'small' | 'medium' | 'large';
    strokeWidth?: number;
    color?: string;
    backgroundColor?: string;
    showPercentage?: boolean;
    animate?: boolean;
    className?: string;
}

export const ProgressRing: React.FC<ProgressRingProps> = ({
    percentage,
    size = 'large',
    strokeWidth,
    color = '#00D9A3',
    backgroundColor = '#1A1A1A',
    showPercentage = true,
    animate = true,
    className = '',
}) => {
    // Size configurations
    const sizeConfig = {
        small: { diameter: 80, defaultStroke: 6 },
        medium: { diameter: 120, defaultStroke: 8 },
        large: { diameter: 160, defaultStroke: 8 },
    };

    const { diameter, defaultStroke } = sizeConfig[size];
    const stroke = strokeWidth || defaultStroke;
    const radius = (diameter - stroke) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    return (
        <div className={`relative inline-flex items-center justify-center ${className}`}>
            <svg
                width={diameter}
                height={diameter}
                className="transform -rotate-90"
            >
                {/* Background circle */}
                <circle
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={radius}
                    stroke={backgroundColor}
                    strokeWidth={stroke}
                    fill="none"
                />

                {/* Progress circle */}
                <circle
                    cx={diameter / 2}
                    cy={diameter / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={stroke}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className={animate ? 'transition-all duration-slow ease-out' : ''}
                    style={{
                        filter: percentage === 100 ? `drop-shadow(0 0 8px ${color})` : 'none',
                    }}
                />
            </svg>

            {/* Percentage text */}
            {showPercentage && (
                <div className="absolute inset-0 flex items-center justify-center">
                    <span
                        className={`font-semibold ${size === 'large' ? 'text-metric-lg' :
                                size === 'medium' ? 'text-metric-md' :
                                    'text-metric-sm'
                            }`}
                        style={{ color }}
                    >
                        {Math.round(percentage)}%
                    </span>
                </div>
            )}
        </div>
    );
};
