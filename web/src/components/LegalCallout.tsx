import type { ReactNode } from 'react';

export function LegalCallout({ children }: { children: ReactNode }) {
  return (
    <div className="not-prose rounded-md border border-brand-200 bg-brand-50 p-4 text-sm leading-relaxed text-neutral-700">
      <strong className="text-neutral-950">À propos de ce document.</strong> {children}
    </div>
  );
}
