import type { Config } from 'tailwindcss';

// Colors, fonts, radii and shadows mirror the tokens defined in the legacy
// static site's design-tokens.css, so the new app keeps the same brand look.
const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#F2FBF5',
          100: '#DDF4E4',
          200: '#BAE8C8',
          300: '#8FD8A7',
          400: '#67C888',
          500: '#51BD6F',
          600: '#2FA55C',
          700: '#1F8443',
          800: '#176733',
          900: '#0F4A25',
        },
        neutral: {
          50: '#F6F7F8',
          100: '#EFF1F2',
          200: '#E3E6E8',
          300: '#D2D6DA',
          400: '#AFB6BB',
          500: '#8C949B',
          600: '#6B747C',
          700: '#4E565D',
          800: '#343B41',
          900: '#1F2429',
          950: '#12161A',
        },
        success: { DEFAULT: '#16794A', bg: '#E8F6EE' },
        warning: { DEFAULT: '#8A5A00', bg: '#FBF1DC' },
        error: { DEFAULT: '#B3261E', bg: '#FBEAE8' },
        info: { DEFAULT: '#2A5FD0', bg: '#EAF0FD' },
      },
      fontFamily: {
        sans: ['"Instrument Sans"', '"Helvetica Neue"', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xs: '4px',
        sm: '6px',
        md: '10px',
        lg: '14px',
        pill: '999px',
      },
      boxShadow: {
        sm: '0 1px 2px rgba(18,22,26,.05)',
        md: '0 1px 3px rgba(18,22,26,.06),0 1px 2px rgba(18,22,26,.04)',
        lg: '0 6px 16px rgba(18,22,26,.08),0 1px 3px rgba(18,22,26,.05)',
        xl: '0 16px 40px rgba(18,22,26,.12)',
      },
      maxWidth: {
        content: '1200px',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
