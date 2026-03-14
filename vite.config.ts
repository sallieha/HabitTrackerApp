import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/HabitTrackerApp/' : '/',
  server: {
    host: '127.0.0.1',
    port: 5173,
    open: true,
  },
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
