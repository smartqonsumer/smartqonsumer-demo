import { test, expect } from '@playwright/test';
import { legalConfig } from '../../src/lib/site-config';

const LEGAL_PAGES = [
  ['/legal/mentions-legales/', 'Mentions légales'],
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

  for (const [path] of LEGAL_PAGES) {
    test(`${path} has no leftover placeholder or demo disclaimer, and gives a contact e-mail`, async ({ page }) => {
      await page.goto(path);
      const text = await page.locator('main').innerText();

      expect(text, 'placeholder such as [numéro SIRET] left in the page').not.toMatch(/\[[^\]]{2,}\]/);
      expect(text).not.toMatch(/(?:à titre|projet|dénomination) de démonstration|engagement contractuel réel/i);
      await expect(page.locator(`main a[href="mailto:${legalConfig.email}"]`).first()).toBeVisible();
    });
  }

  test('the legal notice names the publisher and the host', async ({ page }) => {
    await page.goto('/legal/mentions-legales/');
    const main = page.locator('main');
    await expect(main).toContainText(`Directeur de la publication : ${legalConfig.publisher}`);
    await expect(main).toContainText(legalConfig.host.name);
    await expect(main).toContainText(legalConfig.host.address);
  });

  test('there are no terms of sale until the company exists', async ({ page }) => {
    const response = await page.goto('/legal/cgv/');
    expect(response?.status()).toBe(404);
  });

  test('a 404 for an unknown page offers a way back home', async ({ page }) => {
    const response = await page.goto('/this-page-does-not-exist');
    expect(response?.status()).toBe(404);
    await expect(page.getByRole('link', { name: /accueil/i })).toHaveAttribute('href', '/');
  });
});
