import { test, expect } from '@playwright/test';

const LEGAL_PAGES = [
  ['/legal/mentions-legales/', 'Mentions légales'],
  ['/legal/cgv/', 'Conditions Générales de Vente'],
  ['/legal/confidentialite/', 'Politique de confidentialité'],
  ['/legal/rgpd/', 'Informations RGPD'],
] as const;

test.describe('Legal pages', () => {
  for (const [path, heading] of LEGAL_PAGES) {
    test(`${path} renders its heading and is marked noindex`, async ({ page }) => {
      const response = await page.goto(path);
      expect(response?.status()).toBe(200);
      await expect(page.getByRole('heading', { level: 1 })).toHaveText(heading);

      const robots = await page.locator('meta[name="robots"]').getAttribute('content');
      expect(robots).toContain('noindex');
    });
  }

  test('a 404 for an unknown page offers a way back home', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('link', { name: /accueil/i })).toHaveAttribute('href', '/');
  });
});
