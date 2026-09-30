import '@testing-library/jest-dom/vitest';
import React from 'react';
import { afterEach, vi } from 'vitest';
import { cleanup } from '@testing-library/react';

// Vitest doesn't run in "globals" mode here, so Testing Library can't
// auto-detect a test framework to hook its cleanup into — do it explicitly.
afterEach(cleanup);

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
