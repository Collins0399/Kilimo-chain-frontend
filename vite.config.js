import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://51.15.243.105:30746',
        changeOrigin: true,
      }
    },
    allowedHosts: [
      '1854-105-164-128-20.ngrok-free.app'
    ]
  }
})
