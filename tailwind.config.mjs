/** @type {import('tailwindcss').Config} */
export default {
  content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],

  theme: {
    extend: {
      // Standardized Professional Typography System
      fontFamily: {
        sans: ['Source Sans Pro', 'system-ui', '-apple-system', 'sans-serif'],
        display: ['Montserrat', 'Source Sans Pro', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['SF Mono', 'Monaco', 'monospace'],
      },

      // Consistent Typography Scale - Mobile First with Perfect Scaling
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

        // Standardized Heading Sizes with Consistent Scaling
        'heading-sm': ['1.5rem', { lineHeight: '2rem', letterSpacing: '-0.02em' }],      // 24px - Small headings
        'heading-md': ['2rem', { lineHeight: '2.5rem', letterSpacing: '-0.025em' }],     // 32px - Medium headings
        'heading-lg': ['2.5rem', { lineHeight: '3rem', letterSpacing: '-0.03em' }],      // 40px - Large headings
        'heading-xl': ['3rem', { lineHeight: '3.5rem', letterSpacing: '-0.035em' }],     // 48px - XL headings
        'heading-2xl': ['3.75rem', { lineHeight: '4rem', letterSpacing: '-0.04em' }],    // 60px - Hero headings
        'heading-3xl': ['4.5rem', { lineHeight: '4.5rem', letterSpacing: '-0.045em' }],  // 72px - Large hero
      },

      // SBA Brand Color System
      colors: {
        // Primary brand colors from SBA logo
        'primary': '#1E3A5F',
        'primary-dark': '#162D47',
        'primary-light': '#2D4A6B',
        'accent': '#8B9199',

        // Professional gray scale
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

        // Legacy SBA colors for compatibility
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
        // Standardized Container System
        '.container-sba': {
          '@apply max-w-7xl mx-auto px-4 sm:px-6 lg:px-8': {},
        },
        '.container-sba-narrow': {
          '@apply max-w-4xl mx-auto px-4 sm:px-6 lg:px-8': {},
        },
        '.container-sba-wide': {
          '@apply max-w-8xl mx-auto px-4 sm:px-6 lg:px-8': {},
        },

        // Standardized Section Spacing
        '.section-padding': {
          '@apply py-12 sm:py-16 lg:py-20': {},
        },
        '.section-padding-lg': {
          '@apply py-16 sm:py-20 lg:py-24': {},
        },
        '.section-padding-sm': {
          '@apply py-8 sm:py-12 lg:py-16': {},
        },

        // Standardized Typography Styles
        '.heading-hero': {
          '@apply text-heading-lg sm:text-heading-xl lg:text-heading-2xl font-black text-sba-navy leading-tight tracking-tight': {},
        },
        '.heading-section': {
          '@apply text-heading-md sm:text-heading-lg lg:text-heading-xl font-bold text-sba-navy leading-tight': {},
        },
        '.heading-card': {
          '@apply text-heading-sm font-semibold text-sba-navy leading-tight': {},
        },
        '.text-body': {
          '@apply text-base lg:text-lg text-gray-600 leading-relaxed': {},
        },
        '.text-body-lg': {
          '@apply text-lg lg:text-xl text-gray-600 leading-relaxed': {},
        },

        // Standardized Button System
        '.btn-primary': {
          '@apply bg-sba-navy text-white px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold tracking-wide hover:bg-sba-navy-dark transition-all duration-300 active:scale-95 shadow-lg hover:shadow-xl rounded-xl': {},
        },
        '.btn-secondary': {
          '@apply bg-white text-sba-navy border-2 border-sba-navy px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold tracking-wide hover:bg-sba-navy hover:text-white transition-all duration-300 active:scale-95 rounded-xl': {},
        },
        '.btn-outline': {
          '@apply border-2 border-sba-navy text-sba-navy px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold tracking-wide hover:bg-sba-navy hover:text-white transition-all duration-300 rounded-xl': {},
        },
        '.btn-ghost': {
          '@apply text-sba-navy px-6 sm:px-8 py-3 sm:py-4 text-sm sm:text-base font-semibold tracking-wide hover:bg-sba-navy/10 transition-all duration-300 rounded-xl': {},
        },

        // Standardized Card System
        '.card-sba': {
          '@apply bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2': {},
        },
        '.card-property': {
          '@apply card-sba overflow-hidden cursor-pointer': {},
        },
        '.card-feature': {
          '@apply card-sba p-6 sm:p-8': {},
        },
        '.card-team': {
          '@apply card-sba p-6 sm:p-8 text-center': {},
        },

        // Standardized Grid Systems
        '.grid-properties': {
          '@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6': {},
        },
        '.grid-features': {
          '@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8': {},
        },
        '.grid-team': {
          '@apply grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12': {},
        },
      });
    },
  ],
};