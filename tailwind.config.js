// File: kairos-frontend/tailwind.config.js
// Tailwind CSS configuration for Kairos themes

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      // Colors using CSS custom properties for theme switching
      colors: {
        primary: {
          DEFAULT: 'var(--kairos-color-primary)',
          hover: 'var(--kairos-color-primary-hover)',
          active: 'var(--kairos-color-primary-active)',
        },
        secondary: 'var(--kairos-color-secondary)',
        accent: 'var(--kairos-color-accent)',
        background: {
          DEFAULT: 'var(--kairos-color-background)',
          secondary: 'var(--kairos-color-background-secondary)',
        },
        surface: {
          DEFAULT: 'var(--kairos-color-surface)',
          hover: 'var(--kairos-color-surface-hover)',
        },
        text: {
          DEFAULT: 'var(--kairos-color-text)',
          secondary: 'var(--kairos-color-text-secondary)',
          muted: 'var(--kairos-color-text-muted)',
        },
        border: {
          DEFAULT: 'var(--kairos-color-border)',
          light: 'var(--kairos-color-border-light)',
        },
        success: 'var(--kairos-color-success)',
        warning: 'var(--kairos-color-warning)',
        error: 'var(--kairos-color-error)',
        info: 'var(--kairos-color-info)',
      },
      
      // Typography using CSS custom properties
      fontFamily: {
        sans: ['var(--kairos-font-family)', 'system-ui', 'sans-serif'],
        mono: ['var(--kairos-font-family-mono)', 'monospace'],
      },
      
      // Shadows using CSS custom properties
      boxShadow: {
        sm: 'var(--kairos-shadow-sm)',
        DEFAULT: 'var(--kairos-shadow-md)',
        md: 'var(--kairos-shadow-md)',
        lg: 'var(--kairos-shadow-lg)',
        xl: 'var(--kairos-shadow-xl)',
      },
      
      // Border radius using CSS custom properties
      borderRadius: {
        sm: 'var(--kairos-border-radius-sm)',
        DEFAULT: 'var(--kairos-border-radius-md)',
        md: 'var(--kairos-border-radius-md)',
        lg: 'var(--kairos-border-radius-lg)',
      },
      
      // Animation durations using CSS custom properties
      transitionDuration: {
        fast: 'var(--kairos-animation-duration-fast)',
        normal: 'var(--kairos-animation-duration-normal)',
        slow: 'var(--kairos-animation-duration-slow)',
      },
      
      // Custom spacing scale
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
        '128': '32rem',
      },
      
      // Custom breakpoints for perfect moment delivery
      screens: {
        'xs': '475px',
        '3xl': '1920px',
      },
      
      // Animation utilities
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'slide-down': 'slideDown 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
        'pulse-soft': 'pulseSoft 2s infinite',
        'float': 'float 3s ease-in-out infinite',
      },
      
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
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-5px)' },
        },
      },
      
      // Grid templates for complex layouts
      gridTemplateColumns: {
        'auto-fit-250': 'repeat(auto-fit, minmax(250px, 1fr))',
        'auto-fit-300': 'repeat(auto-fit, minmax(300px, 1fr))',
        'auto-fill-250': 'repeat(auto-fill, minmax(250px, 1fr))',
      },
      
      // Backdrop blur utilities
      backdropBlur: {
        xs: '2px',
      },
      
      // Custom aspect ratios
      aspectRatio: {
        '4/3': '4 / 3',
        '3/2': '3 / 2',
        '2/3': '2 / 3',
        '9/16': '9 / 16',
      },
    },
  },
  plugins: [
    // Forms plugin for better form styling
    require('@tailwindcss/forms')({
      strategy: 'class',
    }),
    
    // Typography plugin for rich text content
    require('@tailwindcss/typography'),
    
    // Aspect ratio plugin
    require('@tailwindcss/aspect-ratio'),
    
    // Container queries plugin
    require('@tailwindcss/container-queries'),
    
    // Custom plugin for Kairos-specific utilities
    function({ addUtilities, addComponents, theme }) {
      // Custom utilities
      addUtilities({
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': {
            display: 'none',
          },
        },
        '.scrollbar-thin': {
          'scrollbar-width': 'thin',
          '&::-webkit-scrollbar': {
            width: '6px',
            height: '6px',
          },
          '&::-webkit-scrollbar-track': {
            'background-color': 'var(--kairos-color-background-secondary)',
          },
          '&::-webkit-scrollbar-thumb': {
            'background-color': 'var(--kairos-color-border)',
            'border-radius': '3px',
          },
          '&::-webkit-scrollbar-thumb:hover': {
            'background-color': 'var(--kairos-color-text-muted)',
          },
        },
      });
      
      // Custom components
      addComponents({
        '.kairos-card': {
          'background-color': 'var(--kairos-color-surface)',
          'border': '1px solid var(--kairos-color-border)',
          'border-radius': 'var(--kairos-border-radius-md)',
          'box-shadow': 'var(--kairos-shadow-sm)',
          'transition': 'all var(--kairos-animation-duration-fast) ease-in-out',
          '&:hover': {
            'background-color': 'var(--kairos-color-surface-hover)',
            'box-shadow': 'var(--kairos-shadow-md)',
          },
        },
        '.kairos-button': {
          'background-color': 'var(--kairos-color-primary)',
          'color': 'white',
          'border-radius': 'var(--kairos-border-radius-md)',
          'padding': '0.5rem 1rem',
          'font-weight': '500',
          'transition': 'all var(--kairos-animation-duration-fast) ease-in-out',
          '&:hover': {
            'background-color': 'var(--kairos-color-primary-hover)',
            'transform': 'translateY(-1px)',
          },
          '&:active': {
            'background-color': 'var(--kairos-color-primary-active)',
            'transform': 'translateY(0)',
          },
          '&:disabled': {
            'opacity': '0.5',
            'cursor': 'not-allowed',
            'transform': 'none',
          },
        },
        '.kairos-input': {
          'background-color': 'var(--kairos-color-background)',
          'border': '1px solid var(--kairos-color-border)',
          'border-radius': 'var(--kairos-border-radius-md)',
          'padding': '0.5rem 0.75rem',
          'color': 'var(--kairos-color-text)',
          'transition': 'all var(--kairos-animation-duration-fast) ease-in-out',
          '&:focus': {
            'outline': 'none',
            'border-color': 'var(--kairos-color-primary)',
            'box-shadow': '0 0 0 3px rgb(from var(--kairos-color-primary) r g b / 0.1)',
          },
          '&::placeholder': {
            'color': 'var(--kairos-color-text-muted)',
          },
        },
        '.kairos-badge': {
          'background-color': 'var(--kairos-color-primary)',
          'color': 'white',
          'border-radius': 'var(--kairos-border-radius-lg)',
          'padding': '0.25rem 0.5rem',
          'font-size': '0.75rem',
          'font-weight': '500',
          'text-transform': 'uppercase',
          'letter-spacing': '0.025em',
        },
      });
    },
  ],
};