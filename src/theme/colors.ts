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
    // Habit gradient colors - Soft Pastel Theme (Orise-inspired)
    // High-legibility dark text on light, airy backgrounds
    habitColors: {
        coral: { start: '#fee2e2', end: '#fecaca', text: '#991b1b', icon: '#ef4444' }, // Light Red/Pink
        sky: { start: '#e0f2fe', end: '#bae6fd', text: '#075985', icon: '#0ea5e9' }, // Light Blue
        lavender: { start: '#f3e8ff', end: '#e9d5ff', text: '#6b21a8', icon: '#a855f7' }, // Light Purple
        peach: { start: '#ffedd5', end: '#fed7aa', text: '#9a3412', icon: '#f97316' }, // Light Orange
        mint: { start: '#dcfce7', end: '#bbf7d0', text: '#166534', icon: '#22c55e' }, // Light Green
        rose: { start: '#fce7f3', end: '#fbcfe8', text: '#9d174d', icon: '#ec4899' }, // Light Pink
        amber: { start: '#fef3c7', end: '#fde68a', text: '#92400e', icon: '#f59e0b' }, // Light Yellow
        teal: { start: '#ccfbf1', end: '#99f6e4', text: '#115e59', icon: '#14b8a6' }, // Light Teal
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
