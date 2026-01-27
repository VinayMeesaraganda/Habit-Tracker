/**
 * FocusTimer - Pomodoro-style focus timer component
 * Can be linked to a habit for auto-completion
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, RotateCcw, Check, X } from 'lucide-react';
import { Habit } from '../types';
import { colors, categoryColorMap, HabitColor } from '../theme/colors';

interface FocusTimerProps {
    habit: Habit;
    isOpen: boolean;
    onClose: () => void;
    onComplete: () => void;
}

export const FocusTimer: React.FC<FocusTimerProps> = ({
    habit,
    isOpen,
    onClose,
    onComplete,
}) => {
    const duration = (habit.timer_minutes || 25) * 60; // Convert to seconds
    const [timeLeft, setTimeLeft] = useState(duration);
    const [isRunning, setIsRunning] = useState(false);
    const [isCompleted, setIsCompleted] = useState(false);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Reset timer when habit changes or modal opens
    useEffect(() => {
        if (isOpen) {
            setTimeLeft(duration);
            setIsRunning(false);
            setIsCompleted(false);
        }
    }, [isOpen, duration]);

    // Timer logic
    useEffect(() => {
        if (isRunning && timeLeft > 0) {
            intervalRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        // Timer finished
                        setIsRunning(false);
                        setIsCompleted(true);
                        // Play notification sound
                        try {
                            audioRef.current = new Audio('/timer-complete.mp3');
                            audioRef.current.play().catch(() => { });
                        } catch { }
                        // Vibrate on mobile
                        if (navigator.vibrate) {
                            navigator.vibrate([200, 100, 200]);
                        }
                        // Auto-complete if enabled
                        if (habit.auto_complete) {
                            setTimeout(() => {
                                onComplete();
                            }, 1000);
                        }
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [isRunning, timeLeft, habit.auto_complete, onComplete]);

    const toggleTimer = useCallback(() => {
        setIsRunning(prev => !prev);
    }, []);

    const resetTimer = useCallback(() => {
        setIsRunning(false);
        setTimeLeft(duration);
        setIsCompleted(false);
    }, [duration]);

    const formatTime = (seconds: number): string => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    // Progress percentage
    const progress = ((duration - timeLeft) / duration) * 100;

    // Get gradient color based on category
    const colorKey: HabitColor = categoryColorMap[habit.category] || 'coral';
    const gradient = colors.habitColors[colorKey];

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/90 backdrop-blur-md"
                onClick={onClose}
            />

            {/* Timer Card */}
            <div
                className="relative w-full max-w-sm p-8 rounded-3xl shadow-2xl animate-scale-in"
                style={{
                    background: `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`,
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-white/60 hover:text-white transition-colors"
                >
                    <X className="w-6 h-6" />
                </button>

                {/* Habit Name */}
                <h2 className="text-xl font-bold text-white text-center mb-6">
                    {habit.name}
                </h2>

                {/* Circular Progress */}
                <div className="relative flex items-center justify-center mb-6">
                    {/* Progress Ring */}
                    <svg className="w-48 h-48 -rotate-90">
                        {/* Background Circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            fill="none"
                            stroke="rgba(255,255,255,0.2)"
                            strokeWidth="8"
                        />
                        {/* Progress Circle */}
                        <circle
                            cx="96"
                            cy="96"
                            r="88"
                            fill="none"
                            stroke="white"
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 88}
                            strokeDashoffset={2 * Math.PI * 88 * (1 - progress / 100)}
                            className="transition-all duration-500"
                        />
                    </svg>

                    {/* Time Display */}
                    <div className="absolute flex flex-col items-center">
                        <span className="text-5xl font-bold text-white tracking-tight">
                            {formatTime(timeLeft)}
                        </span>
                        <span className="text-sm text-white/70 mt-1">
                            {isCompleted ? 'Complete!' : isRunning ? 'Focus...' : 'Ready'}
                        </span>
                    </div>
                </div>

                {/* Controls */}
                <div className="flex justify-center gap-4">
                    {/* Reset Button */}
                    <button
                        onClick={resetTimer}
                        className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.2)' }}
                    >
                        <RotateCcw className="w-5 h-5 text-white" />
                    </button>

                    {/* Play/Pause Button */}
                    <button
                        onClick={toggleTimer}
                        disabled={isCompleted}
                        className="w-16 h-16 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 disabled:opacity-50"
                        style={{ background: 'rgba(255,255,255,0.3)' }}
                    >
                        {isRunning ? (
                            <Pause className="w-7 h-7 text-white" />
                        ) : (
                            <Play className="w-7 h-7 text-white ml-1" />
                        )}
                    </button>

                    {/* Complete Button (if not auto-complete) */}
                    {isCompleted && !habit.auto_complete && (
                        <button
                            onClick={onComplete}
                            className="w-12 h-12 rounded-full flex items-center justify-center transition-all hover:scale-110 active:scale-95 bg-green-500"
                        >
                            <Check className="w-5 h-5 text-white" />
                        </button>
                    )}
                </div>

                {/* Auto-complete indicator */}
                {habit.auto_complete && (
                    <p className="text-center text-white/60 text-xs mt-4">
                        Will auto-complete when timer finishes
                    </p>
                )}
            </div>
        </div>
    );
};
