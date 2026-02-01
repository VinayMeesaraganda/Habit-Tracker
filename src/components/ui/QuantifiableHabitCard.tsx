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
                            backgroundColor: gradient.icon,
                            boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
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
                                background: isSkippedState ? '#9CA3AF' : 'rgba(255,255,255,0.6)',
                                color: isSkippedState ? 'white' : gradient.text,
                            }}
                        >
                            {isSkippedState ? 'Unskip' : 'Skip'}
                        </button>
                    )
                )}
            </div>

            <h3
                className="font-bold text-base mb-1 pr-10"
                style={{
                    textDecoration: isSkippedState ? 'line-through' : 'none',
                    color: isSkippedState ? '#4B5563' : gradient.text
                }}
            >
                {habit.name}
            </h3>

            {/* Progress Text with Edit Icon */}
            <div className="flex items-center gap-2 mb-2">
                <p className="text-xs" style={{ color: isSkippedState ? '#6B7280' : gradient.text, opacity: 0.8 }}>
                    {isSkippedState ? 'Skipped' : `${currentValue} / ${targetValue} ${habit.unit}`}
                </p>
                {!disabled && onUpdateValue && (
                    <button
                        onClick={handleEditClick}
                        className="p-1 rounded-full hover:bg-black/5 transition-colors"
                        style={{ color: isSkippedState ? '#6B7280' : gradient.text, opacity: 0.7 }}
                    >
                        <Edit2 className="w-3 h-3" />
                    </button>
                )}
                {reminderTime && !isComplete && !isSkippedState && (
                    <span
                        className="flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full"
                        style={{ backgroundColor: 'rgba(0,0,0,0.05)', color: gradient.text }}
                    >
                        <Bell className="w-3 h-3" />
                        {reminderTime}
                    </span>
                )}
            </div>

            {/* Progress Bar */}
            <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: 'rgba(0,0,0,0.06)' }}>
                <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                        width: `${percentage}%`,
                        background: gradient.icon,
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
                                className="flex-1 px-3 py-2 rounded-xl text-sm font-medium bg-white placeholder-gray-400 focus:outline-none focus:ring-2"
                                style={{
                                    color: gradient.text,
                                    borderColor: 'rgba(0,0,0,0.1)',
                                    '--tw-ring-color': gradient.text + '40'
                                } as React.CSSProperties}
                            />
                            <button
                                type="button"
                                onClick={() => handleSubmit()}
                                className="px-4 py-2 rounded-xl font-bold text-sm transition-all active:scale-95 whitespace-nowrap"
                                style={{
                                    background: 'white',
                                    color: gradient.text,
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
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
                                className="w-full py-2 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-95 hover:bg-white/80"
                                style={{
                                    background: 'rgba(255,255,255,0.7)',
                                    color: gradient.text,
                                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                                }}
                            >
                                <Plus className="w-4 h-4" strokeWidth={2.5} />
                                Add {habit.unit}
                            </button>
                        )
                    )}
                </div>
            )}

            {/* Completed Message */}
            {isComplete && !showInput && (
                <div
                    className="text-center text-sm font-bold mt-3"
                    style={{ color: gradient.text }}
                >
                    🎉 Complete!
                </div>
            )}
        </div>
    );
};
