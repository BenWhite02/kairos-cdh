// File: tailwind.config.js
// 🎨 KAIROS Tailwind CSS Configuration
// Integrates with theme system for CSS-in-classes approach

import { fontFamily } from 'tailwindcss/defaultTheme'

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx,md,mdx}',
    './.storybook/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      // Color system using CSS variables
      colors: {
        // Primary colors
        primary: {
          50: 'var(--kairos-color-primary-50)',
          100: 'var(--kairos-color-primary-100)',
          200: 'var(--kairos-color-primary-200)',
          300: 'var(--kairos-color-primary-300)',
          400: 'var(--kairos-color-primary-400)',
          500: 'var(--kairos-color-primary-500)',
          600: 'var(--kairos-color-primary-600)',
          700: 'var(--kairos-color-primary-700)',
          800: 'var(--kairos-color-primary-800)',
          900: 'var(--kairos-color-primary-900)',
          DEFAULT: 'var(--kairos-color-primary-500)'
        },
        
        // Secondary colors
        secondary: {
          50: 'var(--kairos-color-secondary-50)',
          100: 'var(--kairos-color-secondary-100)',
          200: 'var(--kairos-color-secondary-200)',
          300: 'var(--kairos-color-secondary-300)',
          400: 'var(--kairos-color-secondary-400)',
          500: 'var(--kairos-color-secondary-500)',
          600: 'var(--kairos-color-secondary-600)',
          700: 'var(--kairos-color-secondary-700)',
          800: 'var(--kairos-color-secondary-800)',
          900: 'var(--kairos-color-secondary-900)',
          DEFAULT: 'var(--kairos-color-secondary-500)'
        },
        
        // Accent colors
        accent: {
          50: 'var(--kairos-color-accent-50)',
          100: 'var(--kairos-color-accent-100)',
          200: 'var(--kairos-color-accent-200)',
          300: 'var(--kairos-color-accent-300)',
          400: 'var(--kairos-color-accent-400)',
          500: 'var(--kairos-color-accent-500)',
          600: 'var(--kairos-color-accent-600)',
          700: 'var(--kairos-color-accent-700)',
          800: 'var(--kairos-color-accent-800)',
          900: 'var(--kairos-color-accent-900)',
          DEFAULT: 'var(--kairos-color-accent-500)'
        },
        
        // Semantic colors
        success: 'var(--kairos-color-success)',
        warning: 'var(--kairos-color-warning)',
        error: 'var(--kairos-color-error)',
        info: 'var(--kairos-color-info)',
        
        // Background colors
        background: 'var(--kairos-color-background)',
        surface: 'var(--kairos-color-surface)',
        'surface-elevated': 'var(--kairos-color-surface-elevated)',
        
        // Text colors
        'text-primary': 'var(--kairos-color-text-primary)',
        'text-secondary': 'var(--kairos-color-text-secondary)',
        'text-tertiary': 'var(--kairos-color-text-tertiary)',
        'text-inverse': 'var(--kairos-color-text-inverse)',
        
        // Border colors
        border: {
          DEFAULT: 'var(--kairos-color-border)',
          subtle: 'var(--kairos-color-border-subtle)',
          strong: 'var(--kairos-color-border-strong)'
        }
      },
      
      // Typography using CSS variables
      fontFamily: {
        sans: ['var(--kairos-font-family-sans)', ...fontFamily.sans],
        mono: ['var(--kairos-font-family-mono)', ...fontFamily.mono]
      },
      
      fontSize: {
        xs: 'var(--kairos-font-size-xs)',
        sm: 'var(--kairos-font-size-sm)',
        base: 'var(--kairos-font-size-base)',
        lg: 'var(--kairos-font-size-lg)',
        xl: 'var(--kairos-font-size-xl)',
        '2xl': 'var(--kairos-font-size-2xl)',
        '3xl': 'var(--kairos-font-size-3xl)',
        '4xl': 'var(--kairos-font-size-4xl)'
      },
      
      lineHeight: {
        tight: 'var(--kairos-line-height-tight)',
        normal: 'var(--kairos-line-height-normal)',
        relaxed: 'var(--kairos-line-height-relaxed)'
      },
      
      // Spacing using CSS variables
      spacing: {
        xs: 'var(--kairos-spacing-xs)',
        sm: 'var(--kairos-spacing-sm)',
        md: 'var(--kairos-spacing-md)',
        lg: 'var(--kairos-spacing-lg)',
        xl: 'var(--kairos-spacing-xl)',
        '2xl': 'var(--kairos-spacing-2xl)'
      },
      
      // Border radius using CSS variables
      borderRadius: {
        sm: 'var(--kairos-border-radius-sm)',
        DEFAULT: 'var(--kairos-border-radius-md)',
        md: 'var(--kairos-border-radius-md)',
        lg: 'var(--kairos-border-radius-lg)',
        xl: 'var(--kairos-border-radius-xl)',
        '2xl': 'var(--kairos-border-radius-2xl)',
        full: 'var(--kairos-border-radius-full)'
      },
      
      // Box shadows using CSS variables
      boxShadow: {
        sm: 'var(--kairos-shadow-sm)',
        DEFAULT: 'var(--kairos-shadow-md)',
        md: 'var(--kairos-shadow-md)',
        lg: 'var(--kairos-shadow-lg)',
        xl: 'var(--kairos-shadow-xl)'
      },
      
      // Animation and transitions
      transitionDuration: {
        theme: '200ms'
      },
      
      transitionTimingFunction: {
        theme: 'cubic-bezier(0.4, 0, 0.2, 1)'
      },
      
      // Custom animations
      animation: {
        'fade-in': 'fadeIn 150ms ease-out',
        'fade-out': 'fadeOut 150ms ease-in',
        'slide-in': 'slideIn 200ms ease-out',
        'slide-out': 'slideOut 200ms ease-in',
        'scale-in': 'scaleIn 200ms ease-out',
        'scale-out': 'scaleOut 200ms ease-in',
        'spin-slow': 'spin 3s linear infinite',
        'pulse-slow': 'pulse 3s ease-in-out infinite'
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' }
        },
        fadeOut: {
          '0%': { opacity: '1' },
          '100%': { opacity: '0' }
        },
        slideIn: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' }
        },
        slideOut: {
          '0%': { transform: 'translateY(0)', opacity: '1' },
          '100%': { transform: 'translateY(-10px)', opacity: '0' }
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' }
        },
        scaleOut: {
          '0%': { transform: 'scale(1)', opacity: '1' },
          '100%': { transform: 'scale(0.95)', opacity: '0' }
        }
      },
      
      // Breakpoints for responsive design
      screens: {
        xs: '475px',
        sm: '640px',
        md: '768px',
        lg: '1024px',
        xl: '1280px',
        '2xl': '1536px'
      }
    }
  },
  plugins: [
    // Add any additional Tailwind plugins here
    // require('@tailwindcss/forms'),
    // require('@tailwindcss/typography'),
    // require('@tailwindcss/aspect-ratio'),
  ]
}