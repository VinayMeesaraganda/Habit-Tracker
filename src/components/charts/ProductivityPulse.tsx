import React from 'react';


interface ProductivityPulseProps {
    data: { date: string; score: number }[]; // score 0-100
    color?: string;
    height?: number;
}

export const ProductivityPulse: React.FC<ProductivityPulseProps> = ({
    data,
    color = '#4CAF50',
    height = 150
}) => {
    if (data.length < 2) {
        return (
            <div className="flex items-center justify-center text-gray-400 text-sm" style={{ height }}>
                Not enough data for pulse
            </div>
        );
    }

    // Calculations for SVG path
    const maxScore = 100;

    const width = 100; // viewBox width units
    const chartHeight = 100; // viewBox height units

    // Scale X and Y
    const getX = (index: number) => (index / (data.length - 1)) * width;
    const getY = (score: number) => chartHeight - (score / maxScore) * chartHeight;

    // Generate Path
    const points = data.map((d, i) => `${getX(i)},${getY(d.score)}`).join(' ');

    // Generate Fill Area (close the loop)
    const areaPoints = `${points} ${width},${chartHeight} 0,${chartHeight}`;

    return (
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 mb-6 relative overflow-hidden">
            <div className="flex justify-between items-end mb-4">
                <div>
                    <h3 className="text-lg font-bold text-gray-800">Productivity Pulse</h3>
                    <p className="text-xs text-gray-500">Daily Effort Score (Last 30 Days)</p>
                </div>
                <div className="text-2xl font-black" style={{ color }}>
                    {Math.round(data[data.length - 1]?.score || 0)}%
                </div>
            </div>

            <div className="relative w-full" style={{ height: `${height}px` }}>
                <svg
                    width="100%"
                    height="100%"
                    viewBox={`0 0 ${width} ${chartHeight}`}
                    preserveAspectRatio="none"
                    className="overflow-visible"
                >
                    {/* Gradient Definition */}
                    <defs>
                        <linearGradient id="pulseGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                            <stop offset="100%" stopColor={color} stopOpacity="0" />
                        </linearGradient>
                    </defs>

                    {/* Area Fill */}
                    <path
                        d={`M${areaPoints} Z`}
                        fill="url(#pulseGradient)"
                        stroke="none"
                    />

                    {/* Line */}
                    <path
                        d={`M${points}`}
                        fill="none"
                        stroke={color}
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />

                    {/* Points (optional, maybe just for max/min or last) */}
                    {data.map((d, i) => (
                        <circle
                            key={i}
                            cx={getX(i)}
                            cy={getY(d.score)}
                            r="1.5"
                            fill={color}
                        />
                    ))}
                </svg>
            </div>

            {/* Axis Labels (Simplified) */}
            <div className="flex justify-between mt-2 text-[10px] text-gray-400">
                <span>{data[0]?.date.split('-').slice(1).join('/')}</span>
                <span>Today</span>
            </div>
        </div>
    );
};
