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
    },
  },
  plugins: [],
};
