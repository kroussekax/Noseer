import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://mc:8000',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://mc:8000',
        changeOrigin: true,
      },
    },
  },
});
