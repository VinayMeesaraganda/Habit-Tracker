/**
 * Animation Variants and Presets for Premium UI
 * Using framer-motion for smooth, GPU-accelerated animations
 */

import { Variants } from 'framer-motion';

// Timing presets
export const transitions = {
    fast: { duration: 0.15, ease: [0.4, 0, 0.2, 1] },
    medium: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    slow: { duration: 0.35, ease: [0.4, 0, 0.2, 1] },
    spring: { type: 'spring' as const, stiffness: 300, damping: 30 },
    bouncy: { type: 'spring' as const, stiffness: 400, damping: 20 }
};

// Page transitions
export const pageVariants: Variants = {
    initial: { opacity: 0, x: 20 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -20 }
};

export const fadeInUp: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
};

export const fadeIn: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

// Modal animations
export const modalVariants: Variants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 }
};

export const backdropVariants: Variants = {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 }
};

// Stagger children
export const staggerContainer: Variants = {
    animate: {
        transition: {
            staggerChildren: 0.05
        }
    }
};

export const staggerItem: Variants = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 }
};

// Hover effects
export const scaleOnHover = {
    rest: { scale: 1 },
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
};

export const liftOnHover = {
    rest: { y: 0 },
    hover: { y: -2 }
};

// Spring physics for interactions
export const checkboxVariants: Variants = {
    unchecked: { scale: 0.9 },
    checked: {
        scale: 1,
        transition: transitions.bouncy
    }
};

// FAB animation
export const fabVariants: Variants = {
    rest: { scale: 1, rotate: 0 },
    hover: { scale: 1.1 },
    tap: { scale: 0.9, rotate: 90 }
};

// Card animations
export const cardVariants: Variants = {
    initial: { opacity: 0, y: 10 },
    animate: {
        opacity: 1,
        y: 0
    },
    hover: {
        y: -4
    }
};
