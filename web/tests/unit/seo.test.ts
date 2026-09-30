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
  it('includes the homepage and all four legal pages', () => {
    const entries = sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain(`${siteConfig.url}/`);
    expect(urls).toContain(`${siteConfig.url}/legal/mentions-legales/`);
    expect(urls).toContain(`${siteConfig.url}/legal/cgv/`);
    expect(urls).toContain(`${siteConfig.url}/legal/confidentialite/`);
    expect(urls).toContain(`${siteConfig.url}/legal/rgpd/`);
  });

  it('gives the homepage the highest priority', () => {
    const entries = sitemap();
    const home = entries.find((entry) => entry.url === `${siteConfig.url}/`);
    const legal = entries.find((entry) => entry.url === `${siteConfig.url}/legal/rgpd/`);

    expect(home?.priority).toBe(1);
    expect(legal?.priority).toBeLessThan(1);
  });
});

describe('robots', () => {
  it('allows crawling and points to the sitemap', () => {
    const result = robots();
    expect(result.sitemap).toBe(`${siteConfig.url}/sitemap.xml`);
  });
});
