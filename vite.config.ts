// File: vite.config.ts
// 🎨 KAIROS Frontend Build Configuration
// Vite + React + TypeScript configuration for Kairos
// Optimized for development and production builds

import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { visualizer } from 'rollup-plugin-visualizer'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load environment variables
  const env = loadEnv(mode, process.cwd(), '')
  
  return {
    // ==========================================================================
    // PLUGINS CONFIGURATION
    // ==========================================================================
    plugins: [
      // React plugin with Fast Refresh
      react({
        include: "**/*.{jsx,tsx}",
        babel: {
          plugins: [
            // Add any babel plugins here if needed
          ]
        }
      }),
      
      // Bundle analyzer (only in build mode)
      ...(command === 'build' ? [
        visualizer({
          filename: 'dist/bundle-analysis.html',
          open: false,
          gzipSize: true,
          brotliSize: true
        })
      ] : [])
    ],

    // ==========================================================================
    // RESOLVE CONFIGURATION
    // ==========================================================================
    resolve: {
      alias: {
        // Path aliases for cleaner imports
        '@': path.resolve(__dirname, './src'),
        '@/components': path.resolve(__dirname, './src/components'),
        '@/pages': path.resolve(__dirname, './src/pages'),
        '@/hooks': path.resolve(__dirname, './src/hooks'),
        '@/stores': path.resolve(__dirname, './src/stores'),
        '@/utils': path.resolve(__dirname, './src/utils'),
        '@/types': path.resolve(__dirname, './src/types'),
        '@/styles': path.resolve(__dirname, './src/styles'),
        '@/assets': path.resolve(__dirname, './src/assets'),
        '@/config': path.resolve(__dirname, './src/config'),
        '@/services': path.resolve(__dirname, './src/services'),
        '@/lib': path.resolve(__dirname, './src/lib'),
        '@/constants': path.resolve(__dirname, './src/constants')
      }
    },

    // ==========================================================================
    // DEVELOPMENT SERVER CONFIGURATION
    // ==========================================================================
    server: {
      host: env.VITE_HOST || 'localhost',
      port: parseInt(env.VITE_PORT) || 3000,
      open: env.VITE_OPEN === 'true',
      cors: env.VITE_CORS === 'true',
      hmr: {
        port: parseInt(env.VITE_HMR_PORT) || 24678
      },
      proxy: {
        // Proxy API requests to Hades backend
        '/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8080',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, '')
        },
        // Proxy WebSocket connections
        '/ws': {
          target: env.VITE_WS_URL || 'ws://localhost:8080',
          ws: true,
          changeOrigin: true
        }
      }
    },

    // ==========================================================================
    // BUILD CONFIGURATION
    // ==========================================================================
    build: {
      target: env.VITE_BUILD_TARGET || 'es2020',
      outDir: env.VITE_BUILD_OUTDIR || 'dist',
      sourcemap: env.VITE_BUILD_SOURCEMAP === 'true',
      minify: env.VITE_BUILD_MINIFY !== 'false' ? 'esbuild' : false,
      
      // Asset handling
      assetsDir: 'assets',
      assetsInlineLimit: parseInt(env.VITE_ASSET_INLINE_LIMIT) || 4096,
      
      // Rollup options
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
        },
        output: {
          // Manual chunk splitting for better caching
          manualChunks: {
            // Vendor chunks
            'vendor-react': ['react', 'react-dom'],
            'vendor-router': ['react-router-dom'],
            'vendor-ui': ['@headlessui/react', 'lucide-react'],
            'vendor-store': ['zustand'],
            'vendor-query': ['@tanstack/react-query'],
            'vendor-utils': ['date-fns', 'clsx', 'tailwind-merge'],
            
            // Theme system
            'theme-system': [
              './src/stores/themeStore',
              './src/config/theme.config',
              './src/utils/theme'
            ],
            
            // Components
            'components-ui': [
              './src/components/ui',
              './src/components/common'
            ],
            'components-theme': [
              './src/components/ThemeSwitcher',
              './src/components/ThemeCreator'
            ]
          },
          
          // Asset naming
          chunkFileNames: (chunkInfo) => {
            const facadeModuleId = chunkInfo.facadeModuleId
              ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^/.]+$/, '') || 'chunk'
              : 'chunk'
            return `assets/js/[name]-[hash].js`
          },
          assetFileNames: (assetInfo) => {
            const extType = assetInfo.name?.split('.').pop()
            if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(extType || '')) {
              return `assets/images/[name]-[hash][extname]`
            }
            if (/css/i.test(extType || '')) {
              return `assets/css/[name]-[hash][extname]`
            }
            return `assets/[name]-[hash][extname]`
          }
        }
      },
      
      // Chunk size warnings
      chunkSizeWarningLimit: 1000,
      
      // CSS code splitting
      cssCodeSplit: true,
      
      // Report compressed size
      reportCompressedSize: false,
      
      // Build target
      lib: undefined
    },

    // ==========================================================================
    // CSS CONFIGURATION
    // ==========================================================================
    css: {
      devSourcemap: env.VITE_CSS_SOURCEMAP === 'true',
      preprocessorOptions: {
        scss: {
          additionalData: `
            @import "@/styles/variables.scss";
            @import "@/styles/mixins.scss";
          `
        }
      },
      postcss: {
        plugins: [
          // PostCSS plugins will be loaded from postcss.config.js
        ]
      }
    },

    // ==========================================================================
    // OPTIMIZATIONS
    // ==========================================================================
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react-router-dom',
        '@headlessui/react',
        'lucide-react',
        'zustand',
        '@tanstack/react-query',
        'date-fns',
        'clsx',
        'tailwind-merge'
      ],
      exclude: [
        // Exclude any problematic dependencies
      ]
    },

    // ==========================================================================
    // ENVIRONMENT VARIABLES
    // ==========================================================================
    define: {
      // Define global constants
      __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
      __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
      __BUILD_MODE__: JSON.stringify(mode)
    },

    // ==========================================================================
    // BASE PATH CONFIGURATION
    // ==========================================================================
    base: env.VITE_BASE_PATH || '/',

    // ==========================================================================
    // PREVIEW CONFIGURATION
    // ==========================================================================
    preview: {
      host: env.VITE_HOST || 'localhost',
      port: parseInt(env.VITE_PREVIEW_PORT) || 4173,
      open: env.VITE_OPEN === 'true',
      cors: env.VITE_CORS === 'true'
    },

    // ==========================================================================
    // EXPERIMENTAL FEATURES
    // ==========================================================================
    experimental: {
      // Enable any experimental Vite features here
    },

    // ==========================================================================
    // ESBuild CONFIGURATION
    // ==========================================================================
    esbuild: {
      // ESBuild options
      target: 'es2020',
      jsxFactory: 'React.createElement',
      jsxFragment: 'React.Fragment',
      
      // Drop console and debugger in production
      drop: mode === 'production' ? ['console', 'debugger'] : [],
      
      // Keep names for better debugging
      keepNames: mode === 'development'
    },

    // ==========================================================================
    // WORKER CONFIGURATION
    // ==========================================================================
    worker: {
      format: 'es',
      plugins: []
    },

    // ==========================================================================
    // JSON CONFIGURATION
    // ==========================================================================
    json: {
      namedExports: true,
      stringify: false
    }
  }
})