/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Light mode colors
        background: {
          DEFAULT: '#FAFAF9',
          dark: '#0C0A09',
        },
        surface: {
          DEFAULT: '#FFFFFF',
          dark: '#1C1917',
        },
        // Accent - Dynamic via CSS variables
        accent: {
          DEFAULT: 'var(--color-accent)',
          soft: '#CCFBF1',
          dark: 'var(--color-accent-dark)',
          'dark-soft': '#134E4A',
        },
        // Text colors using stone palette
        primary: {
          DEFAULT: '#1C1917',
          dark: '#FAFAF9',
        },
        secondary: {
          DEFAULT: '#78716C',
          dark: '#A8A29E',
        },
        tertiary: {
          DEFAULT: '#A8A29E',
          dark: '#78716C',
        },
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
      },
      fontSize: {
        timer: ['6rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
        'timer-lg': ['8rem', { lineHeight: '1', letterSpacing: '-0.02em' }],
      },
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },
      borderRadius: {
        sm: '8px',
        md: '12px',
        lg: '16px',
      },
      boxShadow: {
        soft: '0 1px 2px 0 rgb(28 25 23 / 0.05)',
        medium: '0 4px 6px -1px rgb(28 25 23 / 0.07), 0 2px 4px -2px rgb(28 25 23 / 0.05)',
        large: '0 10px 15px -3px rgb(28 25 23 / 0.08), 0 4px 6px -4px rgb(28 25 23 / 0.05)',
      },
      animation: {
        'breathe-in': 'breatheIn 1.5s ease-out forwards',
        'breathe-out': 'breatheOut 1.5s ease-in forwards',
        'pulse-soft': 'pulseSoft 2s ease-in-out infinite',
        'fade-in': 'fadeIn 0.3s ease-out forwards',
        'scale-in': 'scaleIn 0.3s ease-out forwards',
        'celebrate': 'celebrate 0.6s ease-out forwards',
      },
      keyframes: {
        breatheIn: {
          '0%': { transform: 'scale(1)', opacity: '0.8' },
          '100%': { transform: 'scale(1.3)', opacity: '1' },
        },
        breatheOut: {
          '0%': { transform: 'scale(1.3)', opacity: '1' },
          '100%': { transform: 'scale(1)', opacity: '0.8' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        celebrate: {
          '0%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
      },
      transitionDuration: {
        fast: '150ms',
        normal: '300ms',
        slow: '500ms',
      },
      transitionTimingFunction: {
        'out-custom': 'cubic-bezier(0.33, 1, 0.68, 1)',
        'in-out-custom': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [],
};
