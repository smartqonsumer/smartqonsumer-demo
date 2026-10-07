import { describe, it, expect } from 'vitest';
import { siteConfig } from '@/lib/site-config';
import sitemap from '@/app/sitemap';
import robots from '@/app/robots';

describe('SEO basics', () => {
  it('keeps the homepage <title> within a safe length for search snippets', () => {
    expect(siteConfig.title.length).toBeGreaterThan(10);
    expect(siteConfig.title.length).toBeLessThanOrEqual(60);
  });

  it('keeps the meta description within a safe length for search snippets', () => {
    expect(siteConfig.description.length).toBeGreaterThan(50);
    expect(siteConfig.description.length).toBeLessThanOrEqual(160);
  });

  it('declares an absolute, https canonical site URL', () => {
    expect(siteConfig.url).toMatch(/^https:\/\//);
    expect(siteConfig.url.endsWith('/')).toBe(false);
  });
});

describe('sitemap', () => {
  it('lists the homepage only: the legal pages are noindex and must stay out of it', () => {
    const urls = sitemap().map((entry) => entry.url);
    expect(urls).toEqual([`${siteConfig.url}/`]);
  });
});

describe('robots', () => {
  it('allows crawling and points to the sitemap', () => {
    const result = robots();
    expect(result.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });
});
