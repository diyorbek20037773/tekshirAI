import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // 'prompt' — SW ni avtomatik yangilamaymiz (dars/kamera ochilganda jim reload bo'lmasin).
      registerType: 'prompt',
      // SW ni QO'LDA ro'yxatga olamiz (main.jsx) — Telegram webview ichida o'chirish uchun.
      injectRegister: null,
      includeAssets: ['favicon.svg', 'apple-touch-icon-180x180.png'],
      manifest: {
        name: 'TekshirAI',
        short_name: 'TekshirAI',
        description: 'AI asosida uyga vazifalarni tekshirish platformasi',
        lang: 'uz',
        dir: 'ltr',
        start_url: '/',
        scope: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#f9fafb',
        theme_color: '#2563eb',
        icons: [
          { src: '/pwa-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: '/pwa-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: '/maskable-icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // App shell ni precache qilamiz — GLB modellar (jami ~112MB) VA og'ir asset'lar CHIQARILADI.
        globPatterns: ['**/*.{js,css,html,svg,woff,woff2}'],
        globIgnores: ['**/lesson-models/**', '**/*.glb', '**/avatars/**'],
        maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
        navigateFallback: '/index.html',
        // SPA fallback API va admin route'larni HECH QACHON ushlamasin.
        navigateFallbackDenylist: [/^\/api\//, /^\/admin\//],
        cleanupOutdatedCaches: true,
        runtimeCaching: [
          {
            // /api/* — doim tarmoq, hech qachon cache emas (auth/data jonli bo'lsin).
            urlPattern: ({ url }) => url.pathname.startsWith('/api/'),
            handler: 'NetworkOnly',
          },
          {
            // 3D GLB modellar — precache emas, tarmoqdan stream (juda katta).
            urlPattern: ({ url }) => url.pathname.startsWith('/lesson-models/'),
            handler: 'NetworkOnly',
          },
          {
            // Tashqi CDN'lar (Telegram SDK, MediaPipe, Google Fonts) — SW aralashmasin.
            urlPattern: ({ url }) =>
              url.origin === 'https://telegram.org' ||
              url.origin === 'https://cdn.jsdelivr.net' ||
              url.origin === 'https://fonts.googleapis.com' ||
              url.origin === 'https://fonts.gstatic.com',
            handler: 'NetworkOnly',
          },
        ],
      },
      // `vite dev` da SW o'chiq — dev proxy'ni chalkashtirmasin.
      devOptions: { enabled: false },
    }),
  ],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
