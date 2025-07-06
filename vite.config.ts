import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  
  // Path aliases for clean imports
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      '@/components': path.resolve(__dirname, './src/components'),
      '@/pages': path.resolve(__dirname, './src/pages'),
      '@/hooks': path.resolve(__dirname, './src/hooks'),
      '@/utils': path.resolve(__dirname, './src/utils'),
      '@/types': path.resolve(__dirname, './src/types'),
      '@/stores': path.resolve(__dirname, './src/stores'),
      '@/services': path.resolve(__dirname, './src/services'),
      '@/assets': path.resolve(__dirname, './src/assets'),
      '@/styles': path.resolve(__dirname, './src/styles'),
      '@/lib': path.resolve(__dirname, './src/lib'),
    },
  },

  // Development server configuration
  server: {
    port: 3000,
    host: true,
    // Proxy API requests to Hades backend during development
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
      },
      '/graphql': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        ws: true, // Enable WebSocket proxy for GraphQL subscriptions
      },
    },
  },

  // Build configuration
  build: {
    outDir: 'dist',
    sourcemap: true,
  },

  // CSS configuration
  css: {
    postcss: './postcss.config.js',
  },
})