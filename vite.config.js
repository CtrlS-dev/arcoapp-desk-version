import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: './', // Important for Electron
  server: {
    proxy: {
      '/arco-backend': {
        target: 'https://arco-backend.vercel.app',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/arco-backend/, ''),
        secure: true
      },
      '/dolarvzla-api': {
        target: 'https://api.dolarvzla.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/dolarvzla-api/, ''),
        secure: true
      },
      '/yadio-api': {
        target: 'https://api.yadio.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/yadio-api/, ''),
        secure: true
      }
    }
  }
})
