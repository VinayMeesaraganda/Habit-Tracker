/**
 * Color System - Unique Vibrant Theme
 * Original color palette differentiated from reference designs
 */

export const colors = {
    // Backgrounds - Warmer, unique tones
    background: '#FFF8E7', // Warmer cream with yellow undertone
    surface: '#FFFFFF',
    elevated: '#FFFCF2',

    // Habit gradient colors - Unique combinations
    habitColors: {
        coral: { start: '#FF7A6B', end: '#FFA094' }, // Coral-red
        sky: { start: '#5BA3F5', end: '#7DB8F7' }, // Sky blue
        lavender: { start: '#9B6CF9', end: '#B88FFA' }, // Lavender purple
        peach: { start: '#FFB077', end: '#FFC599' }, // Peach orange
        mint: { start: '#6EDFA6', end: '#8FE8B8' }, // Mint green
        rose: { start: '#FF8BA7', end: '#FFB3C1' }, // Rose pink
        amber: { start: '#FFD97D', end: '#FFE5A3' }, // Amber yellow
        teal: { start: '#5ECFB8', end: '#7FDCC9' }, // Teal
    },

    // Text - Slightly different grays
    text: {
        primary: '#1F1F1F',
        secondary: '#6B6B6B',
        tertiary: '#9E9E9E',
        onColor: '#FFFFFF',
        accent: '#FF7A6B',
    },

    // Accents - Unique shades
    success: '#52C55A',
    warning: '#FFC107',
    error: '#FF5252',
    info: '#5BA3F5',

    // Navigation - Slightly different dark
    navBar: '#2D2D2D',
    navActive: '#FF7A6B',
    navInactive: '#9E9E9E',

    // Progress ring segments - Unique colors
    progress: {
        completed: '#FFD97D', // Amber
        remaining: '#FF7A6B', // Coral
        overdue: '#2D2D2D',
    },
} as const;

// Category to color mapping - Unique combinations
export const categoryColorMap: Record<string, keyof typeof colors.habitColors> = {
    'Health & Fitness 💪': 'sky',
    'Growth 📚': 'amber',
    'Productivity 🎯': 'peach',
    'Mindfulness 🧘': 'mint',
    'Social 👥': 'rose',
    'Finance 💰': 'teal',
    'Other 📌': 'lavender',
};

export type HabitColor = keyof typeof colors.habitColors;
