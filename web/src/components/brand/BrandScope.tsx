import type { CSSProperties, ReactNode } from 'react';
import { getTheme, themeFontClasses, themeVariables } from '@/lib/brand/theme';

/** Applies a brand theme (CSS variables, fonts, title style) to everything inside it. */
export function BrandScope({ preset, children }: { preset?: string; children: ReactNode }) {
  const theme = getTheme(preset);
  return (
    <div
      data-brand={theme.slug}
      data-club-type={theme.typography}
      className={`${themeFontClasses(theme)} flex min-h-screen flex-col bg-club-background font-club-text text-club-text antialiased`}
      style={themeVariables(theme) as CSSProperties}
    >
      {children}
    </div>
  );
}
