/**
 * Color System - Unique Vibrant Theme
 * Original color palette differentiated from reference designs
 */

export const colors = {
    // Backgrounds - Warmer, unique tones
    background: '#FFF8E7', // Warmer cream with yellow undertone
    surface: '#FFFFFF',
    elevated: '#FFFCF2',

    // Habit gradient colors - Sophisticated, muted tones for elegance and readability
    habitColors: {
        coral: { start: '#D87A65', end: '#E5907D' }, // Muted Terracotta
        sky: { start: '#5B7C99', end: '#7A9CB8' }, // Steel Blue
        lavender: { start: '#8E7CC3', end: '#A594D1' }, // Dusty Purple
        peach: { start: '#D9886C', end: '#EBA086' }, // Clay / Warm Sand
        mint: { start: '#5D9B7B', end: '#78B295' }, // Deep Sage
        rose: { start: '#C76D7E', end: '#D98998' }, // Antique Rose
        amber: { start: '#D4AF37', end: '#E5C158' }, // Metallic Gold / Ochre
        teal: { start: '#4B8B84', end: '#68A69F' }, // Muted Spruce
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
