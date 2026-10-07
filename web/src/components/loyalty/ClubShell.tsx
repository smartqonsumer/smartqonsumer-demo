'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { BrandLogo } from '@/components/brand/BrandLogo';
import { BrandScope } from '@/components/brand/BrandScope';
import { Alert, Button, focusRing } from '@/components/ui';
import { api, errorMessage } from '@/lib/api/client';
import type { LoyaltySummary } from '@/lib/api/types';
import { DEFAULT_BRAND_SLUG } from '@/lib/brand/theme';
import { useRequireMember } from '@/lib/auth/session';

const NAV = [
  { href: '/club/', label: 'Accueil', icon: '🏠' },
  { href: '/club/points/', label: 'Mes points', icon: '⭐' },
  { href: '/club/gagner/', label: 'Gagner', icon: '🎯' },
  { href: '/club/recompenses/', label: 'Récompenses', icon: '🎁' },
  { href: '/club/compte/', label: 'Compte', icon: '👤' },
] as const;

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
        <header className="sticky top-0 z-20 bg-club-ink">
          <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
            <Link href="/club/" className="rounded-club-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-white">
              <BrandLogo inverted />
            </Link>
            {summary && (
              <Link
                href="/club/points/"
                className="rounded-full bg-club-gold px-3 py-1.5 font-club-title text-lg font-extrabold text-club-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
                aria-label={`Mon solde : ${summary.balance} points`}
              >
                {summary.balance} pts
              </Link>
            )}
          </div>
        </header>
        <main id="main-content" className="mx-auto flex max-w-xl flex-col gap-6 px-4 pb-32 pt-6">
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
        <nav aria-label="Navigation du club" className="fixed inset-x-0 bottom-0 z-20 border-t border-club-border bg-club-surface pb-[env(safe-area-inset-bottom)]">
          <ul className="mx-auto grid max-w-xl grid-cols-5">
            {NAV.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active(item.href) ? 'page' : undefined}
                  className={`flex min-h-[60px] flex-col items-center justify-center gap-0.5 text-xs font-semibold ${
                    active(item.href) ? 'text-club-primary' : 'text-club-muted'
                  } ${focusRing}`}
                >
                  <span aria-hidden="true" className="text-xl">
                    {item.icon}
                  </span>
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
