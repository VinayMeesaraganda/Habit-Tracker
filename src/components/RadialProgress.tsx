

interface RadialProgressProps {
    percentage: number;
    label: string;
    sublabel?: string;
    color?: string;
    size?: number;
}

export function RadialProgress({
    percentage,
    label,
    sublabel,
    color = '#6C47FF', // Default to primary purple
    size = 120
}: RadialProgressProps) {
    const strokeWidth = size < 60 ? 4 : 8; // Thinner stroke for small rings
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (percentage / 100) * circumference;

    // Dynamic Text Size
    let textSizeClass = 'text-2xl';
    if (size < 60) textSizeClass = 'text-[10px]';
    else if (size < 100) textSizeClass = 'text-lg';

    return (
        <div className="flex flex-col items-center justify-center">
            <div className="relative" style={{ width: size, height: size }}>
                {/* Background Circle */}
                <svg className="transform -rotate-90 w-full h-full">
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke="#E5E7EB" // gray-200
                        strokeWidth={strokeWidth}
                        fill="transparent"
                    />
                    {/* Progress Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        stroke={color}
                        strokeWidth={strokeWidth}
                        fill="transparent"
                        strokeDasharray={circumference}
                        strokeDashoffset={offset}
                        strokeLinecap="round"
                        className="transition-all duration-1000 ease-out"
                    />
                </svg>
                {/* Center Text */}
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className={`${textSizeClass} font-bold text-gray-900`}>{Math.round(percentage)}%</span>
                </div>
            </div>
            {/* Labels */}
            {label && (
                <div className="mt-2 text-center">
                    <div className="text-sm font-bold text-gray-700 uppercase tracking-wide">{label}</div>
                    {sublabel && <div className="text-xs text-gray-500 font-medium">{sublabel}</div>}
                </div>
            )}
        </div>
    );
}
