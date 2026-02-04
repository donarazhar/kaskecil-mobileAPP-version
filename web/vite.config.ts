import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@kas-kecil/shared': path.resolve(__dirname, '../mobile/src/lib/shared'),
      '@kas-kecil/api-client': path.resolve(__dirname, '../mobile/src/lib/api-client'),
      '@kas-kecil/validators': path.resolve(__dirname, '../mobile/src/lib/validators'),
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
