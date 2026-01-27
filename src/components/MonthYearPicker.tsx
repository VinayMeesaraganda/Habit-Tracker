import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { setMonth, setYear } from 'date-fns';

interface MonthYearPickerProps {
    isOpen: boolean;
    onClose: () => void;
    selectedDate: Date;
    onSelect: (date: Date) => void;
}

export const MonthYearPicker: React.FC<MonthYearPickerProps> = ({
    isOpen,
    onClose,
    selectedDate,
    onSelect
}) => {
    const [viewYear, setViewYear] = React.useState(selectedDate.getFullYear());

    React.useEffect(() => {
        if (isOpen) {
            setViewYear(selectedDate.getFullYear());
        }
    }, [isOpen, selectedDate]);

    if (!isOpen) return null;

    const months = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const handleMonthSelect = (monthIndex: number) => {
        const newDate = setMonth(setYear(selectedDate, viewYear), monthIndex);
        onSelect(newDate);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            />

            <div className="relative bg-white w-full max-w-sm rounded-2xl shadow-xl overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <button
                        onClick={() => setViewYear(viewYear - 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-500" />
                    </button>
                    <span className="text-lg font-bold text-gray-800">
                        {viewYear}
                    </span>
                    <button
                        onClick={() => setViewYear(viewYear + 1)}
                        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Months Grid */}
                <div className="grid grid-cols-3 gap-2 p-4">
                    {months.map((month, index) => {
                        const isSelected =
                            selectedDate.getMonth() === index &&
                            selectedDate.getFullYear() === viewYear;

                        const isCurrent =
                            new Date().getMonth() === index &&
                            new Date().getFullYear() === viewYear;

                        return (
                            <button
                                key={month}
                                onClick={() => handleMonthSelect(index)}
                                className={`
                                    py-3 rounded-xl text-sm font-semibold transition-all
                                    ${isSelected
                                        ? 'bg-primary-500 text-white shadow-md transform scale-105'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }
                                    ${isCurrent && !isSelected ? 'border-2 border-primary-500 text-primary-600' : ''}
                                `}
                                style={{
                                    backgroundColor: isSelected ? '#FF7A6B' : undefined,
                                    color: isSelected ? 'white' : undefined,
                                    borderColor: isCurrent && !isSelected ? '#FF7A6B' : undefined
                                }}
                            >
                                {month}
                            </button>
                        );
                    })}
                </div>

                <div className="p-4 border-t border-gray-100">
                    <button
                        onClick={onClose}
                        className="w-full py-3 rounded-xl bg-gray-100 text-gray-600 font-semibold hover:bg-gray-200 transition-colors"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};
