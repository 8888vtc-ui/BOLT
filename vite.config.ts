import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// import { VitePWA } from 'vite-plugin-pwa'; // Uncomment after: npm install -D vite-plugin-pwa

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Uncomment after installing vite-plugin-pwa:
    // VitePWA({
    //   registerType: 'autoUpdate',
    //   includeAssets: ['favicon.ico', 'robots.txt'],
    //   manifest: {
    //     name: 'GuruGammon - Online Backgammon',
    //     short_name: 'GuruGammon',
    //     description: 'Play backgammon online with AI coach',
    //     theme_color: '#FFD700',
    //     background_color: '#000000',
    //     display: 'standalone',
    //     icons: [
    //       {
    //         src: '/icon-192.png',
    //         sizes: '192x192',
    //         type: 'image/png'
    //       },
    //       {
    //         src: '/icon-512.png',
    //         sizes: '512x512',
    //         type: 'image/png'
    //       }
    //     ]
    //   },
    //   workbox: {
    //     globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
    //     runtimeCaching: [
    //       {
    //         urlPattern: /^https:\/\/api\./,
    //         handler: 'NetworkFirst',
    //         options: {
    //           cacheName: 'api-cache',
    //           expiration: {
    //             maxEntries: 50,
    //             maxAgeSeconds: 60 * 60 * 24 // 24 hours
    //           }
    //         }
    //       }
    //     ]
    //   }
    // })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
    include: ['react-dnd', 'react-dnd-html5-backend', 'react-dnd-touch-backend', 'framer-motion'],
  },
  server: {
    fs: {
      strict: false,
    },
  },
});
