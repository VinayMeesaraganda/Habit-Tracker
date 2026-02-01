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
    // Habit gradient colors - Sophisticated, muted tones (High legibility for white text)
    habitColors: {
        coral: { start: '#c0392b', end: '#e74c3c' }, // Pomegranate -> Alizarin (Deep Red)
        sky: { start: '#2980b9', end: '#3498db' }, // Belize Hole -> Peter River (Strong Blue)
        lavender: { start: '#8e44ad', end: '#9b59b6' }, // Wisteria -> Amethyst (Deep Purple)
        peach: { start: '#d35400', end: '#e67e22' }, // Pumpkin -> Carrot (Deep Orange)
        mint: { start: '#27ae60', end: '#2ecc71' }, // Nephritis -> Emerald (Natural Green)
        rose: { start: '#b33939', end: '#ff5252' }, // Deep Rose -> Soft Red
        amber: { start: '#f39c12', end: '#f1c40f' }, // Orange -> Sunflower (Darkened Yellow)
        teal: { start: '#16a085', end: '#1abc9c' }, // Green Sea -> Turquoise (Deep Teal)
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
