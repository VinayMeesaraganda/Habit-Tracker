
import React, { useRef, useState } from 'react';
import { Trash2, Check } from 'lucide-react';
import { useHaptic } from '../../utils/HapticUtils';

interface SwipeRowProps {
    children: React.ReactNode;
    onSwipeRight?: () => void;
    onSwipeLeft?: () => void;
    enabled?: boolean;
}

export const SwipeRow: React.FC<SwipeRowProps> = ({
    children,
    onSwipeRight,
    onSwipeLeft,
    enabled = true
}) => {
    const [offset, setOffset] = useState(0);
    const startX = useRef<number | null>(null);
    const currentX = useRef<number | null>(null);
    const { triggerSuccess, triggerError } = useHaptic();

    // Threshold to trigger action
    const THRESHOLD = 100;

    const handleTouchStart = (e: React.TouchEvent) => {
        if (!enabled) return;
        startX.current = e.touches[0].clientX;
        currentX.current = e.touches[0].clientX;
    };

    const handleTouchMove = (e: React.TouchEvent) => {
        if (!enabled || startX.current === null) return;
        currentX.current = e.touches[0].clientX;
        const diff = currentX.current - startX.current;

        // Limit swipe distance for resistance
        if (diff > 150) setOffset(150 + (diff - 150) * 0.2);
        else if (diff < -150) setOffset(-150 + (diff + 150) * 0.2);
        else setOffset(diff);
    };

    const handleTouchEnd = () => {
        if (!enabled || startX.current === null || currentX.current === null) return;
        const diff = currentX.current - startX.current;

        if (diff > THRESHOLD && onSwipeRight) {
            // Swipe Right Action (Complete)
            triggerSuccess();
            onSwipeRight();
            setOffset(0); // Reset after action? Or keep it open? Usually reset for instantaneous actions like toggle
        } else if (diff < -THRESHOLD && onSwipeLeft) {
            // Swipe Left Action (Delete)
            triggerError(); // or medium impact
            onSwipeLeft();
            setOffset(0);
        } else {
            // Snap back
            setOffset(0);
        }

        startX.current = null;
        currentX.current = null;
    };

    // Determine background color based on swipe direction
    const getBackground = () => {
        if (offset > 0) return 'linear-gradient(to right, #4CAF50, #81C784)'; // Green for right swipe
        if (offset < 0) return 'linear-gradient(to left, #EF5350, #E57373)'; // Red for left swipe
        return 'transparent';
    };

    return (
        <div
            className="relative overflow-hidden rounded-xl mb-3 select-none touch-pan-y"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background Actions Layer */}
            <div
                className="absolute inset-0 flex items-center justify-between px-6 transition-colors"
                style={{ background: getBackground() }}
            >
                {/* Left Icon (revealed on Right Swipe) */}
                <div className={`transition-opacity duration-200 ${offset > 50 ? 'opacity-100' : 'opacity-0'}`}>
                    <Check className="w-6 h-6 text-white" />
                </div>

                {/* Right Icon (revealed on Left Swipe) */}
                <div className={`transition-opacity duration-200 ${offset < -50 ? 'opacity-100' : 'opacity-0'}`}>
                    <Trash2 className="w-6 h-6 text-white" />
                </div>
            </div>

            {/* Foreground Content Layer */}
            <div
                className="relative bg-white transition-transform duration-200 ease-out"
                style={{ transform: `translateX(${offset}px)` }}
            >
                {children}
            </div>
        </div>
    );
};

