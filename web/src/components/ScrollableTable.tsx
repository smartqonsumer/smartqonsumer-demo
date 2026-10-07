import type { ReactNode } from 'react';

/**
 * Lets a wide table scroll horizontally inside its own box on small screens
 * instead of widening the page (WCAG 1.4.10). Focusable and labelled so
 * keyboard users can scroll it too.
 */
export function ScrollableTable({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="region" aria-label={label} tabIndex={0} className="overflow-x-auto">
      {children}
    </div>
  );
}
