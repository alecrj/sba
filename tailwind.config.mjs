/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

  theme: {
    extend: {
      // Modern Typography System
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Manrope', 'Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'monospace'],
      },

      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem', letterSpacing: '0.025em' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem', letterSpacing: '0.01em' }],
        'base': ['1rem', { lineHeight: '1.5rem', letterSpacing: '0' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem', letterSpacing: '-0.01em' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem', letterSpacing: '-0.015em' }],
        '2xl': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem', letterSpacing: '-0.025em' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem', letterSpacing: '-0.03em' }],
        '5xl': ['3rem', { lineHeight: '1.05', letterSpacing: '-0.035em' }],
        '6xl': ['3.75rem', { lineHeight: '1.05', letterSpacing: '-0.04em' }],
        '7xl': ['4.5rem', { lineHeight: '1.05', letterSpacing: '-0.045em' }],
        '8xl': ['6rem', { lineHeight: '1.05', letterSpacing: '-0.05em' }],
        '9xl': ['8rem', { lineHeight: '1.05', letterSpacing: '-0.055em' }],
      },

      // Modern Color System
      colors: {
        // Primary brand color (Airbnb-inspired red)
        'primary': '#FF385C',

        // Gray scale
        'gray': {
          50: '#F9FAFB',
          100: '#F3F4F6',
          200: '#E5E7EB',
          300: '#D1D5DB',
          400: '#9CA3AF',
          500: '#6B7280',
          600: '#4B5563',
          700: '#374151',
          800: '#1F2937',
          900: '#111827',
        },

        // Legacy SBA colors for existing components
        'sba': {
          'navy': '#1e3a5f',
          'navy-dark': '#162d47',
          'navy-light': '#2d4a6b',
          'gray': '#8b9199',
          'gray-dark': '#6b7280',
          'gray-light': '#e5e7eb',
        },
      },

      // Premium Spacing Scale
      spacing: {
        '18': '4.5rem',   // 72px
        '22': '5.5rem',   // 88px
        '26': '6.5rem',   // 104px
        '30': '7.5rem',   // 120px
        '88': '22rem',    // 352px
        '104': '26rem',   // 416px
        '112': '28rem',   // 448px
        '128': '32rem',   // 512px
        '144': '36rem',   // 576px
        '192': '48rem',   // 768px
      },

      // Sophisticated Border Radius
      borderRadius: {
        'xs': '0.125rem',  // 2px
        'sm': '0.25rem',   // 4px
        'md': '0.375rem',  // 6px
        'lg': '0.5rem',    // 8px
        'xl': '0.75rem',   // 12px
        '2xl': '1rem',     // 16px
        '3xl': '1.5rem',   // 24px
        '4xl': '2rem',     // 32px
      },

      // Professional Shadow System
      boxShadow: {
        'xs': '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        'sm': '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
        'md': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
        'xl': '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
        '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
        'inner': 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
        'glass': '0 8px 32px 0 rgba(30, 58, 95, 0.15)',
        'glass-lg': '0 16px 48px 0 rgba(30, 58, 95, 0.2)',
        'glow': '0 0 20px rgba(30, 58, 95, 0.3)',
      },

      // Smooth Animations
      animation: {
        'fade-in': 'fadeIn 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-up': 'slideUp 1s cubic-bezier(0.16, 1, 0.3, 1)',
        'slide-down': 'slideDown 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
        'scale-in': 'scaleIn 0.6s cubic-bezier(0.16, 1, 0.3, 1)',
        'float': 'float 8s ease-in-out infinite',
        'pulse-slow': 'pulse 4s ease-in-out infinite',
        'shimmer': 'shimmer 3s linear infinite',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideDown: {
          '0%': { opacity: '0', transform: 'translateY(-32px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.9)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '0%': { transform: 'translateX(-100%)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },

      // Typography
      lineHeight: {
        'none': '1',
        'tight': '1.1',
        'snug': '1.25',
        'normal': '1.5',
        'relaxed': '1.625',
        'loose': '2',
      },

      letterSpacing: {
        'tighter': '-0.05em',
        'tight': '-0.025em',
        'normal': '0',
        'wide': '0.025em',
        'wider': '0.05em',
        'widest': '0.1em',
      },

      // Modern Grid Systems
      gridTemplateColumns: {
        'auto-fit-xs': 'repeat(auto-fit, minmax(12rem, 1fr))',
        'auto-fit-sm': 'repeat(auto-fit, minmax(16rem, 1fr))',
        'auto-fit-md': 'repeat(auto-fit, minmax(20rem, 1fr))',
        'auto-fit-lg': 'repeat(auto-fit, minmax(24rem, 1fr))',
        'service-cards': 'repeat(auto-fit, minmax(300px, 1fr))',
        'feature-grid': 'repeat(auto-fit, minmax(250px, 1fr))',
      },

      // Professional Container
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '3rem',
          xl: '4rem',
          '2xl': '6rem',
        },
        screens: {
          sm: '640px',
          md: '768px',
          lg: '1024px',
          xl: '1280px',
          '2xl': '1400px',
        },
      },

      // Backdrop Effects
      backdropBlur: {
        'xs': '2px',
        'sm': '4px',
        'md': '8px',
        'lg': '16px',
        'xl': '24px',
        '2xl': '32px',
      },

      // Modern Transitions
      transitionTimingFunction: {
        'ease-out-expo': 'cubic-bezier(0.16, 1, 0.3, 1)',
        'ease-in-expo': 'cubic-bezier(0.7, 0, 0.84, 0)',
        'ease-in-out-expo': 'cubic-bezier(0.87, 0, 0.13, 1)',
      },
    },
  },

  plugins: [
    // Professional utilities
    function({ addUtilities, addComponents }) {
      addUtilities({
        // Text utilities
        '.text-balance': {
          'text-wrap': 'balance',
        },
        '.text-pretty': {
          'text-wrap': 'pretty',
        },

        // Glass effects
        '.glass': {
          'background': 'rgba(255, 255, 255, 0.9)',
          'backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(255, 255, 255, 0.2)',
        },
        '.glass-dark': {
          'background': 'rgba(30, 58, 95, 0.1)',
          'backdrop-filter': 'blur(16px)',
          'border': '1px solid rgba(30, 58, 95, 0.2)',
        },

        // Hide scrollbar
        '.hide-scrollbar': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
        },
        '.hide-scrollbar::-webkit-scrollbar': {
          'display': 'none',
        },

        // Brand gradient
        '.gradient-sba': {
          'background': 'linear-gradient(135deg, #1e3a5f 0%, #2d4a6b 100%)',
          '-webkit-background-clip': 'text',
          '-webkit-text-fill-color': 'transparent',
          'background-clip': 'text',
        },
      });

      addComponents({
        // Button components
        '.btn-primary': {
          '@apply bg-sba-navy text-white px-8 py-4 text-sm font-semibold tracking-wide hover:bg-sba-navy-dark transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl': {},
        },
        '.btn-secondary': {
          '@apply bg-white text-sba-navy border-2 border-sba-navy px-8 py-4 text-sm font-semibold tracking-wide hover:bg-sba-navy hover:text-white transition-all duration-300 active:scale-95': {},
        },
        '.btn-ghost': {
          '@apply text-sba-navy border-2 border-sba-navy px-8 py-4 text-sm font-semibold tracking-wide hover:bg-sba-navy hover:text-white transition-all duration-300': {},
        },

        // Card components
        '.card': {
          '@apply bg-white border border-sba-gray-light shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1': {},
        },
        '.card-feature': {
          '@apply bg-white border border-sba-gray-light p-8 hover:border-sba-navy hover:shadow-xl transition-all duration-500 hover:-translate-y-2': {},
        },
      });
    },
  ],
};