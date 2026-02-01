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
    // Habit gradient colors - Deep, vibrant, high-contrast for white text
    habitColors: {
        coral: { start: '#FF6B6B', end: '#EE5253' }, // Vibrant Red-Coral
        sky: { start: '#48dbfb', end: '#2e86de' }, // Deep Blue
        lavender: { start: '#a29bfe', end: '#6c5ce7' }, // Royal Purple
        peach: { start: '#ff9f43', end: '#ee5253' }, // Deep Orange (Sunset)
        mint: { start: '#1dd1a1', end: '#10ac84' }, // Jungle Green
        rose: { start: '#ff9ff3', end: '#f368e0' }, // Deep Rose
        amber: { start: '#feca57', end: '#ff9f43' }, // Warm Orange-Yellow
        teal: { start: '#00d2d3', end: '#01a3a4' }, // Cyan-Teal
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
