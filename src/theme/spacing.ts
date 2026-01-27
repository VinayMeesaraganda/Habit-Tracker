/**
 * Spacing System
 * Consistent spacing values throughout the app
 */

export const spacing = {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    xxl: 24,
    xxxl: 32,
    xxxxl: 48,
} as const;

export type Spacing = keyof typeof spacing;
