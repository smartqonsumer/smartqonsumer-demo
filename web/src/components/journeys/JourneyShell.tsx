import Link from 'next/link';
import type { ReactNode } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { BrandScope } from '@/components/brand/BrandScope';
import { getTheme } from '@/lib/brand/theme';

const DEFAULT_LEGAL = {
  rules: '/legal/reglement-club-croquin/',
  privacy: '/legal/confidentialite/',
  legal_notice: '/legal/mentions-legales/',
};

/** Frame of the brand pages opened after a scan: mobile-first, brand theme, legal links. */
export function JourneyShell({
  children,
  preset,
  hero,
  legalUrls,
}: {
  children: ReactNode;
  preset?: string;
  hero?: ReactNode;
  legalUrls?: Record<string, string>;
}) {
  const theme = getTheme(preset);
  const legal = { ...DEFAULT_LEGAL, ...legalUrls };
  return (
    <BrandScope preset={preset}>
      <header className="bg-club-ink">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
          <Link href="/club/" className="rounded-club-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
            <BrandLogo preset={preset} inverted />
          </Link>
          <span className="text-right text-xs font-semibold uppercase tracking-wider text-white/80">{theme.assets.tagline}</span>
        </div>
      </header>
      {hero}
      <main id="main-content" className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-16 pt-6">
        {children}
      </main>
      <footer className="border-t border-club-border bg-club-surface">
        <nav aria-label="Informations légales" className="mx-auto flex max-w-xl flex-wrap gap-x-5 gap-y-2 px-4 py-5 text-sm text-club-muted">
          <Link href={legal.rules} className="underline underline-offset-2">
            Règlement
          </Link>
          <Link href={legal.privacy} className="underline underline-offset-2">
            Confidentialité
          </Link>
          <Link href={legal.legal_notice} className="underline underline-offset-2">
            Mentions légales
          </Link>
          <span>Démonstration SmartQonsumer — marque fictive</span>
        </nav>
      </footer>
    </BrandScope>
  );
}

export function LoadingBlock({ label }: { label: string }) {
  return (
    <div role="status" className="flex flex-col items-center gap-3 py-16 text-lg font-semibold text-club-ink">
      <span aria-hidden="true" className="h-10 w-10 animate-spin rounded-full border-4 border-club-primary border-t-transparent motion-reduce:animate-none" />
      {label}
    </div>
  );
}
