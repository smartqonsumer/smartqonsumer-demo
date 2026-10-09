import { Barlow_Condensed, Cormorant_Garamond, Nunito_Sans, Source_Sans_3 } from 'next/font/google';

// Free font pairings available to the brand themes (each theme picks one title and one
// text font, see BrandTheme.fonts). Self-hosted at build time by next/font (no request to
// Google from the visitor); a font only downloads on the pages whose theme uses it.

/** Condensed-title / humanist-text pairing (Croquin). */
export const barlowCondensed = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-barlow-condensed',
  display: 'swap',
});

export const sourceSans = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-source-sans',
  display: 'swap',
});

/** Classic serif titles / soft sans text pairing (Maison de la Croquette). */
export const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  variable: '--font-cormorant',
  display: 'swap',
});

export const nunitoSans = Nunito_Sans({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-nunito-sans',
  display: 'swap',
});

export const FONTS = {
  barlowCondensed: { font: barlowCondensed, stack: 'var(--font-barlow-condensed), "Arial Narrow", sans-serif' },
  sourceSans: { font: sourceSans, stack: 'var(--font-source-sans), Arial, sans-serif' },
  cormorant: { font: cormorant, stack: 'var(--font-cormorant), Georgia, "Times New Roman", serif' },
  nunitoSans: { font: nunitoSans, stack: 'var(--font-nunito-sans), Arial, sans-serif' },
} as const;

export type FontKey = keyof typeof FONTS;
