import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  // Only indexable pages: the legal pages are `noindex` (see legalPageMetadata),
  // and listing them here would send search engines contradictory signals.
  const routes = ['/'];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date('2026-09-17'),
    changeFrequency: route === '/' ? 'weekly' : 'yearly',
    priority: route === '/' ? 1 : 0.3,
  }));
}
