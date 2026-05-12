/** @type {import('tailwindcss').Config} */
// Warm, food-friendly palette. Tokens are the only place colors are declared
// in the project — components reference them by name (bg-primary, text-ink),
// never by hex. Change a hex here and the whole app shifts.

export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#E63946', // tomato red — CTAs, badges, active states
          dark: '#C92A38',
          light: '#FEE5E8',
        },
        accent: {
          DEFAULT: '#F4A261', // warm amber — secondary highlights
          dark: '#E08E4A',
        },
        bg: '#FFFBF5', // cream page background
        surface: '#FFFFFF',
        ink: {
          DEFAULT: '#1D1D1F',
          muted: '#6B6B70',
        },
        success: '#2A9D8F',
        danger: '#E63946',
        warning: '#F4A261',
      },
      fontFamily: {
        en: ['Inter', 'system-ui', 'sans-serif'],
        ar: ['"IBM Plex Sans Arabic"', 'system-ui', 'sans-serif'],
        // default sans switches via :lang(ar) in index.css
      },
      borderRadius: {
        card: '1rem',
      },
      boxShadow: {
        soft: '0 6px 24px -10px rgba(29, 29, 31, 0.12)',
        lift: '0 12px 32px -12px rgba(29, 29, 31, 0.18)',
      },
      maxWidth: {
        container: '1200px',
      },
      // ─────────────────────────────────────────────────────────────────────
      // Motion tokens. Keep these subtle — this is a food-ordering app, not a
      // landing page demo. Everything here respects prefers-reduced-motion
      // (see index.css), so users who disable animations get instant states.
      // ─────────────────────────────────────────────────────────────────────
      keyframes: {
        'fade-up': {
          '0%':   { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'fade-in': {
          '0%':   { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-end': {
          '0%':   { opacity: '0', transform: 'translateX(16px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
        'pop-in': {
          '0%':   { opacity: '0', transform: 'scale(0.85)' },
          '60%':  { opacity: '1', transform: 'scale(1.05)' },
          '100%': { transform: 'scale(1)' },
        },
        'bounce-soft': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%':      { transform: 'translateY(-3px)' },
        },
        'pulse-ring': {
          '0%':   { boxShadow: '0 0 0 0 rgba(230, 57, 70, 0.4)' },
          '70%':  { boxShadow: '0 0 0 10px rgba(230, 57, 70, 0)' },
          '100%': { boxShadow: '0 0 0 0 rgba(230, 57, 70, 0)' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(0)' },
          '25%':      { transform: 'rotate(-8deg)' },
          '75%':      { transform: 'rotate(8deg)' },
        },
        shimmer: {
          '0%':   { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
      },
      animation: {
        'fade-up':       'fade-up 0.45s cubic-bezier(0.16, 1, 0.3, 1) both',
        'fade-in':       'fade-in 0.3s ease-out both',
        'slide-in-end':  'slide-in-end 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'pop-in':        'pop-in 0.35s cubic-bezier(0.16, 1, 0.3, 1) both',
        'bounce-soft':   'bounce-soft 0.5s ease-out',
        'pulse-ring':    'pulse-ring 1.8s ease-out infinite',
        wiggle:          'wiggle 0.5s ease-in-out',
        shimmer:         'shimmer 1.4s linear infinite',
      },
    },
  },
  plugins: [],
};
