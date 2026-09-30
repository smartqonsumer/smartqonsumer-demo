import type posthogJs from 'posthog-js';

declare global {
  interface Window {
    posthog?: typeof posthogJs;
  }
}

/** Fires a `nav_click` event, guarded so it's a no-op before PostHog has loaded or before consent is granted. */
export function trackNavClick(label: string, menu: 'desktop' | 'mobile'): void {
  if (typeof window !== 'undefined' && window.posthog) {
    window.posthog.capture('nav_click', { label, menu });
  }
}
