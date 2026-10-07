import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('shows the hero title, subtitle and video', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { level: 1 })).toContainText('Comprenez et fidélisez vos consommateurs');
    await expect(page.locator('video source')).toHaveAttribute('src', /SmartQonsumeR-home-v6\.mp4/);
  });

  test('has a title and meta description tuned for search results', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/SmartQonsumer/);

    const description = await page.locator('meta[name="description"]').getAttribute('content');
    expect(description).toBeTruthy();
    expect(description!.length).toBeLessThanOrEqual(160);
  });

  test('clicking a main nav entry scrolls to its section', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('link', { name: 'Fonctionnalités' }).first().click();
    await expect(page.locator('#features')).toBeInViewport();
  });

  test('footer links to every legal page', async ({ page }) => {
    await page.goto('/');
    for (const [name, path] of [
      ['Confidentialité', '/legal/confidentialite/'],
      ['RGPD', '/legal/rgpd/'],
      ['Mentions légales', '/legal/mentions-legales/'],
    ] as const) {
      await expect(page.getByRole('contentinfo').getByRole('link', { name, exact: true })).toHaveAttribute(
        'href',
        path,
      );
    }
  });
});
