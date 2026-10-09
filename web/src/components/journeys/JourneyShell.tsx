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

const MENU = [
  { href: '/club/', label: 'Mon club' },
  { href: '/auth/connexion/', label: 'Se connecter' },
  { href: '/club-croquin-simple/', label: 'Rejoindre le club' },
] as const;

const linkFocus = 'rounded-club-sm focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-club-ink';

/**
 * Frame of the brand pages opened after a scan and of the account pages.
 * Mobile: photo banner above a single column. Desktop (lg): the brand photo becomes a
 * sticky panel beside the content column.
 */
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
  const photo = theme.assets.heroImage;

  return (
    <BrandScope preset={preset}>
      <header className="sticky top-0 z-30 border-b border-club-border bg-club-surface/95 backdrop-blur supports-[backdrop-filter]:bg-club-surface/85">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 lg:px-8 lg:py-3">
          <Link href="/club/" className={linkFocus}>
            <BrandLogo preset={preset} showTagline />
          </Link>
          <nav aria-label="Menu du club" className="hidden items-center gap-7 lg:flex">
            {MENU.map((item) => (
              <Link key={item.href} href={item.href} className={`text-sm font-semibold uppercase tracking-[0.14em] text-club-ink hover:text-club-accent-text ${linkFocus}`}>
                {item.label}
              </Link>
            ))}
          </nav>
          <details className="group relative lg:hidden">
            <summary className={`flex h-12 w-12 cursor-pointer list-none items-center justify-center text-club-ink [&::-webkit-details-marker]:hidden ${linkFocus}`}>
              <span className="sr-only">Menu</span>
              <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-7 w-7">
                <path d="M3.5 7h17M3.5 12h17M3.5 17h17" className="group-open:hidden" />
                <path d="m6 6 12 12M18 6 6 18" className="hidden group-open:block" />
              </svg>
            </summary>
            <nav aria-label="Menu du club" className="absolute right-0 top-full z-40 mt-2 w-64 rounded-club-md border border-club-border bg-club-surface p-2 shadow-xl">
              <ul>
                {[...MENU, { href: legal.rules, label: 'Règlement' }].map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={`flex min-h-[48px] items-center px-3 text-base font-semibold text-club-ink hover:bg-club-background ${linkFocus}`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
          </details>
        </div>
      </header>

      <div className={`club-journey mx-auto w-full max-w-6xl flex-1 ${photo ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,32rem)] lg:gap-14 lg:px-8 lg:py-10' : ''}`}>
        {photo && <BrandPhoto src={photo} alt={theme.assets.heroAlt ?? ''} quote={theme.assets.heroQuote} />}
        <div>
          {hero}
          <main id="main-content" className={`mx-auto flex w-full max-w-xl flex-col gap-6 px-4 pb-16 pt-6 ${photo ? 'lg:px-0 lg:pt-2' : ''}`}>
            {children}
          </main>
        </div>
      </div>

      <footer className="mt-auto border-t border-club-border bg-club-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 py-6 text-center lg:px-8">
          <PawDivider />
          <nav aria-label="Informations légales" className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-club-text">
            <Link href={legal.rules} className={`underline underline-offset-4 ${linkFocus}`}>
              Règlement
            </Link>
            <Link href={legal.privacy} className={`underline underline-offset-4 ${linkFocus}`}>
              Confidentialité
            </Link>
            <Link href={legal.legal_notice} className={`underline underline-offset-4 ${linkFocus}`}>
              Mentions légales
            </Link>
          </nav>
          <p className="text-sm text-club-muted">Démonstration SmartQonsumer — marque fictive</p>
        </div>
      </footer>
    </BrandScope>
  );
}

/** Brand photo: curved banner on mobile, tall rounded panel on desktop. */
function BrandPhoto({ src, alt, quote }: { src: string; alt: string; quote?: string }) {
  return (
    <div className="relative lg:sticky lg:top-28 lg:self-start">
      <div className="relative h-48 overflow-hidden sm:h-64 lg:h-[min(calc(100vh-10rem),40rem)] lg:rounded-club-lg lg:shadow-xl">
        {/* eslint-disable-next-line @next/next/no-img-element -- static brand photo */}
        <img src={src} alt={alt} className="h-full w-full object-cover object-[50%_18%] lg:object-[50%_32%]" />
        {quote && (
          <p className="absolute inset-x-0 bottom-0 hidden bg-gradient-to-t from-club-ink/80 to-transparent px-8 pb-8 pt-24 font-club-title text-3xl italic leading-tight text-white lg:block">
            {quote}
          </p>
        )}
        {/* Off-white curve with a copper line, as on the brand board (mobile only). */}
        <svg aria-hidden="true" viewBox="0 0 400 40" preserveAspectRatio="none" className="absolute inset-x-0 -bottom-px h-10 w-full lg:hidden">
          <path d="M0 40V22C120 2 260 2 400 26V40Z" className="fill-club-background" />
          <path d="M0 22C120 2 260 2 400 26" fill="none" strokeWidth="1.5" className="stroke-club-accent" vectorEffect="non-scaling-stroke" />
        </svg>
      </div>
    </div>
  );
}

export function PawDivider() {
  return (
    <div aria-hidden="true" className="flex w-full max-w-xs items-center gap-3">
      <span className="h-px flex-1 bg-club-accent/50" />
      <svg viewBox="0 0 24 24" className="h-5 w-5 fill-club-accent">
        <ellipse cx="12" cy="16" rx="4.6" ry="3.8" />
        <circle cx="6" cy="10.5" r="2" />
        <circle cx="9.6" cy="6.6" r="2" />
        <circle cx="14.4" cy="6.6" r="2" />
        <circle cx="18" cy="10.5" r="2" />
      </svg>
      <span className="h-px flex-1 bg-club-accent/50" />
    </div>
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
