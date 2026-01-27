/**
 * Shadow System
 * Soft, subtle shadows for depth
 */

export const shadows = {
    none: 'none',
    sm: '0 2px 8px rgba(0, 0, 0, 0.06)',
    card: '0 4px 12px rgba(0, 0, 0, 0.08)',
    md: '0 6px 16px rgba(0, 0, 0, 0.1)',
    lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
    fab: '0 6px 20px rgba(255, 107, 122, 0.3)',
    nav: '0 -4px 12px rgba(0, 0, 0, 0.1)',
} as const;

export type Shadow = keyof typeof shadows;
