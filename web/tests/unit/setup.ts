import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest doesn't run in "globals" mode here, so Testing Library can't
// auto-detect a test framework to hook its cleanup into — do it explicitly.
afterEach(cleanup);

// jsdom doesn't implement matchMedia; components use it to respect
// prefers-reduced-motion, so stub a "no preference" response.
window.matchMedia ??= (query: string) => ({
  matches: false,
  media: query,
  onchange: null,
  addListener: () => {},
  removeListener: () => {},
  addEventListener: () => {},
  removeEventListener: () => {},
  dispatchEvent: () => false,
});

// jsdom doesn't implement IntersectionObserver either; components that use
// it for scroll-reveal / count-up effects only need it to not throw here —
// visibility-triggered behaviour itself is covered by e2e tests.
class MockIntersectionObserver implements IntersectionObserver {
  readonly root = null;
  readonly rootMargin = '';
  readonly thresholds = [];
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}
window.IntersectionObserver ??= MockIntersectionObserver;

// next/image and next/link both rely on Next.js runtime context that isn't
// present when a component is unit-tested in isolation with Vitest/jsdom.
// Swapping them for plain elements keeps these tests focused on our own
// component logic rather than Next's internals.
vi.mock('next/image', () => ({
  default: ({ priority: _priority, ...rest }: Record<string, unknown>) => React.createElement('img', rest),
}));

vi.mock('next/link', () => ({
  default: ({ href, children, ...rest }: { href: string; children: React.ReactNode }) =>
    React.createElement('a', { href, ...rest }, children),
}));
