/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./.storybook/**/*.{js,ts,jsx,tsx}",
  ],
  
  // Enable dark mode via class
  darkMode: 'class',
  
  theme: {
    extend: {
      // Kairos Brand Colors - The Perfect Moment Palette
      colors: {
        // Primary - Kairos Blue (representing time and precision)
        primary: {
          50: '#eff6ff',
          100: '#dbeafe',
          200: '#bfdbfe',
          300: '#93c5fd',
          400: '#60a5fa',
          500: '#3b82f6', // Main Kairos blue
          600: '#2563eb',
          700: '#1d4ed8',
          800: '#1e40af',
          900: '#1e3a8a',
          950: '#172554',
        },
        
        // Secondary - Temporal Gold (highlighting perfect moments)
        secondary: {
          50: '#fefce8',
          100: '#fef9c3',
          200: '#fef08a',
          300: '#fde047',
          400: '#facc15',
          500: '#eab308', // Main temporal gold
          600: '#ca8a04',
          700: '#a16207',
          800: '#854d0e',
          900: '#713f12',
          950: '#422006',
        },
        
        // Accent - Moment Purple (for highlights and calls-to-action)
        accent: {
          50: '#faf5ff',
          100: '#f3e8ff',
          200: '#e9d5ff',
          300: '#d8b4fe',
          400: '#c084fc',
          500: '#a855f7', // Main moment purple
          600: '#9333ea',
          700: '#7c3aed',
          800: '#6b21a8',
          900: '#581c87',
          950: '#3b0764',
        },
        
        // Success - for positive analytics metrics
        success: {
          50: '#f0fdf4',
          100: '#dcfce7',
          200: '#bbf7d0',
          300: '#86efac',
          400: '#4ade80',
          500: '#22c55e',
          600: '#16a34a',
          700: '#15803d',
          800: '#166534',
          900: '#14532d',
        },
        
        // Warning - for attention-needed metrics
        warning: {
          50: '#fefce8',
          100: '#fef3c7',
          200: '#fde68a',
          300: '#fcd34d',
          400: '#fbbf24',
          500: '#f59e0b',
          600: '#d97706',
          700: '#b45309',
          800: '#92400e',
          900: '#78350f',
        },
        
        // Error - for negative metrics and alerts
        error: {
          50: '#fef2f2',
          100: '#fee2e2',
          200: '#fecaca',
          300: '#fca5a5',
          400: '#f87171',
          500: '#ef4444',
          600: '#dc2626',
          700: '#b91c1c',
          800: '#991b1b',
          900: '#7f1d1d',
        },
      },
      
      // Custom fonts for Kairos
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['Merriweather', 'serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Poppins', 'sans-serif'], // For headings and logos
      },
      
      // Custom spacing for the Kairos design system
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Custom animations for "the perfect moment" theme
      animation: {
        'fade-in': 'fadeIn 0.5s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'moment-glow': 'momentGlow 3s ease-in-out infinite',
        'data-flow': 'dataFlow 20s linear infinite',
      },
      
      // Custom keyframes
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.8' },
        },
        momentGlow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.8)' },
        },
        dataFlow: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100vw)' },
        },
      },
      
      // Custom border radius
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      },
      
      // Custom shadows for depth
      boxShadow: {
        'kairos': '0 4px 20px rgba(59, 130, 246, 0.15)',
        'moment': '0 8px 40px rgba(168, 85, 247, 0.2)',
        'data': '0 2px 10px rgba(0, 0, 0, 0.1)',
      },
      
      // Custom gradients
      backgroundImage: {
        'gradient-kairos': 'linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)',
        'gradient-moment': 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
        'gradient-data': 'linear-gradient(135deg, #06b6d4 0%, #3b82f6 100%)',
      },
    },
  },
  
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('@tailwindcss/aspect-ratio'),
    
    // Custom plugin for theme variables and component classes
    function({ addBase, addComponents, theme }) {
      addBase({
        ':root': {
          '--color-primary': theme('colors.primary.500'),
          '--color-secondary': theme('colors.secondary.500'),
          '--color-accent': theme('colors.accent.500'),
          '--shadow-kairos': theme('boxShadow.kairos'),
          '--gradient-kairos': theme('backgroundImage.gradient-kairos'),
        },
        '.dark': {
          '--color-primary': theme('colors.primary.400'),
          '--color-secondary': theme('colors.secondary.400'),
          '--color-accent': theme('colors.accent.400'),
        }
      })
      
      addComponents({
        // Button components
        '.btn': {
          '@apply inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none': {},
        },
        '.btn-primary': {
          '@apply bg-primary-600 text-white hover:bg-primary-700 active:bg-primary-800': {},
        },
        '.btn-secondary': {
          '@apply bg-secondary-100 text-secondary-900 hover:bg-secondary-200 active:bg-secondary-300': {},
        },
        '.btn-outline': {
          '@apply border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 active:bg-gray-100': {},
        },
        '.btn-ghost': {
          '@apply text-gray-700 hover:bg-gray-100 active:bg-gray-200': {},
        },
        '.btn-destructive': {
          '@apply bg-red-600 text-white hover:bg-red-700 active:bg-red-800': {},
        },
        
        // Card component
        '.card': {
          '@apply bg-white rounded-lg shadow-sm border border-gray-200 p-6': {},
        },
        
        // Input components
        '.input': {
          '@apply block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm': {},
        },
        '.label': {
          '@apply block text-sm font-medium text-gray-700 mb-1': {},
        },
        
        // Badge components
        '.badge': {
          '@apply inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium': {},
        },
        '.badge-primary': {
          '@apply bg-primary-100 text-primary-800': {},
        },
        '.badge-secondary': {
          '@apply bg-gray-100 text-gray-800': {},
        },
        '.badge-success': {
          '@apply bg-green-100 text-green-800': {},
        },
        '.badge-warning': {
          '@apply bg-yellow-100 text-yellow-800': {},
        },
        '.badge-error': {
          '@apply bg-red-100 text-red-800': {},
        },
      })
    }
  ],
}