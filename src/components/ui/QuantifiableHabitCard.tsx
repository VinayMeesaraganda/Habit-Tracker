import React, { useState } from 'react';
import { Habit, HabitLog } from '../../types';
import { colors, categoryColorMap, HabitColor } from '../../theme/colors';
import { radius } from '../../theme/radius';
import { shadows } from '../../theme/shadows';
import { Plus, Check, Edit2, Bell } from 'lucide-react';

interface QuantifiableHabitCardProps {
    habit: Habit;
    logs: HabitLog[];
    onAddValue: (value: number) => void;
    onUpdateValue?: (value: number) => void;
    onSkip?: () => void;
    skipped?: boolean;
    onClick?: () => void;
    className?: string;
    disabled?: boolean;
    reminderTime?: string;
}

export const QuantifiableHabitCard: React.FC<QuantifiableHabitCardProps> = ({
    habit,
    logs,
    onAddValue,
    onUpdateValue,
    onSkip,
    skipped = false,
    onClick,
    className = '',
    disabled = false,
    reminderTime,
}) => {
    const [showInput, setShowInput] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [isEditing, setIsEditing] = useState(false);

    // Calculate current progress
    const currentValue = logs.reduce((sum, log) => sum + (log.value || 0), 0);
    const targetValue = habit.target_value || 1;

    const percentage = Math.min(Math.round((currentValue / targetValue) * 100), 100);
    const isComplete = currentValue >= targetValue;
    const isSkippedState = skipped && !isComplete;

    // Get gradient color based on category
    const colorKey: HabitColor = categoryColorMap[habit.category] || 'coral';
    const gradient = colors.habitColors[colorKey];

    const handleAddClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        setIsEditing(false);
        setInputValue('');
        setShowInput(true);
    };

    const handleEditClick = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (disabled) return;
        setIsEditing(true);
        setInputValue(currentValue.toString());
        setShowInput(true);
    };

    const handleSubmit = (e?: React.FormEvent) => {
        e?.preventDefault();
        const value = parseFloat(inputValue);
        if (!isNaN(value) && value >= 0) {
            if (isEditing && onUpdateValue) {
                onUpdateValue(value);
            } else {
                onAddValue(value);
            }
            setInputValue('');
            setShowInput(false);
            setIsEditing(false);
        }
    };

    const handleInputKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        } else if (e.key === 'Escape') {
            setShowInput(false);
            setInputValue('');
            setIsEditing(false);
        }
    };

    return (
        <div
            className={`
                relative overflow-hidden transition-all duration-200
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:scale-105 active:scale-95'}
                ${className}
            `}
            style={{
                background: isSkippedState
                    ? `linear-gradient(135deg, #9CA3AF 0%, #6B7280 100%)`
                    : isComplete
                        ? `linear-gradient(135deg, #4CAF50 0%, #66BB6A 100%)`
                        : `linear-gradient(135deg, ${gradient.start} 0%, ${gradient.end} 100%)`,
                borderRadius: `${radius.lg}px`,
                boxShadow: shadows.card,
                padding: '20px',
                minHeight: '140px',
                width: '100%',
            }}
            onClick={onClick}
        >
            {/* Top Right Actions (Checkmark or Skip) */}
            <div className="absolute top-3 right-3 z-20">
                {isComplete && !isEditing ? (
                    <div
                        className="flex items-center justify-center animate-scale-in"
                        style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '50%',
                            backgroundColor: 'rgba(255, 255, 255, 0.3)',
                        }}
                    >
                        <Check className="w-4 h-4 text-white" strokeWidth={3} />
                    </div>
                ) : (
                    onSkip && !disabled && !showInput && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onSkip();
                            }}
                            className="px-3 py-1.5 rounded-full text-xs font-bold transition-all hover:scale-105"
                            style={{
                                background: isSkippedState ? 'rgba(255,255,255,0.4)' : 'rgba(255, 255, 255, 0.2)',
                                color: 'white',
                                backdropFilter: 'blur(10px)',
                            }}
                        >
                            {isSkippedState ? 'Unskip' : 'Skip'}
                        </button>
                    )
                )}
            </div>

            <h3 className="font-bold text-white text-base mb-1" style={{ textDecoration: isSkippedState ? 'line-through' : 'none' }}>{habit.name}</h3>

            {/* Progress Text with Edit Icon */}
            <div className="flex items-center gap-2 mb-3">
                <p className="text-white/80 text-xs">
                    {isSkippedState ? 'Skipped' : `${currentValue} / ${targetValue} ${habit.unit}`}
                </p>
                {!disabled && onUpdateValue && (
                    <button
                        onClick={handleEditClick}
                        className="p-1 rounded-full hover:bg-white/20 transition-colors"
                        style={{ color: 'rgba(255,255,255,0.7)' }}
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                )}
                {reminderTime && !isComplete && !isSkippedState && (
                    <span className="flex items-center gap-1 text-xs font-medium text-white/80 bg-white/20 px-2 py-0.5 rounded-full">
                        <Bell className="w-3 h-3" />
                        {reminderTime}
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="h-2 bg-white/20 rounded-full mb-3 overflow-hidden">
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${percentage}%`,
                        background: 'rgba(255,255,255,0.8)',
                    }}
                />
            </div>

            {/* Add/Edit Input Area */}
            {!disabled && !isSkippedState && (
                <div onClick={e => e.stopPropagation()}>
                    {showInput ? (
                        <div className="flex gap-2">
                            <input
                                type="number"
                                inputMode="numeric"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleInputKeyDown}
                                placeholder={isEditing ? 'Total' : (habit.unit || 'Amount')}
                                autoFocus
                                className="flex-1 px-3 py-3 rounded-xl text-sm font-medium bg-white text-gray-800 placeholder-gray-400 border-2 border-white focus:outline-none"
                                style={{ minWidth: '80px' }}
                            />
                            <button
                                type="button"
                                onClick={() => handleSubmit()}
                                className="px-4 py-3 rounded-xl font-bold text-sm transition-all active:scale-95 whitespace-nowrap"
                                style={{
                                    background: 'white',
                                    color: '#374151',
                                }}
                            >
                                {isEditing ? 'Save' : 'Add'}
                            </button>
                        </div>
                    ) : (
                        !isComplete && (
                            <button
                                type="button"
                                onClick={handleAddClick}
                                className="w-full py-3 rounded-xl font-bold text-base flex items-center justify-center gap-2 transition-all active:scale-95"
                                style={{
                                    background: 'white',
                                    color: '#374151',
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                                }}
                            >
                                <Plus className="w-5 h-5" strokeWidth={2.5} />
                                Add {habit.unit}
                            </button>
                        )
                    )}
                </div>
            )}

            {/* Completed Message */}
            {isComplete && !showInput && (
                <div className="text-center text-white/90 text-sm font-medium mt-3">
                    🎉 Complete!
                </div>
            )}
        </div>
    );
};
