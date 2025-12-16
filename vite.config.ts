import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
    plugins: [
        react(),
        VitePWA({
            registerType: 'autoUpdate',
            includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'mask-icon.svg'],
            manifest: {
                name: 'Habit Tracker Pro',
                short_name: 'Habits',
                description: 'A professional habit tracker to build better routines, track daily progress, and visualize your consistency with beautiful analytics.',
                theme_color: '#0F766E',
                background_color: '#F8FAFC',
                display: 'standalone',
                orientation: 'portrait',
                categories: ['productivity', 'lifestyle', 'utilities'],
                start_url: '/',
                id: '/',
                icons: [
                    {
                        src: 'pwa-192x192.png',
                        sizes: '192x192',
                        type: 'image/png'
                    },
                    {
                        src: 'pwa-512x512.png',
                        sizes: '512x512',
                        type: 'image/png',
                        purpose: 'any maskable'
                    }
                ]
            }
        })
    ],
})
