import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    proxy: {
      // Proxy all backend routes through Vite so everything stays
      // on the same origin (port 5173). This prevents cross-origin
      // cookie issues when using Dev Tunnels.
      '/api': {
        target: 'http://127.0.0.1:3000/',
        changeOrigin: true,
        secure: false,
      },
      '/auth': {
        target: 'http://127.0.0.1:3000/',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
