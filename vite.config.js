import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Get API URL from environment or use localhost for development
const apiUrl = process.env.VITE_API_URL || 'http://localhost:5000'

export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: true,
    host: '0.0.0.0',
    port: 5173,
    proxy: {
      '/api': {
        target: apiUrl,
        changeOrigin: true,
      }
    }
  },
  define: {
    __API_URL__: JSON.stringify(apiUrl)
  }
})
