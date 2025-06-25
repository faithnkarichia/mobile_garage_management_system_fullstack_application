import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Updated config with jwt-decode optimization
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': process.env.VITE_API_URL
    }
  },
  optimizeDeps: {
    include: ['jwt-decode'],
    esbuildOptions: {
      // Additional options if needed
      target: 'es2020'
    }
  }
})