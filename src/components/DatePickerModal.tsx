import React, { useState } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, addMonths, subMonths } from 'date-fns';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

interface DatePickerModalProps {
    isOpen: boolean;
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
    onClose: () => void;
}

export const DatePickerModal: React.FC<DatePickerModalProps> = ({
    isOpen,
    selectedDate,
    onDateSelect,
    onClose,
}) => {
    const [viewMonth, setViewMonth] = useState(selectedDate);

    if (!isOpen) return null;

    const monthStart = startOfMonth(viewMonth);
    const monthEnd = endOfMonth(viewMonth);
    const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

    // Get day of week for first day (0 = Sunday)
    const firstDayOfWeek = monthStart.getDay();

    // Add empty cells for days before month starts
    const emptyDays = Array(firstDayOfWeek).fill(null);

    const handleDateClick = (date: Date) => {
        onDateSelect(date);
        onClose();
    };

    const handlePreviousMonth = () => {
        setViewMonth(subMonths(viewMonth, 1));
    };

    const handleNextMonth = () => {
        setViewMonth(addMonths(viewMonth, 1));
    };

    const handleReset = () => {
        const today = new Date();
        setViewMonth(today);
        onDateSelect(today);
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="rounded-2xl p-6 max-w-md w-full"
                style={{ background: '#FFFFFF' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold" style={{ color: '#1F1F1F' }}>
                        {format(selectedDate, 'MMM d, yyyy')}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <X className="w-5 h-5" style={{ color: '#6B6B6B' }} />
                    </button>
                </div>

                {/* Month Navigation */}
                <div className="flex items-center justify-between mb-4">
                    <button
                        onClick={handlePreviousMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5" style={{ color: '#6B6B6B' }} />
                    </button>
                    <span className="font-semibold" style={{ color: '#1F1F1F' }}>
                        {format(viewMonth, 'MMMM yyyy')}
                    </span>
                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5" style={{ color: '#6B6B6B' }} />
                    </button>
                </div>

                {/* Day Headers */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                    {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div
                            key={day}
                            className="text-center text-xs font-medium py-2"
                            style={{ color: '#9E9E9E' }}
                        >
                            {day}
                        </div>
                    ))}
                </div>

                {/* Calendar Grid */}
                <div className="grid grid-cols-7 gap-1 mb-4">
                    {emptyDays.map((_, index) => (
                        <div key={`empty-${index}`} className="aspect-square" />
                    ))}
                    {daysInMonth.map(day => {
                        const isSelected = isSameDay(day, selectedDate);
                        const isToday = isSameDay(day, new Date());
                        const isCurrentMonth = isSameMonth(day, viewMonth);

                        return (
                            <button
                                key={day.toISOString()}
                                onClick={() => handleDateClick(day)}
                                className="aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all hover:scale-105"
                                style={{
                                    background: isSelected ? '#FF7A6B' : isToday ? '#FFE5E3' : 'transparent',
                                    color: isSelected ? '#FFFFFF' : isCurrentMonth ? '#1F1F1F' : '#CCCCCC',
                                }}
                            >
                                {format(day, 'd')}
                            </button>
                        );
                    })}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <button
                        onClick={handleReset}
                        className="flex-1 py-3 rounded-xl font-semibold transition-all"
                        style={{
                            background: '#F5F5F5',
                            color: '#6B6B6B',
                        }}
                    >
                        Reset
                    </button>
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl font-semibold transition-all"
                        style={{
                            background: '#FF7A6B',
                            color: '#FFFFFF',
                        }}
                    >
                        Done
                    </button>
                </div>
            </div>
        </div>
    );
};
