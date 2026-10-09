import type { Config } from 'tailwindcss';

// Colors, fonts, radii and shadows point at the CSS variables declared in
// src/app/globals.css (mirrored from the legacy site's design-tokens.css), so a
// token can be changed or overridden at runtime (theme, dark mode) in one place.

/** `--color-<name>` holds RGB channels; `<alpha-value>` keeps `bg-x/50` working. */
const color = (name: string) => `rgb(var(--color-${name}) / <alpha-value>)`;

const palette = (name: string, steps: number[]) =>
  Object.fromEntries(steps.map((step) => [step, color(`${name}-${step}`)]));

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: palette('brand', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900]),
        neutral: palette('neutral', [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]),
        scan: {
          green: { DEFAULT: color('scan-green'), ink: color('scan-green-ink') },
          navy: color('scan-navy'),
        },
        success: { DEFAULT: color('success'), bg: color('success-bg') },
        warning: { DEFAULT: color('warning'), bg: color('warning-bg') },
        error: { DEFAULT: color('error'), bg: color('error-bg') },
        info: { DEFAULT: color('info'), bg: color('info-bg') },
        // Brand-themed palette of the loyalty club (set by <BrandScope>, see lib/brand).
        club: Object.fromEntries(
          [
            'primary',
            'primary-dark',
            'primary-contrast',
            'ink',
            'text',
            'muted',
            'surface',
            'background',
            'accent',
            'accent-text',
            'accent-soft',
            'gold',
            'border',
          ].map((name) => [name, `rgb(var(--club-${name}) / <alpha-value>)`]),
        ),
      },
      fontFamily: {
        sans: 'var(--font-sans)',
        'club-title': ['var(--font-club-title)', 'Arial Narrow', 'sans-serif'],
        'club-text': ['var(--font-club-text)', 'Arial', 'sans-serif'],
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        pill: 'var(--radius-pill)',
        'club-sm': 'var(--club-radius-sm)',
        'club-md': 'var(--club-radius-md)',
        'club-lg': 'var(--club-radius-lg)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        xl: 'var(--shadow-xl)',
      },
      maxWidth: {
        content: 'var(--max-content)',
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};

export default config;
