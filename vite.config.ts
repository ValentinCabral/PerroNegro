import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:3000', // Usa la URL de backend desde VITE_API_URL en producción o localhost en desarrollo
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '')  // Asegúrate de que se reescriba correctamente
      }
    }
  }
});
