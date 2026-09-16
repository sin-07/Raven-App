/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        // Outfit — Ultra-modern, bold & geometric for headings, titles & hero display
        outfit: ['var(--font-outfit)', 'sans-serif'],
        // Plus Jakarta Sans — Crisp, high-readability modern grotesque for body & UI
        jakarta: ['var(--font-jakarta)', 'sans-serif'],
        // Space Grotesk — Fancy tech aesthetic for accents, badges, and highlights
        space: ['var(--font-space)', 'sans-serif'],
        // Semantic aliases
        display: ['var(--font-outfit)', 'sans-serif'],
        heading: ['var(--font-outfit)', 'sans-serif'],
        body: ['var(--font-jakarta)', 'sans-serif'],
        brand: ['var(--font-outfit)', 'sans-serif'],
        accent: ['var(--font-space)', 'sans-serif'],
        // Fallback aliases so existing code smoothly uses new modern typography
        cormorant: ['var(--font-outfit)', 'sans-serif'],
        bricolage: ['var(--font-jakarta)', 'sans-serif'],
        sacramento: ['var(--font-outfit)', 'sans-serif'],
        macondo: ['var(--font-space)', 'sans-serif'],
        cinzel: ['var(--font-outfit)', 'sans-serif'],
        machina: ['var(--font-space)', 'sans-serif'],
        juana: ['var(--font-outfit)', 'sans-serif'],
        helvetica: ['var(--font-jakarta)', 'sans-serif'],
        mono: ['JetBrains Mono', 'ui-monospace', 'monospace'],
        sans: ['var(--font-jakarta)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Deep Black - Primary Dark Theme
        primary: {
          50: '#f7f7f7',
          100: '#e3e3e3',
          200: '#c8c8c8',
          300: '#a4a4a4',
          400: '#818181',
          500: '#666666',
          600: '#515151',
          700: '#434343',
          800: '#383838',
          900: '#1a1a1a',
          950: '#0d0d0d',
        },
        // Emerald Green - Accent Color
        accent: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        },
        // Pure Black shades
        dark: {
          50: '#fafafa',
          100: '#f5f5f5',
          200: '#e5e5e5',
          300: '#d4d4d4',
          400: '#a3a3a3',
          500: '#737373',
          600: '#525252',
          700: '#404040',
          800: '#262626',
          900: '#171717',
          950: '#0a0a0a',
        },
        // Emerald - Success, Growth, Achievement
        success: {
          50: '#ecfdf5',
          100: '#d1fae5',
          200: '#a7f3d0',
          300: '#6ee7b7',
          400: '#34d399',
          500: '#10b981',
          600: '#059669',
          700: '#047857',
          800: '#065f46',
          900: '#064e3b',
        }
      },
      // (other theme extensions remain unchanged)
      animation: {
        'gradient-x': 'gradient-x 15s ease infinite',
        'float': 'float 20s ease-in-out infinite',
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'fade-in-up': 'fade-in-up 0.8s ease-out',
        'scale-in': 'scale-in 0.5s ease-out',
      },
      keyframes: {
        'gradient-x': {
          '0%, 100%': {
            'background-size': '200% 200%',
            'background-position': 'left center'
          },
          '50%': {
            'background-size': '200% 200%',
            'background-position': 'right center'
          }
        },
        'float': {
          '0%, 100%': {
            transform: 'translateY(0px) translateX(0px)',
            opacity: '0.3'
          },
          '50%': {
            transform: 'translateY(-30px) translateX(20px)',
            opacity: '0.8'
          }
        },
        'fade-in-up': {
          '0%': {
            opacity: '0',
            transform: 'translateY(20px)'
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0)'
          }
        },
        'scale-in': {
          '0%': {
            opacity: '0',
            transform: 'scale(0.9)'
          },
          '100%': {
            opacity: '1',
            transform: 'scale(1)'
          }
        }
      }
    },
  },
  plugins: [],
}
