import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { TanStackRouterVite } from '@tanstack/router-plugin/vite';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [
    TanStackRouterVite({ routesDirectory: './src/routes', generatedRouteTree: './src/routeTree.gen.ts' }),
    react(),
    tailwindcss(),
  ],
  server: {
    host: '127.0.0.1',
    allowedHosts: ['agence-leblanc.hipposaas.cloud'],
    port: 5173,
    proxy: {
      '/api': { target: 'http://localhost:3002', changeOrigin: true },
      '/uploads': { target: 'http://localhost:3002', changeOrigin: true },
    },
  },
});
