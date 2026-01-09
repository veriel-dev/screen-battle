import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@scenes': resolve(__dirname, './src/scenes'),
      '@entities': resolve(__dirname, './src/entities'),
      '@ui': resolve(__dirname, './src/ui'),
      '@data': resolve(__dirname, './src/data'),
      '@systems': resolve(__dirname, './src/systems'),
      '@game-types': resolve(__dirname, './src/types'),
      '@utils': resolve(__dirname, './src/utils'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },
  build: {
    // Phaser es ~1.2MB minificado, no se puede reducir más
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks: (id) => {
          if (id.includes('node_modules/phaser')) {
            return 'phaser';
          }
          if (id.includes('/scenes/')) {
            return 'scenes';
          }
          if (id.includes('/ui/')) {
            return 'ui';
          }
          if (id.includes('/systems/')) {
            return 'systems';
          }
          if (id.includes('/data/')) {
            return 'data';
          }
        },
      },
    },
  },
});
