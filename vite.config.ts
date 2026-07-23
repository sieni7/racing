import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['icons/icon.svg', 'manifest.json'],
      manifest: {
        name: 'Racing Club de Bingerville',
        short_name: 'RCB',
        description: "Site officiel du Racing Club de Bingerville — Ligue 1 Côte d'Ivoire",
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        theme_color: '#F97316',
        background_color: '#ffffff',
        categories: ['sports', 'football'],
        lang: 'fr',
        icons: [
          { src: '/icons/icon.svg', sizes: 'any', type: 'image/svg+xml', purpose: 'any' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg,webp}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*\.supabase\.co\/.*/i,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'supabase-api',
              expiration: { maxEntries: 50, maxAgeSeconds: 86400 },
              networkTimeoutSeconds: 5,
            },
          },
        ],
      },
    }),
  ],
});
