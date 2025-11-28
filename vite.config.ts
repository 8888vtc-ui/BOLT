import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
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
