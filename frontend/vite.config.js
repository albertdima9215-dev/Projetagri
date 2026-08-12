/*import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
})*/

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),

    VitePWA({
  registerType: 'autoUpdate',

  manifest: {
    name: 'AgriConnect Faso',
    short_name: 'AgriConnect',
    description: 'Marketplace agricole du Burkina Faso',
    theme_color: '#2e7d32',
    background_color: '#ffffff',
    display: 'standalone',
    orientation: 'portrait',
    start_url: '/',
    icons: [
      {
        src: '/pwa-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/pwa-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/pwa-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },

  workbox: {
    globPatterns: ['**/*.{js,css,html,png,jpg,jpeg,svg,webp}'],

    runtimeCaching: [
      {
        urlPattern: /^https:\/\/projetagri\.onrender\.com\/api\/products/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'products-cache',
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 60 * 60 * 24,
          },
        },
      },

      {
        urlPattern: ({ request }) =>
          request.destination === 'image',
        handler: 'CacheFirst',
        options: {
          cacheName: 'images-cache',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
    ],
  },
})
  ],
});
