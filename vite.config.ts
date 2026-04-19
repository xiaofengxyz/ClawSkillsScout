import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'node:path';

export default defineConfig({
  base: '/ClawSkillsScout/',
  plugins: [react()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        clawhubGrowth: resolve(__dirname, 'clawhub-growth.html'),
        clawhubDownloadInsights: resolve(__dirname, 'clawhub-download-insights.html'),
        clawhub10kSystem: resolve(__dirname, 'clawhub-10k-system.html'),
      },
    },
  },
});
