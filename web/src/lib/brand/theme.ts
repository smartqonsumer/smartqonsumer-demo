/**
 * Multi-brand design system: SmartQonsumer core UI (components using `club-*` Tailwind
 * colours) + a BrandTheme that sets the CSS variables those colours point to.
 * A new brand = a new file in ./themes and an entry in THEMES; no component changes.
 */
import { FONTS, type FontKey } from './fonts';
import { croquinTheme } from './themes/croquin';
import { maisonCroquetteTheme } from './themes/maison-croquette';

export type BrandTheme = {
  slug: string;
  name: string;
  colors: {
    primary: string; // CTA background (≥ 4.5:1 with primaryContrast)
    primaryDark: string;
    primaryContrast: string;
    ink: string; // headings, dark surfaces
    text: string;
    muted: string; // secondary text (≥ 4.5:1 on surface)
    surface: string;
    background: string;
    accent: string; // decorative only
    accentText: string; // accent usable as text (≥ 4.5:1)
    accentSoft: string;
    gold: string;
    border: string;
  };
  radius: { sm: string; md: string; lg: string; pill: string };
  fonts: { title: FontKey; text: FontKey };
  /** Title and CTA treatment: condensed bold capitals, or serif capitals + copper rule
   * with spaced sans-serif CTAs (see globals.css, [data-club-type]). */
  typography: 'condensed' | 'serif';
  assets: {
    logoText: string;
    logoSubtext?: string;
    logoImage?: string; // monogram shown next to the wordmark (else a paw badge)
    tagline: string;
    mascot: string;
    heroImage?: string; // photo of the journey pages (banner on mobile, panel on desktop)
    heroAlt?: string;
    heroQuote?: string;
  };
  copy: { clubName: string; pointsName: string };
};

export const THEMES: Record<string, BrandTheme> = {
  croquin: croquinTheme,
  'maison-croquette': maisonCroquetteTheme,
};

/** Brand of the API (loyalty programme, campaigns). */
export const DEFAULT_BRAND_SLUG = process.env.NEXT_PUBLIC_BRAND_SLUG ?? 'croquin';

/** Look of the club; independent of the API slug so a brand can be re-skinned. */
export const DEFAULT_THEME_PRESET = process.env.NEXT_PUBLIC_BRAND_THEME ?? 'maison-croquette';

export function getTheme(preset: string | undefined = DEFAULT_THEME_PRESET): BrandTheme {
  return THEMES[preset] ?? maisonCroquetteTheme;
}

const channels = (hex: string) => {
  const value = hex.replace('#', '');
  const n = Number.parseInt(value.length === 3 ? [...value].map((c) => c + c).join('') : value, 16);
  return `${(n >> 16) & 255} ${(n >> 8) & 255} ${n & 255}`;
};

/** CSS custom properties consumed by tailwind.config.ts (`club-*` colours, radii). */
export function themeVariables(theme: BrandTheme): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const [name, hex] of Object.entries(theme.colors)) {
    vars[`--club-${name.replace(/[A-Z]/g, (c) => `-${c.toLowerCase()}`)}`] = channels(hex);
  }
  for (const [name, value] of Object.entries(theme.radius)) vars[`--club-radius-${name}`] = value;
  vars['--font-club-title'] = FONTS[theme.fonts.title].stack;
  vars['--font-club-text'] = FONTS[theme.fonts.text].stack;
  return vars;
}

/** next/font classes declaring the font families the theme uses. */
export function themeFontClasses(theme: BrandTheme): string {
  return [FONTS[theme.fonts.title].font.variable, FONTS[theme.fonts.text].font.variable].join(' ');
}
