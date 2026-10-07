import type { Metadata } from 'next';
import { siteConfig } from '@/lib/site-config';

const SHARE_IMAGE = {
  url: '/assets/SmartQonsumeR-home-v1-cover.png',
  width: 1400,
  height: 787,
  alt: "Présentation du parcours client SmartQonsumer, du scan produit à l'expérience digitale",
};

/**
 * Builds a page's canonical + Open Graph + Twitter tags. Next.js replaces (does
 * not merge) a parent's `openGraph`/`twitter` objects, so every page must pass
 * its own title, description and URL, otherwise it inherits the homepage's.
 */
export function pageMetadata({ title, description, path }: { title: string; description: string; path: string }): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: path,
      siteName: siteConfig.name,
      locale: 'fr_FR',
      type: 'website',
      images: [SHARE_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [SHARE_IMAGE.url],
    },
  };
}

/** Legal pages: reachable and followed, but kept out of search results and the sitemap. */
export function legalPageMetadata(page: { title: string; description: string; path: string }): Metadata {
  return { ...pageMetadata(page), robots: { index: false, follow: true } };
}
