import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@kas-kecil/shared': path.resolve(__dirname, '../../packages/shared/src'),
      '@kas-kecil/api-client': path.resolve(__dirname, '../../packages/api-client/src'),
      '@kas-kecil/validators': path.resolve(__dirname, '../../packages/validators/src'),
    },
  },
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
