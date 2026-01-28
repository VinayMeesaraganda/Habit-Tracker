import React from 'react';
import { colors, categoryColorMap, HabitColor } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { Timer, Bell } from 'lucide-react';

interface ColorfulHabitCardProps {
    name: string;
    schedule: string;
    completed: boolean;
    skipped?: boolean;
    category: string;
    onToggle: () => void;
    onSkip?: () => void;
    onTimer?: () => void;
    timerMinutes?: number;
    reminderTime?: string;
    className?: string;
    disabled?: boolean;
    onClick?: () => void;
}

export const ColorfulHabitCard: React.FC<ColorfulHabitCardProps> = ({
    name,
    schedule,
    completed,
    skipped = false,
    category,
    onToggle,
    onSkip,
    onTimer,
    timerMinutes,
    reminderTime,
    className = '',
    disabled = false,
    onClick,
}) => {
    // Get gradient color based on category with fallback to coral
    const colorKey: HabitColor = categoryColorMap[category] || 'coral';
    const gradient = colors.habitColors[colorKey];

    // Visual states: completed > skipped > normal
    const isSkippedState = skipped && !completed;

    return (
        <div
            onClick={onClick}
            className={`
                relative overflow-hidden transition-all duration-200 
                ${disabled ? 'opacity-50 cursor-not-allowed grayscale' : ''} 
                ${isSkippedState ? 'opacity-60' : ''}
                ${className}
            `}
            style={{
                background: isSkippedState
                    ? `linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)`
                    : completed
                        ? `linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)` // Green when completed
                        : `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`,
                borderRadius: `${radius.lg}px`,
                boxShadow: shadows.card,
                padding: '20px',
                minHeight: '140px',
                width: '100%',
                textAlign: 'left'
            }}
        >
            {/* Completion Toggle Button */}
            <button
                onClick={(e) => {
                    e.stopPropagation();
                    if (!disabled) onToggle();
                }}
                disabled={disabled}
                className="absolute top-3 right-3 flex items-center justify-center transition-all duration-300 z-10 cursor-pointer hover:scale-110 active:scale-95"
                style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: completed
                        ? 'rgba(255, 255, 255, 0.3)' // Semi-transparent white when completed (on green bg)
                        : 'rgba(255, 255, 255, 0.2)', // Semi-transparent when incomplete
                    backdropFilter: 'blur(8px)',
                    border: completed ? 'none' : '2px solid rgba(255,255,255,0.5)',
                    transform: completed ? 'scale(1.1)' : 'scale(1)',
                    boxShadow: completed ? 'none' : 'none'
                }}
            >
                {completed ? (
                    <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="3"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                    >
                        <path d="M5 13l4 4L19 7" />
                    </svg>
                ) : (
                    <div className="w-full h-full rounded-full" />
                )}
            </button>

            {/* Skip button (only shown if NOT completed) */}
            {onSkip && !completed && !disabled && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onSkip();
                    }}
                    className="absolute bottom-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                    style={{
                        background: isSkippedState ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)',
                        color: 'white',
                    }}
                >
                    {isSkippedState ? 'Unskip' : 'Skip'}
                </button>
            )}

            {/* Timer Button (prominent styling) */}
            {timerMinutes && onTimer && !completed && !disabled && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onTimer();
                    }}
                    className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105 active:scale-95 shadow-lg z-20"
                    style={{
                        background: 'white',
                        color: '#F97316', // Orange color for timer
                    }}
                >
                    <Timer className="w-3.5 h-3.5" />
                    <span>Start {timerMinutes}m</span>
                </button>
            )}

            {/* Content */}
            <div>
                <h3
                    className="font-bold text-white mb-1"
                    style={{
                        fontSize: '16px',
                        lineHeight: '1.3',
                        textDecoration: isSkippedState ? 'line-through' : 'none',
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
                    {isSkippedState ? 'Skipped' : (completed ? '🎉 Complete!' : schedule)}
                </p>
                {/* Reminder Badge */}
                {reminderTime && !completed && !isSkippedState && (
                    <div className="flex items-center gap-1 mt-2 text-white/90 bg-black/10 w-fit px-2 py-0.5 rounded-full">
                        <Bell className="w-3 h-3" />
                        <span className="text-xs font-medium">{reminderTime}</span>
                    </div>
                )}
            </div>
        </div>
    );
};
