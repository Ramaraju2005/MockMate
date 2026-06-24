import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    // Allow Dev Tunnels and any other hosts to access the dev server.
    // Without this, Vite rejects requests from tunnel domains with a 403.
    allowedHosts: 'all',
    proxy: {
      // Proxy all backend routes through Vite so everything stays
      // on the same origin (port 5173). This prevents cross-origin
      // cookie issues when using Dev Tunnels.
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
      '/logout': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
