import React, { useState } from 'react';
import { colors, categoryColorMap, HabitColor } from '../../theme/colors';
import { Timer, Bell, SkipForward } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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
    const [isPressed, setIsPressed] = useState(false);

    // Get gradient color based on category with fallback to coral
    const colorKey: HabitColor = categoryColorMap[category] || 'coral';
    const gradient = colors.habitColors[colorKey];

    // Visual states: completed > skipped > normal
    const isSkippedState = skipped && !completed;

    const handleToggle = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled) onToggle();
    };

    const handleSkip = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled && onSkip) onSkip();
    };

    const handleTimer = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!disabled && onTimer) onTimer();
    };

    const handleCardClick = () => {
        if (!disabled && onClick) onClick();
    };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
                opacity: disabled ? 0.6 : 1,
                scale: isPressed ? 0.95 : 1,
                y: isSkippedState ? -2 : 0
            }}
            whileHover={{ y: isSkippedState ? -2 : -4, scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            onMouseDown={() => setIsPressed(true)}
            onMouseUp={() => setIsPressed(false)}
            onMouseLeave={() => setIsPressed(false)}
            onClick={handleCardClick}
            className={`
                relative overflow-hidden cursor-pointer
                ${className}
            `}
            style={{
                background: isSkippedState
                    ? `linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)`
                    : completed
                        ? `linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)`
                        : `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`,
                borderRadius: '16px',
                boxShadow: completed
                    ? '0 8px 24px rgba(76, 175, 80, 0.3)'
                    : isSkippedState
                        ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                        : `0 8px 24px ${gradient.start}40`,
                padding: '20px',
                minHeight: '140px',
                width: '100%',
                textAlign: 'left',
            }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
        >
            {/* Completion Toggle Button */}
            <motion.button
                layout
                onClick={handleToggle}
                disabled={disabled}
                className="absolute top-3 right-3 flex items-center justify-center z-10 cursor-pointer"
                whileHover={{ scale: disabled ? 1 : 1.15 }}
                whileTap={{ scale: disabled ? 1 : 0.9 }}
                style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '50%',
                    backgroundColor: completed
                        ? 'rgba(255, 255, 255, 0.3)'
                        : 'rgba(255, 255, 255, 0.2)',
                    backdropFilter: 'blur(8px)',
                    border: completed ? 'none' : '2px solid rgba(255,255,255,0.5)',
                    boxShadow: completed ? 'none' : '0 2px 8px rgba(0,0,0,0.1)'
                }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
            >
                <AnimatePresence mode="wait">
                    {completed ? (
                        <motion.svg
                            key="check"
                            initial={{ scale: 0, rotate: -180 }}
                            animate={{ scale: 1, rotate: 0 }}
                            exit={{ scale: 0, rotate: 180 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            className="w-6 h-6 text-white"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="3"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path d="M5 13l4 4L19 7" />
                        </motion.svg>
                    ) : (
                        <motion.div
                            key="circle"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0 }}
                            className="w-4 h-4 rounded-full bg-white/50"
                        />
                    )}
                </AnimatePresence>
            </motion.button>

            {/* Skip button (only shown if NOT completed) */}
            <AnimatePresence>
                {onSkip && !completed && !disabled && (
                    <motion.button
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        onClick={handleSkip}
                        className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold max-w-[45%]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: isSkippedState ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.2)',
                            color: 'white',
                        }}
                    >
                        <SkipForward className="w-3 h-3" />
                        {isSkippedState ? 'Unskip' : 'Skip'}
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Timer Button (prominent styling) */}
            <AnimatePresence>
                {timerMinutes && onTimer && !completed && !disabled && (
                    <motion.button
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        onClick={handleTimer}
                        className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold shadow-lg z-20 max-w-[45%]"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'white',
                            color: '#F97316',
                        }}
                    >
                        <Timer className="w-3 h-3 flex-shrink-0" />
                        <span className="truncate">{timerMinutes}m</span>
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Content */}
            <div>
                <motion.h3
                    animate={{
                        textDecoration: isSkippedState ? 'line-through' : 'none',
                        opacity: isSkippedState ? 0.7 : 1
                    }}
                    className="font-bold text-white mb-1 pr-10"
                    style={{
                        fontSize: '17px',
                        lineHeight: '1.3',
                    }}
                >
                    {name}
                </motion.h3>
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/90 text-sm font-medium pr-8"
                >
                    {isSkippedState
                        ? '⏭ Skipped'
                        : completed
                            ? '✨ Complete!'
                            : schedule
                    }
                </motion.p>

                {/* Reminder Badge */}
                <AnimatePresence>
                    {reminderTime && !completed && !isSkippedState && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 10 }}
                            className="flex items-center gap-1 mt-3 text-white/90 bg-black/10 w-fit px-2.5 py-1 rounded-full"
                        >
                            <Bell className="w-3 h-3" />
                            <span className="text-xs font-medium">{reminderTime}</span>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Completion Celebration Effect */}
            <AnimatePresence>
                {completed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 pointer-events-none"
                        style={{
                            background: 'radial-gradient(circle at center, rgba(255,255,255,0.2) 0%, transparent 70%)',
                        }}
                    />
                )}
            </AnimatePresence>
        </motion.div>
    );
};
