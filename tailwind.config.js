/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            colors: {
                // Custom color palette
                'app-bg': '#000000',
                'elevated-bg': '#0A0A0A',
                'card-bg': '#111111',
                'card-hover': '#151515',

                'text-primary': '#FFFFFF',
                'text-secondary': '#A0A0A0',
                'text-tertiary': '#666666',

                'accent-fire': '#FF6B35',
                'accent-success': '#00D9A3',
                'accent-warning': '#FFB800',
                'accent-error': '#FF4757',

                'border-subtle': '#1A1A1A',
                'border-medium': '#2A2A2A',
                'border-strong': '#3A3A3A',

                // Keep primary for backwards compatibility
                primary: {
                    DEFAULT: '#FFFFFF',
                    50: '#FFFFFF',
                    100: '#F5F5F5',
                    200: '#E5E5E5',
                    300: '#D4D4D4',
                    400: '#A3A3A3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                },
                gray: {
                    50: '#FAFAFA',
                    100: '#F5F5F5',
                    200: '#E5E5E5',
                    300: '#D4D4D4',
                    400: '#A3A3A3',
                    500: '#737373',
                    600: '#525252',
                    700: '#404040',
                    800: '#262626',
                    900: '#171717',
                },
            },
            borderColor: {
                DEFAULT: '#1A1A1A',
            },
            fontFamily: {
                sans: ['Inter', 'system-ui', 'sans-serif'],
            },
            fontSize: {
                'metric-xl': ['64px', { lineHeight: '1', fontWeight: '600' }],
                'metric-lg': ['48px', { lineHeight: '1', fontWeight: '600' }],
                'metric-md': ['32px', { lineHeight: '1', fontWeight: '600' }],
                'metric-sm': ['24px', { lineHeight: '1', fontWeight: '600' }],
            },
            spacing: {
                'xs': '4px',
                'sm': '8px',
                'md': '16px',
                'lg': '24px',
                'xl': '32px',
                '2xl': '48px',
                '3xl': '64px',
            },
            borderRadius: {
                'sm': '8px',
                'md': '12px',
                'lg': '16px',
                'xl': '24px',
            },
            boxShadow: {
                'sm': '0 1px 2px rgba(0, 0, 0, 0.3)',
                'md': '0 4px 8px rgba(0, 0, 0, 0.4)',
                'lg': '0 8px 16px rgba(0, 0, 0, 0.5)',
                'xl': '0 16px 32px rgba(0, 0, 0, 0.6)',
            },
            transitionDuration: {
                'fast': '150ms',
                'base': '200ms',
                'slow': '300ms',
            },
        },
    },
    plugins: [],
}
