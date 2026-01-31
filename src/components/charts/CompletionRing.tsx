import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface CompletionRingProps {
    percentage: number;
    completedDays: number;
    totalDays: number;
    size?: number;
    strokeWidth?: number;
    color?: string;
}

export const CompletionRing: React.FC<CompletionRingProps> = ({
    percentage,
    completedDays,
    totalDays,
    size = 200,
    strokeWidth = 16
}) => {
    const [animatedPercentage, setAnimatedPercentage] = useState(0);

    // Animate on mount
    useEffect(() => {
        const timer = setTimeout(() => {
            setAnimatedPercentage(percentage);
        }, 100);
        return () => clearTimeout(timer);
    }, [percentage]);

    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (animatedPercentage / 100) * circumference;

    // Color gradient based on percentage
    const getGradientColors = () => {
        if (percentage >= 80) return { start: '#10B981', end: '#34D399' }; // Green
        if (percentage >= 60) return { start: '#3B82F6', end: '#60A5FA' }; // Blue
        if (percentage >= 40) return { start: '#F59E0B', end: '#FBBF24' }; // Yellow
        return { start: '#FF7A6B', end: '#FF9A8B' }; // Coral/Orange
    };

    const gradientColors = getGradientColors();
    const gradientId = `ring-gradient-${Math.random().toString(36).substr(2, 9)}`;
    const isComplete = percentage >= 100;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="flex flex-col items-center"
        >
            <div className="relative" style={{ width: size, height: size }}>
                <svg
                    width={size}
                    height={size}
                    className="transform -rotate-90"
                >
                    <defs>
                        <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor={gradientColors.start} />
                            <stop offset="100%" stopColor={gradientColors.end} />
                        </linearGradient>
                        <filter id="ringGlow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                            <feMerge>
                                <feMergeNode in="coloredBlur" />
                                <feMergeNode in="SourceGraphic" />
                            </feMerge>
                        </filter>
                    </defs>

                    {/* Background ring */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#E5E7EB"
                        strokeWidth={strokeWidth}
                    />

                    {/* Progress ring with animation */}
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={`url(#${gradientId})`}
                        strokeWidth={strokeWidth}
                        strokeLinecap="round"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        filter={isComplete ? "url(#ringGlow)" : "none"}
                    />

                    {/* Glow effect ring */}
                    {isComplete && (
                        <motion.circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            fill="none"
                            stroke="#10B981"
                            strokeWidth={strokeWidth * 2}
                            strokeLinecap="round"
                            opacity={0.3}
                            strokeDasharray={circumference}
                            initial={{ strokeDashoffset: circumference }}
                            animate={{ strokeDashoffset }}
                            transition={{ duration: 1.2, ease: "easeOut" }}
                            style={{ filter: 'blur(8px)' }}
                        />
                    )}
                </svg>

                {/* Center Content */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        key={Math.round(animatedPercentage)}
                        initial={{ opacity: 0.5, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className={`font-black ${
                            isComplete 
                                ? 'text-green-500' 
                                : percentage >= 60 
                                    ? 'text-blue-500' 
                                    : percentage >= 40 
                                        ? 'text-yellow-500' 
                                        : 'text-orange-500'
}`}
                        style={{ fontSize: size * 0.22 }}
                    >
                        {Math.round(animatedPercentage)}%
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="text-gray-500 font-semibold"
                        style={{ fontSize: size * 0.08 }}
                    >
                        {isComplete ? 'Perfect Month! 🌟' : 'Completed'}
                    </motion.span>
                </div>
            </div>

            {/* Perfect Days Counter */}
            <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className={`mt-4 flex items-center gap-2 px-5 py-2.5 rounded-full shadow-lg border ${
                    isComplete 
                        ? 'bg-gradient-to-r from-green-50 to-emerald-50 border-green-200' 
                        : 'bg-white border-gray-100'
                }`}
            >
                <motion.span
                    key={completedDays}
                    initial={{ scale: 1 }}
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 0.3 }}
                    className={`text-2xl font-black ${
                        isComplete ? 'text-green-600' : 'text-gray-900'
                    }`}
                >
                    {completedDays}
                </motion.span>
                <span className="text-gray-400 font-medium">/</span>
                <span className="text-lg font-semibold text-gray-500">{totalDays}</span>
                <span className="text-sm text-gray-400 font-medium ml-1">perfect days</span>
                {isComplete && (
                    <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.7 }}
                        className="text-lg"
                    >
                        🎉
                    </motion.span>
                )}
            </motion.div>
        </motion.div>
    );
};
