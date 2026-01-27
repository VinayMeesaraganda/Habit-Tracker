/**
 * Centralized Theme Configuration
 * Premium Dark Design System
 */

export const theme = {
    colors: {
        // Backgrounds
        bg: {
            app: '#000000',           // Pure black background
            elevated: '#0A0A0A',      // Slightly elevated surfaces
            card: '#111111',          // Card backgrounds
            cardHover: '#151515',     // Hover states
        },

        // Text
        text: {
            primary: '#FFFFFF',       // Headlines, key text
            secondary: '#A0A0A0',     // Secondary text
            tertiary: '#666666',      // Metadata, labels
        },

        // Accents
        accent: {
            primary: '#FFFFFF',       // Primary actions (white on black)
            fire: '#FF6B35',          // Streak fire
            success: '#00D9A3',       // Completion states
            warning: '#FFB800',       // Warnings, alerts
            error: '#FF4757',         // Errors
        },

        // Borders
        border: {
            subtle: '#1A1A1A',        // Very subtle borders
            medium: '#2A2A2A',        // Medium borders
            strong: '#3A3A3A',        // Strong borders
        },
    },

    // Typography Scale
    fontSize: {
        // Metrics - Large numbers
        metricXl: '64px',
        metricLg: '48px',
        metricMd: '32px',
        metricSm: '24px',

        // Text
        xl: '20px',
        lg: '18px',
        base: '16px',
        sm: '14px',
        xs: '12px',
        xxs: '11px',
    },

    fontWeight: {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
    },

    // Spacing System
    spacing: {
        xs: '4px',
        sm: '8px',
        md: '16px',
        lg: '24px',
        xl: '32px',
        '2xl': '48px',
        '3xl': '64px',
    },

    // Border Radius
    radius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
        xl: '24px',
        full: '9999px',
    },

    // Shadows
    shadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        md: '0 4px 8px rgba(0, 0, 0, 0.4)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
        xl: '0 16px 32px rgba(0, 0, 0, 0.6)',
    },

    // Transitions
    transition: {
        fast: '150ms cubic-bezier(0.4, 0, 0.2, 1)',
        base: '200ms cubic-bezier(0.4, 0, 0.2, 1)',
        slow: '300ms cubic-bezier(0.4, 0, 0.2, 1)',
    },
} as const;

// Type exports for TypeScript
export type Theme = typeof theme;
export type ThemeColors = typeof theme.colors;
export type ThemeSpacing = typeof theme.spacing;
