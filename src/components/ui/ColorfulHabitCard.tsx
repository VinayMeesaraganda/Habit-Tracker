import React from 'react';
import { colors, categoryColorMap, HabitColor } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';

interface ColorfulHabitCardProps {
    icon: string;
    name: string;
    schedule: string;
    completed: boolean;
    category: string;
    onToggle: () => void;
    className?: string;
    disabled?: boolean;
}

export const ColorfulHabitCard: React.FC<ColorfulHabitCardProps> = ({
    icon,
    name,
    schedule,
    completed,
    category,
    onToggle,
    className = '',
    disabled = false,
}) => {
    // Get gradient color based on category with fallback to coral
    const colorKey: HabitColor = categoryColorMap[category] || 'coral';
    const gradient = colors.habitColors[colorKey];

    return (
        <button
            disabled={disabled}
            className={`
                relative overflow-hidden transition-all duration-200 
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : 'cursor-pointer hover:scale-105 active:scale-95'} 
                ${className}
            `}
            style={{
                background: `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`,
                borderRadius: `${radius.lg}px`,
                boxShadow: shadows.card,
                padding: '20px',
                minHeight: '140px',
                width: '100%',
                textAlign: 'left'
            }}
            onClick={onToggle}
        >
            {/* Checkmark */}
            {completed && (
                <div
                    className="absolute top-3 right-3 flex items-center justify-center animate-scale-in"
                    style={{
                        width: '28px',
                        height: '28px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        backdropFilter: 'blur(10px)',
                    }}
                >
                    <svg
                        className="w-4 h-4 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                </div>
            )}

            {/* Icon */}
            <div className="text-4xl mb-3">{icon}</div>

            {/* Content */}
            <div>
                <h3
                    className="font-bold text-white mb-1"
                    style={{
                        fontSize: '16px',
                        lineHeight: '1.3',
                    }}
                >
                    {name}
                </h3>
                <p
                    className="text-white/90"
                    style={{
                        fontSize: '13px',
                        fontWeight: 500,
                    }}
                >
                    {schedule}
                </p>
            </div>
        </button>
    );
};
