import type { BrandTheme } from '../theme';

/**
 * Croquin — fictional grain-free pet-food brand used for the demo.
 *
 * Direction derived from an analysis of a real French pet-food site (without reusing its
 * name or assets): black and deep crimson as the dominant pair, a warm off-white
 * background, grey body text, a fresh green accent, condensed uppercase titles over a
 * humanist sans-serif, generous rounded corners and pill CTAs, warm "dog at the bowl"
 * imagery and a proud "made in France" tone. Colours were adjusted for WCAG AA.
 */
export const croquinTheme: BrandTheme = {
  slug: 'croquin',
  name: 'Croquin',
  colors: {
    primary: '#B0002F',
    primaryDark: '#8A0024',
    primaryContrast: '#FFFFFF',
    ink: '#141414',
    text: '#3F3D3D',
    muted: '#5F5C5C',
    surface: '#FFFFFF',
    background: '#F7F6F4',
    accent: '#6E9E00',
    accentText: '#4A6B00',
    accentSoft: '#EEF5DD',
    gold: '#F2B705',
    border: '#E4E1DD',
  },
  radius: { sm: '8px', md: '14px', lg: '24px', pill: '999px' },
  fonts: { title: 'barlowCondensed', text: 'sourceSans' },
  typography: 'condensed',
  assets: {
    logoText: 'Croquin',
    tagline: 'Croquettes sans céréales · Made in France',
    mascot: '🐕',
  },
  copy: { clubName: 'Club Croquin', pointsName: 'points' },
};
