import React from 'react';

interface SegmentedControlProps {
    options: string[];
    selected: string;
    onChange: (option: string) => void;
    className?: string;
}

export const SegmentedControl: React.FC<SegmentedControlProps> = ({
    options,
    selected,
    onChange,
    className = '',
}) => {
    return (
        <div
            className={`p-1 bg-gray-100 rounded-xl flex gap-1 ${className}`}
            style={{
                border: '1px solid #E5E7EB', // Slate 200
            }}
        >
            {options.map((option) => {
                const isSelected = selected === option;
                return (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onChange(option)}
                        className={`
                            flex-1 py-1.5 px-3 rounded-lg text-sm font-semibold transition-all duration-200
                            ${isSelected ? 'shadow-sm' : 'hover:bg-gray-200/50'}
                        `}
                        style={{
                            background: isSelected ? '#FFFFFF' : 'transparent',
                            color: isSelected ? '#1F2937' : '#6B7280', // Gray 800 vs Gray 500
                        }}
                    >
                        {option}
                    </button>
                );
            })}
        </div>
    );
};
