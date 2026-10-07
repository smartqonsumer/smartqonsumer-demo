import { Barlow_Condensed, Source_Sans_3 } from 'next/font/google';

// Free equivalents of the condensed-title / humanist-text pairing of the brand universe.
// Self-hosted at build time by next/font (no request to Google from the visitor).
export const titleFont = Barlow_Condensed({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-club-title',
  display: 'swap',
});

export const textFont = Source_Sans_3({
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  variable: '--font-club-text',
  display: 'swap',
});
