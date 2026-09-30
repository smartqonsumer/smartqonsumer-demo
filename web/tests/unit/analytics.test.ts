import { describe, it, expect, vi, beforeEach } from 'vitest';
import { trackNavClick } from '@/lib/analytics';

describe('trackNavClick', () => {
  beforeEach(() => {
    delete window.posthog;
  });

  it('is a no-op when PostHog has not loaded yet', () => {
    expect(() => trackNavClick('Solution', 'desktop')).not.toThrow();
  });

  it('forwards the label and menu to posthog.capture', () => {
    const capture = vi.fn();
    // @ts-expect-error -- minimal PostHog stub for this test
    window.posthog = { capture };

    trackNavClick('Fonctionnalités', 'mobile');

    expect(capture).toHaveBeenCalledWith('nav_click', { label: 'Fonctionnalités', menu: 'mobile' });
  });
});
