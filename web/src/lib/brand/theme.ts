/**
 * Multi-brand design system: SmartQonsumer core UI (components using `club-*` Tailwind
 * colours) + a BrandTheme that sets the CSS variables those colours point to.
 * A new brand = a new file in ./themes and an entry in THEMES; no component changes.
 */
import { croquinTheme } from './themes/croquin';

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
  assets: { logoText: string; tagline: string; mascot: string };
  copy: { clubName: string; pointsName: string };
};

export const THEMES: Record<string, BrandTheme> = { croquin: croquinTheme };

export const DEFAULT_BRAND_SLUG = process.env.NEXT_PUBLIC_BRAND_SLUG ?? 'croquin';

export function getTheme(preset: string | undefined = DEFAULT_BRAND_SLUG): BrandTheme {
  return THEMES[preset] ?? croquinTheme;
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
  return vars;
}
