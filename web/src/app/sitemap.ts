import type { MetadataRoute } from 'next';
import { siteConfig } from '@/lib/site-config';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes = ['/', '/legal/mentions-legales/', '/legal/cgv/', '/legal/confidentialite/', '/legal/rgpd/'];

  return routes.map((route) => ({
    url: `${siteConfig.url}${route}`,
    lastModified: new Date('2026-09-17'),
    changeFrequency: route === '/' ? 'weekly' : 'yearly',
    priority: route === '/' ? 1 : 0.3,
  }));
}
