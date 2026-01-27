/**
 * Border Radius System
 * Rounded corners for playful, friendly UI
 */

export const radius = {
    sm: 12,
    md: 16,
    lg: 20,
    xl: 24,
    xxl: 28,
    full: 9999,
} as const;

export type Radius = keyof typeof radius;
