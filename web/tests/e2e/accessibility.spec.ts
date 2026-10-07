import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const PAGES = ['/', '/legal/confidentialite/', '/legal/rgpd/', '/legal/mentions-legales/', '/404/'];

// WCAG 2.0 → 2.2, levels A and AA (the RGAA / EN 301 549 baseline), plus axe best practices.
const WCAG_TAGS = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'];

const VIEWPORTS = [
  { name: 'desktop', width: 1440, height: 900 },
  { name: 'mobile', width: 390, height: 844 },
] as const;

/** The Axeptio consent banner is a third-party widget we don't control; keep it out of our audits. */
async function blockConsentBanner(page: Page) {
  await page.route(/static\.axept\.io/, (route) => route.abort());
}

async function expectNoAxeViolations(page: Page) {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).exclude('#axeptio_overlay').analyze();
  const summary = results.violations.map((v) => ({
    id: v.id,
    impact: v.impact,
    help: v.help,
    targets: v.nodes.map((n) => n.target.join(' ')),
  }));
  expect(summary, JSON.stringify(summary, null, 2)).toEqual([]);
}

for (const viewport of VIEWPORTS) {
  test.describe(`Accessibility — axe (${viewport.name})`, () => {
    // Reduced motion makes every scroll-revealed block visible immediately, so
    // contrast is measured on the final rendering rather than a fading frame.
    test.use({ viewport, reducedMotion: 'reduce' });

    for (const path of PAGES) {
      test(`${path} has no WCAG 2.2 AA violations`, async ({ page }) => {
        await page.goto(path);
        await expectNoAxeViolations(page);
      });
    }

    if (viewport.name === 'mobile') {
      test('the open mobile menu has no WCAG 2.2 AA violations', async ({ page }) => {
        await page.goto('/');
        await page.getByRole('button', { name: 'Ouvrir le menu' }).click();
        await expectNoAxeViolations(page);
      });
    }
  });
}

test.describe('Accessibility — reflow at 320px (WCAG 1.4.10)', () => {
  test.use({ viewport: { width: 320, height: 640 } });

  for (const path of PAGES) {
    test(`${path} never scrolls horizontally`, async ({ page }) => {
      await page.goto(path);
      const { scrollWidth, clientWidth } = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth,
      }));
      expect(scrollWidth).toBeLessThanOrEqual(clientWidth);
    });
  }
});

test.describe('Accessibility — structure', () => {
  for (const path of PAGES) {
    test(`${path} is in French, with one h1 and one main landmark`, async ({ page }) => {
      await page.goto(path);
      await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
      await expect(page.locator('h1')).toHaveCount(1);
      await expect(page.locator('main#main-content')).toHaveCount(1);
    });
  }
});

test.describe('Accessibility — keyboard', () => {
  test.beforeEach(async ({ page }) => {
    await blockConsentBanner(page);
  });

  test('the first Tab reveals a skip link that jumps to the main content', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Tab');

    const skipLink = page.getByRole('link', { name: 'Aller au contenu principal' });
    await expect(skipLink).toBeFocused();
    await expect(skipLink).toBeInViewport();

    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(/#main-content$/);
  });

  test('every focusable element shows a visible focus indicator', async ({ page }) => {
    await page.goto('/');
    const missing: string[] = [];

    for (let i = 0; i < 60; i++) {
      await page.keyboard.press('Tab');
      const focused = await page.evaluate(() => {
        const el = document.activeElement as HTMLElement | null;
        if (!el || el === document.body) return null;
        const style = getComputedStyle(el);
        return {
          label: (el.getAttribute('aria-label') ?? el.textContent ?? el.tagName).trim().slice(0, 40),
          visible: style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) >= 2,
        };
      });
      if (!focused) break;
      if (!focused.visible) missing.push(focused.label);
    }

    expect(missing).toEqual([]);
  });

  test('a focused element is never hidden behind the fixed header', async ({ page }) => {
    await page.goto('/');
    // Tab well past the hero so the page has to scroll to the focused element.
    for (let i = 0; i < 25; i++) await page.keyboard.press('Tab');
    await page.keyboard.press('Shift+Tab');
    await page.waitForTimeout(300);

    const { headerBottom, focusedTop } = await page.evaluate(() => ({
      headerBottom: document.querySelector('header')!.getBoundingClientRect().bottom,
      focusedTop: document.activeElement!.getBoundingClientRect().top,
    }));
    expect(focusedTop).toBeGreaterThanOrEqual(headerBottom);
  });

  test('the FAQ opens with the keyboard', async ({ page }) => {
    await page.goto('/');
    const question = page.locator('#faq summary').first();
    await question.focus();
    await page.keyboard.press('Enter');
    await expect(page.locator('#faq details').first()).toHaveAttribute('open', '');
  });

  test.describe('mobile menu', () => {
    test.use({ viewport: { width: 390, height: 844 } });

    test('opens with the keyboard, closes with Escape and gives focus back to its button', async ({ page }) => {
      await page.goto('/');
      const toggle = page.getByRole('button', { name: 'Ouvrir le menu' });
      await toggle.focus();
      await page.keyboard.press('Enter');

      await expect(page.getByRole('navigation', { name: 'Navigation mobile' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Fermer le menu' })).toHaveAttribute('aria-expanded', 'true');

      await page.keyboard.press('Escape');
      await expect(page.getByRole('navigation', { name: 'Navigation mobile' })).toHaveCount(0);
      await expect(page.getByRole('button', { name: 'Ouvrir le menu' })).toBeFocused();
    });
  });
});

test.describe('Accessibility — reduced motion', () => {
  test.use({ reducedMotion: 'reduce' });

  test('turns off the hero animations and smooth scrolling', async ({ page }) => {
    await page.goto('/');
    const { heroAnimation, scrollBehavior } = await page.evaluate(() => ({
      heroAnimation: getComputedStyle(document.querySelector('#hero h1')!).animationName,
      scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
    }));
    expect(heroAnimation).toBe('none');
    expect(scrollBehavior).toBe('auto');
  });

  test('shows scroll-revealed content without waiting for a scroll', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('#faq h2')).toHaveCSS('opacity', '1');
  });
});

test.describe('Accessibility — media', () => {
  test('the autoplaying hero video can be paused (WCAG 2.2.2)', async ({ page }) => {
    await page.goto('/');
    const video = page.locator('#hero video');
    const pause = page.getByRole('button', { name: 'Mettre la vidéo en pause' });

    await pause.click();
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
    await page.getByRole('button', { name: 'Lire la vidéo' }).click();
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(false);

    // Clicking the picture itself toggles playback too, like a native player.
    await video.click();
    expect(await video.evaluate((v: HTMLVideoElement) => v.paused)).toBe(true);
  });

  // Escape is handled by the browser itself (not reproducible headless): exit with the button.
  test('the video goes fullscreen with its controls, and comes back', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Plein écran' }).click();

    await expect(page.getByRole('button', { name: 'Quitter le plein écran' })).toBeVisible();
    expect(await page.evaluate(() => document.fullscreenElement?.contains(document.querySelector('#hero video')))).toBe(true);

    await page.getByRole('button', { name: 'Quitter le plein écran' }).click();
    await expect(page.getByRole('button', { name: 'Plein écran' })).toBeVisible();
    expect(await page.evaluate(() => document.fullscreenElement)).toBeNull();
  });

  test('the soundtrack is off by default and only plays from the speaker button (WCAG 1.4.2)', async ({ page }) => {
    await page.goto('/');
    const video = page.locator('#hero video');
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);

    const soundOn = page.getByRole('button', { name: 'Activer le son' });
    await expect(soundOn).toHaveAttribute('aria-pressed', 'false');
    await soundOn.click();
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(false);

    await page.getByRole('button', { name: 'Couper le son' }).click();
    expect(await video.evaluate((v: HTMLVideoElement) => v.muted)).toBe(true);
  });
});
