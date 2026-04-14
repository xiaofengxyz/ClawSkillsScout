import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: '/ClawSkillsScout/',
  plugins: [react()],
});
