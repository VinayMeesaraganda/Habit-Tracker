import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

interface MultiSegmentProgressRingProps {
    completed: number;
    remaining: number;
    overdue: number;
    size?: number;
    strokeWidth?: number;
    showLabel?: boolean;
}

export const MultiSegmentProgressRing: React.FC<MultiSegmentProgressRingProps> = ({
    completed,
    remaining,
    overdue,
    size = 140,
    strokeWidth = 14,
    showLabel = true,
}) => {
    const [displayCompleted, setDisplayCompleted] = useState(0);
    const total = completed + remaining + overdue;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;

    // Calculate text size based on ring size
    const textSize = Math.max(14, Math.round(size * 0.28)); // Scale text to 28% of ring size
    const subtextSize = Math.max(10, Math.round(size * 0.12));

    // Animate the completed count on mount
    useEffect(() => {
        const timeout = setTimeout(() => {
            setDisplayCompleted(completed);
        }, 100);
        return () => clearTimeout(timeout);
    }, [completed]);

    // Calculate segment lengths
    const completedLength = total > 0 ? (displayCompleted / total) * circumference : 0;
    const remainingLength = total > 0 ? (remaining / total) * circumference : 0;
    const overdueLength = total > 0 ? (overdue / total) * circumference : 0;

    // Determine if ring should show success state
    const isComplete = percentage === 100 && total > 0;
    const isPartial = percentage > 0 && percentage < 100;

    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative inline-flex items-center justify-center"
            style={{ width: size, height: size }}
        >
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle with subtle gradient */}
                <defs>
                    <linearGradient id={`bgGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#F8F8F8" />
                        <stop offset="100%" stopColor="#F0F0F0" />
                    </linearGradient>
                </defs>
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    fill="none"
                    stroke="url(#bgGradient)"
                    strokeWidth={strokeWidth}
                />

                {/* Completed segment (amber) */}
                {displayCompleted > 0 && (
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={isComplete ? "#4CAF50" : "#FFD97D"}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${completedLength} ${circumference}`}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - completedLength }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                )}

                {/* Remaining segment (coral) */}
                {remaining > 0 && (
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke={isPartial ? "#FF7A6B" : "#E8E8E8"}
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${remainingLength} ${circumference}`}
                        strokeDashoffset={-completedLength}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: -(completedLength + remainingLength) }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                    />
                )}

                {/* Overdue segment (dark) */}
                {overdue > 0 && (
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#2D2D2D"
                        strokeWidth={strokeWidth}
                        strokeDasharray={`${overdueLength} ${circumference}`}
                        strokeDashoffset={-(completedLength + remainingLength)}
                        strokeLinecap="round"
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset: circumference - (completedLength + remainingLength + overdueLength) }}
                        transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
                    />
                )}

                {/* Glow effect for completed state */}
                {isComplete && (
                    <motion.circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="none"
                        stroke="#4CAF50"
                        strokeWidth={strokeWidth * 2}
                        strokeLinecap="round"
                        opacity={0.3}
                        initial={{ scale: 1, opacity: 0 }}
                        animate={{ 
                            scale: [1, 1.1, 1],
                            opacity: [0, 0.3, 0]
                        }}
                        transition={{ 
                            duration: 2, 
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{ filter: 'blur(4px)' }}
                    />
                )}
            </svg>

            {/* Center percentage - dynamically sized */}
            {showLabel && (
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <motion.span
                        key={percentage}
                        initial={{ opacity: 0.5, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="font-black leading-none"
                        style={{ 
                            fontSize: `${textSize}px`,
                            color: isComplete 
                                ? '#4CAF50' 
                                : isPartial 
                                    ? '#1F1F1F' 
                                    : '#9E9E9E'
                        }}
                    >
                        {percentage}%
                    </motion.span>
                    <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="font-medium leading-none mt-1"
                        style={{ 
                            fontSize: `${subtextSize}px`,
                            color: '#9E9E9E'
                        }}
                    >
                        {isComplete ? 'Perfect!' : 'Complete'}
                    </motion.span>
                </div>
            )}
        </motion.div>
    );
};
