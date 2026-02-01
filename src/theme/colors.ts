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
    // Habit gradient colors - Deep, vibrant, high-contrast for white text (Adjusted -5% contrast)
    habitColors: {
        coral: { start: '#FF7676', end: '#F06162' }, // Vibrant Red-Coral (Softer)
        sky: { start: '#5EDFFF', end: '#4592E6' }, // Deep Blue (Softer)
        lavender: { start: '#B0A9FF', end: '#7A6BF0' }, // Royal Purple (Softer)
        peach: { start: '#FFAB58', end: '#F06162' }, // Deep Orange (Softer)
        mint: { start: '#34DDB5', end: '#22B890' }, // Jungle Green (Softer)
        rose: { start: '#FFA9F7', end: '#F578E5' }, // Deep Rose (Softer)
        amber: { start: '#FFD168', end: '#FFAB58' }, // Warm Orange-Yellow (Softer)
        teal: { start: '#19DCDC', end: '#16B2B3' }, // Cyan-Teal (Softer)
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
