/**
 * Color System - Unique Vibrant Theme
 * Original color palette differentiated from reference designs
 */

export const colors = {
    // Backgrounds - Warmer, unique tones
    background: '#FFF8E7', // Warmer cream with yellow undertone
    surface: '#FFFFFF',
    elevated: '#FFFCF2',

    // Habit gradient colors - Deep, rich tones for white text contrast
    habitColors: {
        coral: { start: '#E64A19', end: '#FA5F2E' }, // Deep Coral
        sky: { start: '#1565C0', end: '#1E88E5' }, // Strong Blue
        lavender: { start: '#5E35B1', end: '#7E57C2' }, // Deep Purple
        peach: { start: '#D84315', end: '#F4511E' }, // Burnt Orange
        mint: { start: '#2E7D32', end: '#43A047' }, // Forest Green
        rose: { start: '#C2185B', end: '#D81B60' }, // Dark Pink
        amber: { start: '#F9A825', end: '#FBC02D' }, // Dark Gold (Readable with white)
        teal: { start: '#00695C', end: '#00897B' }, // Deep Teal
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
