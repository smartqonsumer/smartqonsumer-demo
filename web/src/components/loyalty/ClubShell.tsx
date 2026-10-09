'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { BrandScope } from '@/components/brand/BrandScope';
import { PawDivider } from '@/components/journeys/JourneyShell';
import { Alert, Button, focusRing } from '@/components/ui';
import { api, errorMessage } from '@/lib/api/client';
import type { LoyaltySummary } from '@/lib/api/types';
import { DEFAULT_BRAND_SLUG } from '@/lib/brand/theme';
import { useRequireMember } from '@/lib/auth/session';

const NAV = [
  { href: '/club/', label: 'Accueil', icon: 'M4 11.5 12 5l8 6.5V20h-5.5v-5h-5v5H4z' },
  { href: '/club/points/', label: 'Mes points', icon: 'm12 4 2.4 4.9 5.4.8-3.9 3.8.9 5.4-4.8-2.6-4.8 2.6.9-5.4-3.9-3.8 5.4-.8z' },
  { href: '/club/gagner/', label: 'Gagner', icon: 'M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm0-4a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0-3.2a.8.8 0 1 0 0-1.6.8.8 0 0 0 0 1.6Z' },
  { href: '/club/recompenses/', label: 'Récompenses', icon: 'M4 9.5h16V13H4zM5.5 13h13v7h-13zM12 9.5V20M12 9.5S10.8 5 8.4 5c-2.6 0-2.6 4.5 0 4.5M12 9.5S13.2 5 15.6 5c2.6 0 2.6 4.5 0 4.5' },
  { href: '/club/compte/', label: 'Compte', icon: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4.5 20a7.5 7.5 0 0 1 15 0' },
] as const;

function NavIcon({ d }: { d: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" className="h-6 w-6">
      <path d={d} />
    </svg>
  );
}

type ClubContext = {
  brand: string;
  summary: LoyaltySummary | null;
  refreshSummary: () => Promise<void>;
  ready: boolean;
};

const Context = createContext<ClubContext | null>(null);

export function useClub(): ClubContext {
  const value = useContext(Context);
  if (!value) throw new Error('useClub must be used inside <ClubShell>');
  return value;
}

/** Member area frame: one loyalty engine whatever the acquisition journey. */
export function ClubShell({ children }: { children: ReactNode }) {
  const session = useRequireMember();
  const pathname = usePathname();
  const brand = DEFAULT_BRAND_SLUG;
  const [summary, setSummary] = useState<LoyaltySummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const ready = session.status === 'authenticated';

  const refreshSummary = useCallback(async () => {
    try {
      setSummary(await api<LoyaltySummary>('/loyalty/summary', { query: { brand } }));
      setError(null);
    } catch (e) {
      setError(errorMessage(e));
    }
  }, [brand]);

  useEffect(() => {
    if (ready) void refreshSummary();
  }, [ready, refreshSummary]);

  const active = (href: string) => (href === '/club/' ? pathname === '/club' || pathname === '/club/' : pathname.startsWith(href.replace(/\/$/, '')));

  return (
    <BrandScope>
      <Context.Provider value={{ brand, summary, refreshSummary, ready }}>
        <header className="sticky top-0 z-30 border-b border-club-border bg-club-surface/95 backdrop-blur supports-[backdrop-filter]:bg-club-surface/85">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-2.5 lg:px-8 lg:py-3">
            <Link href="/club/" className={`rounded-club-sm ${focusRing}`}>
              <BrandLogo />
            </Link>
            <nav aria-label="Navigation du club" className="hidden lg:block">
              <ul className="flex items-center gap-1">
                {NAV.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active(item.href) ? 'page' : undefined}
                      className={`relative flex min-h-[48px] items-center px-4 text-sm font-semibold uppercase tracking-[0.12em] after:absolute after:inset-x-4 after:bottom-1 after:h-0.5 after:rounded-full ${
                        active(item.href) ? 'text-club-ink after:bg-club-accent' : 'text-club-muted hover:text-club-ink'
                      } ${focusRing}`}
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            {summary && (
              <Link
                href="/club/points/"
                className={`inline-flex items-center gap-1.5 rounded-full border border-club-accent/40 bg-club-accent-soft px-3.5 py-1.5 font-club-title text-lg font-bold text-club-ink ${focusRing}`}
                aria-label={`Mon solde : ${summary.balance} points`}
              >
                <svg aria-hidden="true" viewBox="0 0 24 24" className="h-4 w-4 fill-club-accent">
                  <path d="m12 3 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.3l-5.2 2.8 1-5.8-4.3-4.1 5.9-.8z" />
                </svg>
                {summary.balance} pts
              </Link>
            )}
          </div>
        </header>
        <main id="main-content" className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-6 px-4 pb-32 pt-6 lg:gap-8 lg:px-8 lg:pb-16 lg:pt-10">
          {session.status === 'error' && (
            <div className="flex flex-col gap-3">
              <Alert>Une erreur est survenue. Veuillez réessayer.</Alert>
              <Button variant="secondary" onClick={() => void session.refresh()}>
                Réessayer
              </Button>
            </div>
          )}
          {error && <Alert>{error}</Alert>}
          {children}
        </main>
        <footer className="hidden border-t border-club-border bg-club-surface lg:block">
          <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-8 py-6 text-center text-sm">
            <PawDivider />
            <nav aria-label="Informations légales" className="flex gap-6">
              <Link href="/legal/reglement-club-croquin/" className={`underline underline-offset-4 ${focusRing}`}>
                Règlement
              </Link>
              <Link href="/legal/confidentialite/" className={`underline underline-offset-4 ${focusRing}`}>
                Confidentialité
              </Link>
              <Link href="/legal/mentions-legales/" className={`underline underline-offset-4 ${focusRing}`}>
                Mentions légales
              </Link>
            </nav>
            <p className="text-club-muted">Démonstration SmartQonsumer — marque fictive</p>
          </div>
        </footer>
        <nav aria-label="Navigation du club" className="fixed inset-x-0 bottom-0 z-20 border-t border-club-border bg-club-surface pb-[env(safe-area-inset-bottom)] lg:hidden">
          <ul className="mx-auto grid max-w-xl grid-cols-5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active(item.href) ? 'page' : undefined}
                  className={`relative flex min-h-[62px] flex-col items-center justify-center gap-1 text-[0.7rem] font-semibold before:absolute before:inset-x-5 before:top-0 before:h-0.5 before:rounded-full ${
                    active(item.href) ? 'text-club-primary before:bg-club-accent' : 'text-club-muted'
                  } ${focusRing}`}
                >
                  <NavIcon d={item.icon} />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </Context.Provider>
    </BrandScope>
  );
}

/** Loads member data once the session is confirmed. */
export function useMemberData<T>(path: string, query?: Record<string, string>) {
  const { ready } = useClub();
  const [state, setState] = useState<{ status: 'loading' } | { status: 'ready'; data: T } | { status: 'error'; message: string }>({ status: 'loading' });
  const key = JSON.stringify(query ?? {});

  const load = useCallback(async () => {
    try {
      setState({ status: 'ready', data: await api<T>(path, { query: JSON.parse(key) as Record<string, string> }) });
    } catch (e) {
      setState({ status: 'error', message: errorMessage(e) });
    }
  }, [path, key]);

  useEffect(() => {
    if (ready) void load();
  }, [ready, load]);

  return { state, reload: load };
}
