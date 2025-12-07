import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: './test/setupTests.ts',
    globals: true,
  },
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, 'app/components'),
      '@/contexts': path.resolve(__dirname, 'app/contexts'),
      '@/hooks': path.resolve(__dirname, 'app/hooks'),
      '@/services': path.resolve(__dirname, 'app/services'),
      '@/constants': path.resolve(__dirname, 'app/constants'),
      '@/types': path.resolve(__dirname, 'app/types'),
      '@': path.resolve(__dirname, ''),
    },
  },
});
