import React from 'react';
import { radius } from '../../theme/radius';

interface SimpleBarChartProps {
    data: { label: string; value: number; target: number, fullDate: string }[];
    color: string;
    height?: number;
}

export const SimpleBarChart: React.FC<SimpleBarChartProps> = ({
    data,
    color,
    height = 120
}) => {
    return (
        <div className="w-full" style={{ height: `${height}px` }}>
            <div className="flex h-full items-end justify-between gap-1">
                {data.map((item, index) => {
                    const percentage = Math.min((item.value / item.target) * 100, 100);
                    const isTargetMet = item.value >= item.target;

                    return (
                        <div key={index} className="flex-1 flex flex-col items-center gap-1 group relative h-full">
                            {/* Bar Container */}
                            <div className="w-full relative bg-gray-100 rounded-t-md overflow-hidden"
                                style={{
                                    height: '100%',
                                    borderRadius: `${radius.sm}px ${radius.sm}px ${radius.sm}px ${radius.sm}px` // Fully rounded looks cleaner
                                }}>

                                {/* Target Line (if target is consistent, but here we just fill) */}
                                {/* Fill */}
                                <div
                                    className="absolute bottom-0 left-0 w-full transition-all duration-500"
                                    style={{
                                        height: `${percentage}%`,
                                        background: isTargetMet ? color : '#E5E7EB', // Grey if not met, Color if met (or maybe gradient?)
                                        // Let's try: Color always, but opacity lower if not met? 
                                        // Or better: Use the passed color but maybe desaturated if low.
                                        // Actually simplest is best: Use the color.
                                        backgroundColor: color,
                                        opacity: isTargetMet ? 1 : 0.6
                                    }}
                                />
                            </div>

                            {/* Label */}
                            <span className="text-[10px] text-gray-400 font-medium">
                                {item.label}
                            </span>

                            {/* Tooltip */}
                            <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
                                {item.value} / {item.target}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-800"></div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
