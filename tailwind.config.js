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
        // Background colors - Dark first (pure black immersive)
        background: {
          DEFAULT: '#000000',
          elevated: '#080808',
          light: '#FAFAFA',
          'light-elevated': '#FFFFFF',
        },
        surface: {
          DEFAULT: '#0C0C0C',
          light: '#F5F5F5',
        },
        border: {
          DEFAULT: '#1A1A1A',
          light: '#E5E5E5',
        },
        // Accent - Single blue accent
        accent: {
          DEFAULT: '#4F6EF7',
          hover: '#6B85F9',
          soft: 'rgba(79, 110, 247, 0.15)',
          glow: 'rgba(79, 110, 247, 0.2)',
          'light-hover': '#3B5BDB',
          'light-soft': 'rgba(79, 110, 247, 0.1)',
        },
        // Warm glow for break sessions
        warm: {
          glow: 'rgba(247, 186, 79, 0.15)',
        },
        // Text colors - Dark first
        primary: {
          DEFAULT: '#FAFAFA',
          light: '#171717',
        },
        secondary: {
          DEFAULT: '#808080',
          light: '#525252',
        },
        tertiary: {
          DEFAULT: '#4A4A4A',
          light: '#A3A3A3',
        },
      },
      fontFamily: {
        sans: [
          'var(--font-inter)',
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          'var(--font-mono)',
          'JetBrains Mono',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
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
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        full: '9999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(0, 0, 0, 0.3)',
        DEFAULT: '0 2px 4px rgba(0, 0, 0, 0.4)',
        md: '0 4px 8px rgba(0, 0, 0, 0.4)',
        lg: '0 8px 16px rgba(0, 0, 0, 0.5)',
        xl: '0 12px 24px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px rgba(79, 110, 247, 0.3)',
        'glow-sm': '0 0 10px rgba(79, 110, 247, 0.2)',
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
        fast: '100ms',
        normal: '150ms',
        slow: '300ms',
      },
      transitionTimingFunction: {
        'out-custom': 'cubic-bezier(0.33, 1, 0.68, 1)',
        'in-out-custom': 'cubic-bezier(0.65, 0, 0.35, 1)',
      },
    },
  },
  plugins: [
    // Add light: variant for dark-first design system
    function({ addVariant }) {
      addVariant('light', '.light &');
    },
  ],
};
