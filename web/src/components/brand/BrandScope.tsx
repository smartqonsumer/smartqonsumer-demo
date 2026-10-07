import type { CSSProperties, ReactNode } from 'react';
import { textFont, titleFont } from '@/lib/brand/fonts';
import { getTheme, themeVariables } from '@/lib/brand/theme';

/** Applies a brand theme (CSS variables + fonts) to everything inside it. */
export function BrandScope({ preset, children }: { preset?: string; children: ReactNode }) {
  const theme = getTheme(preset);
  return (
    <div
      data-brand={theme.slug}
      className={`${titleFont.variable} ${textFont.variable} min-h-screen bg-club-background font-club-text text-club-text antialiased`}
      style={themeVariables(theme) as CSSProperties}
    >
      {children}
    </div>
  );
}
