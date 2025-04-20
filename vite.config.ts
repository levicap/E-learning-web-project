import path from 'path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),

    },
  },
  optimizeDeps: {
    exclude: ['lucide-react', '@ffmpeg/ffmpeg', '@ffmpeg/util', '@ffmpeg/ffmpeg/dist/ffmpeg.min.js'],
  },
  
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          ffmpeg: ['@ffmpeg/ffmpeg', '@ffmpeg/util'],
        },
      },
    },
  },
});
